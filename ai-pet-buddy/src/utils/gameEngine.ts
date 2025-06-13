/**
 * ミニゲームエンジン - ゲームロジックと状態管理
 */

import type {
    GameConfig,
    GameDifficulty,
    GameEngineCallbacks,
    GameResult,
    GameReward,
    GameSession,
    GameState,
    GameType,
    MemoryGameData,
    NumberGuessingData,
    QuizGameData,
    ReflexGameData,
    RockPaperScissorsData
} from '../types/Game';

export class GameEngine {
  private callbacks: GameEngineCallbacks;
  private gameState: GameState;

  constructor(callbacks: GameEngineCallbacks) {
    this.callbacks = callbacks;
    this.gameState = {
      currentSession: null,
      availableGames: this.getDefaultGameConfigs(),
      recentResults: [],
      totalGamesPlayed: 0,
      totalExperienceEarned: 0,
      bestScores: {},
    };
  }

  /**
   * デフォルトのゲーム設定を取得
   */
  private getDefaultGameConfigs(): GameConfig[] {
    return [
      { type: 'memory', difficulty: 'easy', duration: 30 },
      { type: 'memory', difficulty: 'medium', duration: 45 },
      { type: 'memory', difficulty: 'hard', duration: 60 },
      { type: 'reflex', difficulty: 'easy', duration: 30 },
      { type: 'reflex', difficulty: 'medium', duration: 45 },
      { type: 'reflex', difficulty: 'hard', duration: 60 },
      { type: 'quiz', difficulty: 'easy', duration: 60 },
      { type: 'quiz', difficulty: 'medium', duration: 90 },
      { type: 'quiz', difficulty: 'hard', duration: 120 },
      { type: 'rock-paper-scissors', difficulty: 'easy', duration: 60 },
      { type: 'rock-paper-scissors', difficulty: 'medium', duration: 90 },
      { type: 'rock-paper-scissors', difficulty: 'hard', duration: 120 },
      { type: 'number-guessing', difficulty: 'easy', duration: 120 },
      { type: 'number-guessing', difficulty: 'medium', duration: 150 },
      { type: 'number-guessing', difficulty: 'hard', duration: 180 },
    ];
  }

  /**
   * 新しいゲームセッションを開始
   */
  startGame(config: GameConfig): GameSession {
    if (this.gameState.currentSession?.status === 'playing') {
      throw new Error('別のゲームが既に進行中です');
    }

    const gameId = `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const session: GameSession = {
      gameId,
      config,
      status: 'ready',
      startTime: new Date(),
      score: {
        points: 0,
        accuracy: 0,
        timeRemaining: config.duration,
        combo: 0,
      },
      questionHistory: [],
    };

    // ゲーム固有の初期化
    session.currentQuestion = this.generateQuestion(config.type, config.difficulty);

    this.gameState.currentSession = session;
    this.callbacks.onGameStart(session);

    return session;
  }

  /**
   * ゲームを開始状態に移行
   */
  playGame(): void {
    if (!this.gameState.currentSession) {
      throw new Error('開始するゲームセッションがありません');
    }

    this.gameState.currentSession.status = 'playing';
    this.callbacks.onGameUpdate(this.gameState.currentSession);
  }

  /**
   * プレイヤーの回答を処理
   */
  submitAnswer(answer: any): boolean {
    const session = this.gameState.currentSession;
    if (!session || session.status !== 'playing') {
      throw new Error('アクティブなゲームセッションがありません');
    }

    const isCorrect = this.validateAnswer(session.config.type, session.currentQuestion, answer);
    
    // スコア更新
    this.updateScore(session, isCorrect);
    
    // 履歴に追加
    session.questionHistory.push({
      question: session.currentQuestion,
      answer,
      correct: isCorrect,
      timestamp: new Date(),
    });

    // 次の問題を生成または ゲーム終了判定
    if (this.shouldContinueGame(session)) {
      session.currentQuestion = this.generateQuestion(session.config.type, session.config.difficulty);
      this.callbacks.onGameUpdate(session);
    } else {
      this.endGame(session);
    }

    return isCorrect;
  }

  /**
   * 時間経過を処理
   */
  updateTime(timeElapsed: number): void {
    const session = this.gameState.currentSession;
    if (!session || session.status !== 'playing') return;

    session.score.timeRemaining = Math.max(0, session.config.duration - timeElapsed);
    
    if (session.score.timeRemaining <= 0) {
      this.endGame(session);
    } else {
      this.callbacks.onGameUpdate(session);
    }
  }

  /**
   * ゲームを強制終了
   */
  forceEndGame(): void {
    const session = this.gameState.currentSession;
    if (!session) return;

    this.endGame(session);
  }

  /**
   * ゲームセッションを終了
   */
  private endGame(session: GameSession): void {
    session.status = 'completed';
    session.endTime = new Date();

    const result = this.createGameResult(session);
    
    // 統計を更新
    this.updateStatistics(result);
    
    // 報酬を付与
    this.callbacks.onRewardGiven(result.reward);
    
    // セッションをクリア
    this.gameState.currentSession = null;
    
    this.callbacks.onGameComplete(result);
  }

  /**
   * ゲーム結果を作成
   */
  private createGameResult(session: GameSession): GameResult {
    const success = this.calculateGameSuccess(session);
    const reward = this.calculateReward(session, success);

    return {
      gameId: session.gameId,
      type: session.config.type,
      difficulty: session.config.difficulty,
      score: session.score,
      reward,
      completedAt: new Date(),
      success,
    };
  }

  /**
   * ゲーム成功判定
   */
  private calculateGameSuccess(session: GameSession): boolean {
    const minAccuracy = session.config.difficulty === 'easy' ? 0.6 : 
                       session.config.difficulty === 'medium' ? 0.7 : 0.8;
    return session.score.accuracy >= minAccuracy;
  }

  /**
   * 報酬を計算
   */
  private calculateReward(session: GameSession, success: boolean): GameReward {
    const basereward = {
      easy: { experience: 50, happiness: 10, energy: -5 },
      medium: { experience: 100, happiness: 15, energy: -10 },
      hard: { experience: 200, happiness: 25, energy: -15 },
    };

    const base = basereward[session.config.difficulty];
    const multiplier = success ? 1.5 : 0.5;
    const accuracyBonus = session.score.accuracy;
    const comboBonus = Math.min(session.score.combo * 0.1, 1);

    return {
      experience: Math.floor(base.experience * multiplier * (1 + accuracyBonus + comboBonus)),
      happiness: Math.floor(base.happiness * multiplier),
      energy: Math.floor(base.energy * multiplier),
      coins: success ? Math.floor(session.score.points / 100) : 0,
    };
  }

  /**
   * 問題を生成
   */
  private generateQuestion(type: GameType, difficulty: GameDifficulty): any {
    switch (type) {
      case 'memory':
        return this.generateMemoryQuestion(difficulty);
      case 'reflex':
        return this.generateReflexQuestion(difficulty);
      case 'quiz':
        return this.generateQuizQuestion(difficulty);
      case 'rock-paper-scissors':
        return this.generateRockPaperScissorsQuestion(difficulty);
      case 'number-guessing':
        return this.generateNumberGuessingQuestion(difficulty);
      default:
        throw new Error(`未対応のゲームタイプ: ${type}`);
    }
  }

  /**
   * メモリーゲームの問題を生成
   */
  private generateMemoryQuestion(difficulty: GameDifficulty): MemoryGameData {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    const sequenceLength = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 8;
    
    const sequence = Array.from({ length: sequenceLength }, () => 
      colors[Math.floor(Math.random() * colors.length)]
    );

    return {
      sequence,
      playerSequence: [],
      currentStep: 0,
      colors,
    };
  }

  /**
   * 反射神経ゲームの問題を生成
   */
  private generateReflexQuestion(difficulty: GameDifficulty): ReflexGameData {
    const targetTimes = {
      easy: 1000,
      medium: 700,
      hard: 500,
    };

    const stimuli = ['green-light', 'red-light', 'sound-beep', 'flash'];
    
    return {
      targetTime: targetTimes[difficulty],
      stimulus: stimuli[Math.floor(Math.random() * stimuli.length)],
      showTime: new Date(),
    };
  }

  /**
   * クイズゲームの問題を生成
   */
  private generateQuizQuestion(difficulty: GameDifficulty): QuizGameData {
    const questions = this.getQuizQuestions(difficulty);
    return questions[Math.floor(Math.random() * questions.length)];
  }

  /**
   * クイズ問題のデータベース
   */
  private getQuizQuestions(difficulty: GameDifficulty): QuizGameData[] {
    const easyQuestions: QuizGameData[] = [
      {
        question: 'ペットが一番喜ぶのはどの行動ですか？',
        options: ['餌を与える', '一緒に遊ぶ', '休ませる', 'すべて重要'],
        correctAnswer: 3,
        explanation: 'ペットの幸福には餌、遊び、休息すべてが必要です',
        category: 'pet',
      },
      {
        question: 'ペットのエネルギーが減る原因は？',
        options: ['遊びすぎ', '餌不足', '睡眠不足', 'すべて正解'],
        correctAnswer: 3,
        explanation: 'エネルギーは様々な要因で消費され ます',
        category: 'pet',
      },
    ];

    const mediumQuestions: QuizGameData[] = [
      {
        question: 'ペットの進化に必要な条件は？',
        options: ['レベルのみ', 'ステータスのみ', 'レベルとステータス', '運のみ'],
        correctAnswer: 2,
        explanation: 'レベルと適切なステータスの両方が進化に必要です',
        category: 'pet',
      },
    ];

    const hardQuestions: QuizGameData[] = [
      {
        question: 'ペットの最適なケア戦略は？',
        options: ['定期的な餌やり', 'バランスの取れた活動', 'レベル上げ重視', '総合的なケア'],
        correctAnswer: 3,
        explanation: '健康、幸福、エネルギーのバランスが重要です',
        category: 'pet',
      },
    ];

    switch (difficulty) {
      case 'easy': return easyQuestions;
      case 'medium': return [...easyQuestions, ...mediumQuestions];
      case 'hard': return [...easyQuestions, ...mediumQuestions, ...hardQuestions];
    }
  }

  /**
   * じゃんけんゲームの問題を生成
   */
  private generateRockPaperScissorsQuestion(difficulty: GameDifficulty): RockPaperScissorsData {
    return {
      playerChoice: null,
      aiChoice: null,
      result: null,
      consecutiveWins: 0,
      totalRounds: difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7,
      currentRound: 1
    };
  }

  /**
   * 数当てゲームの問題を生成
   */
  private generateNumberGuessingQuestion(difficulty: GameDifficulty): NumberGuessingData {
    // Import difficulty settings locally to avoid circular dependency
    const settings = {
      easy: { min: 1, max: 50, maxAttempts: 8 },
      medium: { min: 1, max: 100, maxAttempts: 10 },
      hard: { min: 1, max: 200, maxAttempts: 12 }
    };

    const setting = settings[difficulty];
    const targetNumber = Math.floor(Math.random() * (setting.max - setting.min + 1)) + setting.min;

    return {
      targetNumber,
      currentGuess: null,
      attemptsLeft: setting.maxAttempts,
      hints: [],
      minNumber: setting.min,
      maxNumber: setting.max
    };
  }

  /**
   * 回答を検証
   */
  private validateAnswer(type: GameType, question: any, answer: any): boolean {
    switch (type) {
      case 'memory':
        return this.validateMemoryAnswer(question as MemoryGameData, answer);
      case 'reflex':
        return this.validateReflexAnswer(question as ReflexGameData, answer);
      case 'quiz':
        return this.validateQuizAnswer(question as QuizGameData, answer);
      case 'rock-paper-scissors':
        return this.validateRockPaperScissorsAnswer(question as RockPaperScissorsData, answer);
      case 'number-guessing':
        return this.validateNumberGuessingAnswer(question as NumberGuessingData, answer);
      default:
        return false;
    }
  }

  /**
   * メモリーゲームの回答を検証
   */
  private validateMemoryAnswer(question: MemoryGameData, answer: string[]): boolean {
    if (answer.length !== question.sequence.length) return false;
    return answer.every((color, index) => color === question.sequence[index]);
  }

  /**
   * 反射神経ゲームの回答を検証
   */
  private validateReflexAnswer(question: ReflexGameData, answer: number): boolean {
    return answer <= question.targetTime;
  }

  /**
   * クイズゲームの回答を検証
   */
  private validateQuizAnswer(question: QuizGameData, answer: number): boolean {
    return answer === question.correctAnswer;
  }

  /**
   * じゃんけんゲームの回答を検証
   */
  private validateRockPaperScissorsAnswer(_question: RockPaperScissorsData, answer: string): boolean {
    // For rock-paper-scissors, we'll determine the winner in the game logic
    // The answer validation here just confirms it's a valid choice
    const validChoices = ['rock', 'paper', 'scissors'];
    return validChoices.includes(answer);
  }

  /**
   * 数当てゲームの回答を検証
   */
  private validateNumberGuessingAnswer(question: NumberGuessingData, answer: number): boolean {
    return answer === question.targetNumber;
  }

  /**
   * スコアを更新
   */
  private updateScore(session: GameSession, isCorrect: boolean): void {
    const { score } = session;
    
    if (isCorrect) {
      score.points += this.calculatePoints(session.config.difficulty, score.timeRemaining);
      score.combo += 1;
    } else {
      score.combo = 0;
    }

    // 正答率を計算
    const totalQuestions = session.questionHistory.length + 1;
    const correctAnswers = session.questionHistory.filter(h => h.correct).length + (isCorrect ? 1 : 0);
    score.accuracy = correctAnswers / totalQuestions;
  }

  /**
   * ポイント計算
   */
  private calculatePoints(difficulty: GameDifficulty, timeRemaining: number): number {
    const basePoints = { easy: 100, medium: 200, hard: 400 };
    const timeBonus = Math.floor(timeRemaining * 10);
    return basePoints[difficulty] + timeBonus;
  }

  /**
   * ゲーム継続判定
   */
  private shouldContinueGame(session: GameSession): boolean {
    const maxQuestions = session.config.difficulty === 'easy' ? 5 : 
                        session.config.difficulty === 'medium' ? 8 : 12;
    
    return session.questionHistory.length < maxQuestions && 
           session.score.timeRemaining > 0;
  }

  /**
   * 統計を更新
   */
  private updateStatistics(result: GameResult): void {
    this.gameState.totalGamesPlayed += 1;
    this.gameState.totalExperienceEarned += result.reward.experience;
    this.gameState.recentResults.unshift(result);
    
    // 最近の結果は最大10件まで保持
    if (this.gameState.recentResults.length > 10) {
      this.gameState.recentResults = this.gameState.recentResults.slice(0, 10);
    }

    // 最高スコア更新
    const gameKey = `${result.type}_${result.difficulty}`;
    if (!this.gameState.bestScores[gameKey] || result.score.points > this.gameState.bestScores[gameKey]) {
      this.gameState.bestScores[gameKey] = result.score.points;
    }
  }

  /**
   * 現在のゲーム状態を取得
   */
  getGameState(): GameState {
    return { ...this.gameState };
  }

  /**
   * 利用可能なゲーム一覧を取得
   */
  getAvailableGames(): GameConfig[] {
    return [...this.gameState.availableGames];
  }

  /**
   * 現在のセッションを取得
   */
  getCurrentSession(): GameSession | null {
    return this.gameState.currentSession ? { ...this.gameState.currentSession } : null;
  }

  /**
   * 最近のゲーム結果を取得
   */
  getRecentResults(): GameResult[] {
    return [...this.gameState.recentResults];
  }

  /**
   * 最高スコアを取得
   */
  getBestScores(): Record<string, number> {
    return { ...this.gameState.bestScores };
  }
}
