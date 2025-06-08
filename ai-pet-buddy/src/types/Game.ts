/**
 * ミニゲーム関連の型定義
 */

export type GameType = 'memory' | 'reflex' | 'quiz';

export type GameDifficulty = 'easy' | 'medium' | 'hard';

export type GameStatus = 'idle' | 'ready' | 'playing' | 'completed' | 'failed';

export interface GameReward {
  experience: number;
  happiness: number;
  energy: number;
  coins?: number;
}

export interface GameConfig {
  type: GameType;
  difficulty: GameDifficulty;
  duration: number; // ゲーム時間（秒）
  maxAttempts?: number; // 最大試行回数
}

export interface GameScore {
  points: number;
  accuracy: number; // 正答率（0-1）
  timeRemaining: number;
  combo: number; // 連続正解数
}

export interface GameResult {
  gameId: string;
  type: GameType;
  difficulty: GameDifficulty;
  score: GameScore;
  reward: GameReward;
  completedAt: Date;
  success: boolean;
}

export interface GameSession {
  gameId: string;
  config: GameConfig;
  status: GameStatus;
  startTime?: Date;
  endTime?: Date;
  score: GameScore;
  currentQuestion?: any; // ゲーム固有のデータ
  questionHistory: any[]; // 問題履歴
}

// Memory Game 用の型
export interface MemoryGameData {
  sequence: string[]; // 表示する色/パターンの順序
  playerSequence: string[]; // プレイヤーの入力順序
  currentStep: number; // 現在のステップ
  colors: string[]; // 利用可能な色
}

// Reflex Game 用の型
export interface ReflexGameData {
  targetTime: number; // 目標反応時間（ミリ秒）
  actualTime?: number; // 実際の反応時間
  stimulus: string; // 刺激の種類
  showTime: Date; // 刺激が表示された時間
}

// Quiz Game 用の型
export interface QuizGameData {
  question: string;
  options: string[];
  correctAnswer: number; // 正解のインデックス
  explanation?: string;
  category: 'pet' | 'general';
}

export interface GameState {
  currentSession: GameSession | null;
  availableGames: GameConfig[];
  recentResults: GameResult[];
  totalGamesPlayed: number;
  totalExperienceEarned: number;
  bestScores: Record<string, number>; // ゲーム別最高スコア
}

export interface GameEngineCallbacks {
  onGameStart: (session: GameSession) => void;
  onGameUpdate: (session: GameSession) => void;
  onGameComplete: (result: GameResult) => void;
  onRewardGiven: (reward: GameReward) => void;
}
