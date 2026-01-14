import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  GameEngineCallbacks,
  GameResult,
  GameReward,
  GameSession,
} from '../types/Game';
import { GameEngine } from './gameEngine';

describe('GameEngine', () => {
  let gameEngine: GameEngine;
  let mockCallbacks: GameEngineCallbacks;
  let capturedEvents: {
    gameStart: GameSession[];
    gameUpdate: GameSession[];
    gameComplete: GameResult[];
    rewardGiven: GameReward[];
  };

  beforeEach(() => {
    capturedEvents = {
      gameStart: [],
      gameUpdate: [],
      gameComplete: [],
      rewardGiven: [],
    };

    mockCallbacks = {
      onGameStart: vi.fn((session: GameSession) => {
        capturedEvents.gameStart.push(session);
      }),
      onGameUpdate: vi.fn((session: GameSession) => {
        capturedEvents.gameUpdate.push(session);
      }),
      onGameComplete: vi.fn((result: GameResult) => {
        capturedEvents.gameComplete.push(result);
      }),
      onRewardGiven: vi.fn((reward: GameReward) => {
        capturedEvents.rewardGiven.push(reward);
      }),
    };

    gameEngine = new GameEngine(mockCallbacks);
  });

  describe('初期化', () => {
    it('初期状態が正しく設定される', () => {
      const gameState = gameEngine.getGameState();

      expect(gameState.currentSession).toBeNull();
      expect(gameState.availableGames).toHaveLength(15); // 5 types × 3 difficulties
      expect(gameState.recentResults).toEqual([]);
      expect(gameState.totalGamesPlayed).toBe(0);
      expect(gameState.totalExperienceEarned).toBe(0);
      expect(gameState.bestScores).toEqual({});
    });

    it('利用可能なゲームが正しく設定される', () => {
      const availableGames = gameEngine.getAvailableGames();

      expect(availableGames).toHaveLength(15);
      expect(
        availableGames.some(g => g.type === 'memory' && g.difficulty === 'easy')
      ).toBe(true);
      expect(
        availableGames.some(
          g => g.type === 'reflex' && g.difficulty === 'medium'
        )
      ).toBe(true);
      expect(
        availableGames.some(g => g.type === 'quiz' && g.difficulty === 'hard')
      ).toBe(true);
      expect(
        availableGames.some(
          g => g.type === 'rock-paper-scissors' && g.difficulty === 'easy'
        )
      ).toBe(true);
      expect(
        availableGames.some(
          g => g.type === 'number-guessing' && g.difficulty === 'medium'
        )
      ).toBe(true);
    });
  });

  describe('ゲーム開始', () => {
    it('新しいゲームセッションを開始できる', () => {
      const config = {
        type: 'memory' as const,
        difficulty: 'easy' as const,
        duration: 30,
      };
      const session = gameEngine.startGame(config);

      expect(session.gameId).toMatch(/^game_\d+_[a-z0-9]+$/);
      expect(session.config).toEqual(config);
      expect(session.status).toBe('ready');
      expect(session.startTime).toBeInstanceOf(Date);
      expect(session.score.points).toBe(0);
      expect(session.score.accuracy).toBe(0);
      expect(session.score.timeRemaining).toBe(30);
      expect(session.score.combo).toBe(0);
      expect(session.currentQuestion).toBeDefined();
      expect(session.questionHistory).toEqual([]);
    });

    it('ゲーム開始時にコールバック が呼ばれる', () => {
      const config = {
        type: 'quiz' as const,
        difficulty: 'medium' as const,
        duration: 60,
      };
      gameEngine.startGame(config);

      expect(mockCallbacks.onGameStart).toHaveBeenCalledTimes(1);
      expect(capturedEvents.gameStart[0].config).toEqual(config);
    });

    it('進行中のゲームがある場合はエラーを投げる', () => {
      const config = {
        type: 'memory' as const,
        difficulty: 'easy' as const,
        duration: 30,
      };
      gameEngine.startGame(config);
      gameEngine.playGame();

      expect(() => {
        gameEngine.startGame(config);
      }).toThrow('別のゲームが既に進行中です');
    });
  });

  describe('ゲームプレイ', () => {
    it('ゲームをプレイ状態に移行できる', () => {
      const config = {
        type: 'memory' as const,
        difficulty: 'easy' as const,
        duration: 30,
      };
      gameEngine.startGame(config);
      gameEngine.playGame();

      const session = gameEngine.getCurrentSession();
      expect(session?.status).toBe('playing');
      expect(mockCallbacks.onGameUpdate).toHaveBeenCalledTimes(1);
    });

    it('セッションが存在しない場合はエラーを投げる', () => {
      expect(() => {
        gameEngine.playGame();
      }).toThrow('開始するゲームセッションがありません');
    });
  });

  describe('回答提出', () => {
    beforeEach(() => {
      const config = {
        type: 'quiz' as const,
        difficulty: 'easy' as const,
        duration: 60,
      };
      gameEngine.startGame(config);
      gameEngine.playGame();
    });

    it('正解の場合は適切に処理される', () => {
      const session = gameEngine.getCurrentSession()!;
      const correctAnswer = session.currentQuestion.correctAnswer;

      const isCorrect = gameEngine.submitAnswer(correctAnswer);

      expect(isCorrect).toBe(true);
      expect(mockCallbacks.onGameUpdate).toHaveBeenCalled();
    });

    it('不正解の場合も適切に処理される', () => {
      const session = gameEngine.getCurrentSession()!;
      const wrongAnswer = (session.currentQuestion.correctAnswer + 1) % 4;

      const isCorrect = gameEngine.submitAnswer(wrongAnswer);

      expect(isCorrect).toBe(false);
    });

    it('アクティブなセッションがない場合はエラーを投げる', () => {
      gameEngine.forceEndGame();

      expect(() => {
        gameEngine.submitAnswer(0);
      }).toThrow('アクティブなゲームセッションがありません');
    });
  });

  describe('メモリーゲーム', () => {
    it('メモリーゲームの問題が生成される', () => {
      const config = {
        type: 'memory' as const,
        difficulty: 'medium' as const,
        duration: 45,
      };
      const session = gameEngine.startGame(config);

      expect(session.currentQuestion.sequence).toBeInstanceOf(Array);
      expect(session.currentQuestion.sequence.length).toBe(5); // medium difficulty
      expect(session.currentQuestion.playerSequence).toEqual([]);
      expect(session.currentQuestion.colors).toBeInstanceOf(Array);
    });

    it('正しいシーケンスで正解判定される', () => {
      const config = {
        type: 'memory' as const,
        difficulty: 'easy' as const,
        duration: 30,
      };
      gameEngine.startGame(config);
      gameEngine.playGame();

      const session = gameEngine.getCurrentSession()!;
      const correctSequence = session.currentQuestion.sequence;

      const isCorrect = gameEngine.submitAnswer(correctSequence);
      expect(isCorrect).toBe(true);
    });

    it('間違ったシーケンスで不正解判定される', () => {
      const config = {
        type: 'memory' as const,
        difficulty: 'easy' as const,
        duration: 30,
      };
      gameEngine.startGame(config);
      gameEngine.playGame();

      const wrongSequence = ['red', 'blue', 'green'];

      const isCorrect = gameEngine.submitAnswer(wrongSequence);
      expect(isCorrect).toBe(false);
    });
  });

  describe('反射神経ゲーム', () => {
    it('反射神経ゲームの問題が生成される', () => {
      const config = {
        type: 'reflex' as const,
        difficulty: 'hard' as const,
        duration: 60,
      };
      const session = gameEngine.startGame(config);

      expect(session.currentQuestion.targetTime).toBe(500); // hard difficulty
      expect(session.currentQuestion.stimulus).toBeDefined();
      expect(session.currentQuestion.showTime).toBeInstanceOf(Date);
    });

    it('目標時間内の反応で正解判定される', () => {
      const config = {
        type: 'reflex' as const,
        difficulty: 'easy' as const,
        duration: 30,
      };
      gameEngine.startGame(config);
      gameEngine.playGame();

      const session = gameEngine.getCurrentSession()!;
      const fastReactionTime = session.currentQuestion.targetTime - 100; // 目標時間より早い

      const isCorrect = gameEngine.submitAnswer(fastReactionTime);
      expect(isCorrect).toBe(true);
    });

    it('目標時間オーバーで不正解判定される', () => {
      const config = {
        type: 'reflex' as const,
        difficulty: 'easy' as const,
        duration: 30,
      };
      gameEngine.startGame(config);
      gameEngine.playGame();

      const session = gameEngine.getCurrentSession()!;
      const slowReactionTime = session.currentQuestion.targetTime + 100; // 目標時間より遅い

      const isCorrect = gameEngine.submitAnswer(slowReactionTime);
      expect(isCorrect).toBe(false);
    });
  });

  describe('時間管理', () => {
    it('時間経過で時間残量が減る', () => {
      const config = {
        type: 'quiz' as const,
        difficulty: 'easy' as const,
        duration: 60,
      };
      gameEngine.startGame(config);
      gameEngine.playGame();

      gameEngine.updateTime(30); // 30秒経過

      const session = gameEngine.getCurrentSession()!;
      expect(session.score.timeRemaining).toBe(30);
    });

    it('時間切れでゲームが終了する', () => {
      const config = {
        type: 'quiz' as const,
        difficulty: 'easy' as const,
        duration: 60,
      };
      gameEngine.startGame(config);
      gameEngine.playGame();

      gameEngine.updateTime(60); // 60秒経過（時間切れ）

      expect(gameEngine.getCurrentSession()).toBeNull();
      expect(mockCallbacks.onGameComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('ゲーム終了', () => {
    it('強制終了が正常に動作する', () => {
      const config = {
        type: 'quiz' as const,
        difficulty: 'easy' as const,
        duration: 60,
      };
      gameEngine.startGame(config);
      gameEngine.playGame();

      gameEngine.forceEndGame();

      expect(gameEngine.getCurrentSession()).toBeNull();
      expect(mockCallbacks.onGameComplete).toHaveBeenCalledTimes(1);
    });

    it('ゲーム完了時に適切な結果が生成される', () => {
      const config = {
        type: 'quiz' as const,
        difficulty: 'medium' as const,
        duration: 90,
      };
      gameEngine.startGame(config);
      gameEngine.playGame();

      gameEngine.forceEndGame();

      const result = capturedEvents.gameComplete[0];
      expect(result.gameId).toBeDefined();
      expect(result.type).toBe('quiz');
      expect(result.difficulty).toBe('medium');
      expect(result.score).toBeDefined();
      expect(result.reward).toBeDefined();
      expect(result.completedAt).toBeInstanceOf(Date);
      expect(typeof result.success).toBe('boolean');
    });

    it('報酬が適切に計算される', () => {
      const config = {
        type: 'quiz' as const,
        difficulty: 'hard' as const,
        duration: 120,
      };
      gameEngine.startGame(config);
      gameEngine.playGame();

      gameEngine.forceEndGame();

      const reward = capturedEvents.rewardGiven[0];
      expect(reward.experience).toBeGreaterThan(0);
      expect(reward.happiness).toBeGreaterThan(0);
      expect(reward.energy).toBeLessThan(0); // エネルギー消費
      expect(typeof reward.coins).toBe('number');
    });
  });

  describe('統計情報', () => {
    it('ゲーム完了後に統計が更新される', () => {
      const config = {
        type: 'memory' as const,
        difficulty: 'easy' as const,
        duration: 30,
      };
      gameEngine.startGame(config);
      gameEngine.playGame();
      gameEngine.forceEndGame();

      const gameState = gameEngine.getGameState();
      expect(gameState.totalGamesPlayed).toBe(1);
      expect(gameState.totalExperienceEarned).toBeGreaterThan(0);
      expect(gameState.recentResults).toHaveLength(1);
    });

    it('最高スコアが記録される', () => {
      const config = {
        type: 'reflex' as const,
        difficulty: 'medium' as const,
        duration: 45,
      };
      gameEngine.startGame(config);
      gameEngine.playGame();
      gameEngine.forceEndGame();

      const bestScores = gameEngine.getBestScores();
      expect(bestScores['reflex_medium']).toBeDefined();
      expect(bestScores['reflex_medium']).toBeGreaterThanOrEqual(0);
    });

    it('最近のゲーム結果が取得できる', () => {
      const config = {
        type: 'quiz' as const,
        difficulty: 'easy' as const,
        duration: 60,
      };
      gameEngine.startGame(config);
      gameEngine.playGame();
      gameEngine.forceEndGame();

      const recentResults = gameEngine.getRecentResults();
      expect(recentResults).toHaveLength(1);
      expect(recentResults[0].type).toBe('quiz');
    });
  });

  describe('エラーハンドリング', () => {
    it('未対応のゲームタイプでエラーを投げる', () => {
      const config = {
        type: 'unknown' as 'memory',
        difficulty: 'easy' as const,
        duration: 30,
      };

      expect(() => {
        gameEngine.startGame(config);
      }).toThrow('未対応のゲームタイプ: unknown');
    });

    it('セッションなしで回答提出時にエラーを投げる', () => {
      expect(() => {
        gameEngine.submitAnswer(0);
      }).toThrow('アクティブなゲームセッションがありません');
    });
  });
});
