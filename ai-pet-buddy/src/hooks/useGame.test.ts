import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameConfig } from '../types/Game';
import { useGame } from './useGame';

describe('useGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('初期化', () => {
    it('初期状態が正しく設定される', () => {
      const { result } = renderHook(() => useGame());

      expect(result.current.gameState.currentSession).toBeNull();
      expect(result.current.gameState.totalGamesPlayed).toBe(0);
      expect(result.current.isGameActive).toBe(false);
      expect(result.current.timeElapsed).toBe(0);
      expect(result.current.availableGames).toHaveLength(15);
    });

    it('利用可能なゲームが取得できる', () => {
      const { result } = renderHook(() => useGame());

      expect(result.current.availableGames).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'memory', difficulty: 'easy' }),
          expect.objectContaining({ type: 'reflex', difficulty: 'medium' }),
          expect.objectContaining({ type: 'quiz', difficulty: 'hard' }),
        ])
      );
    });
  });

  describe('ゲーム開始', () => {
    it('ゲームを開始できる', () => {
      const { result } = renderHook(() => useGame());
      const config: GameConfig = {
        type: 'memory',
        difficulty: 'easy',
        duration: 30,
      };

      act(() => {
        result.current.startGame(config);
      });

      expect(result.current.currentSession).not.toBeNull();
      expect(result.current.currentSession?.config).toEqual(config);
      expect(result.current.currentSession?.status).toBe('ready');
    });

    it('ゲーム開始時にタイマーがリセットされる', () => {
      const { result } = renderHook(() => useGame());
      const config: GameConfig = {
        type: 'quiz',
        difficulty: 'medium',
        duration: 60,
      };

      act(() => {
        result.current.startGame(config);
      });

      expect(result.current.timeElapsed).toBe(0);
    });

    it('autoStartTimer=falseの場合、タイマーが自動開始されない', () => {
      const { result } = renderHook(() => useGame({ autoStartTimer: false }));
      const config: GameConfig = {
        type: 'memory',
        difficulty: 'easy',
        duration: 30,
      };

      act(() => {
        result.current.startGame(config);
      });

      act(() => {
        vi.advanceTimersByTime(5000); // 5秒経過
      });

      expect(result.current.timeElapsed).toBe(0);
    });
  });

  describe('ゲームプレイ', () => {
    it('ゲームをプレイ状態に移行できる', () => {
      const { result } = renderHook(() => useGame());
      const config: GameConfig = {
        type: 'reflex',
        difficulty: 'hard',
        duration: 45,
      };

      act(() => {
        result.current.startGame(config);
        result.current.playGame();
      });

      expect(result.current.isGameActive).toBe(true);
      expect(result.current.currentSession?.status).toBe('playing');
    });

    it('プレイ中にタイマーが動作する', () => {
      const { result } = renderHook(() => useGame());
      const config: GameConfig = {
        type: 'quiz',
        difficulty: 'easy',
        duration: 60,
      };

      act(() => {
        result.current.startGame(config);
        result.current.playGame();
      });

      act(() => {
        vi.advanceTimersByTime(10000); // 10秒経過
      });

      expect(result.current.timeElapsed).toBe(10);
      expect(result.current.currentSession?.score.timeRemaining).toBe(50);
    });
  });

  describe('回答提出', () => {
    it('クイズゲームで正解を提出できる', () => {
      const { result } = renderHook(() => useGame());
      const config: GameConfig = {
        type: 'quiz',
        difficulty: 'easy',
        duration: 60,
      };

      act(() => {
        result.current.startGame(config);
        result.current.playGame();
      });

      const correctAnswer =
        result.current.currentSession?.currentQuestion.correctAnswer;
      let isCorrect: boolean;

      act(() => {
        isCorrect = result.current.submitAnswer(correctAnswer);
      });

      expect(isCorrect!).toBe(true);
    });

    it('メモリーゲームで正しいシーケンスを提出できる', () => {
      const { result } = renderHook(() => useGame());
      const config: GameConfig = {
        type: 'memory',
        difficulty: 'easy',
        duration: 30,
      };

      act(() => {
        result.current.startGame(config);
        result.current.playGame();
      });

      const correctSequence =
        result.current.currentSession?.currentQuestion.sequence;
      let isCorrect: boolean;

      act(() => {
        isCorrect = result.current.submitAnswer(correctSequence);
      });

      expect(isCorrect!).toBe(true);
    });

    it('反射神経ゲームで早い反応時間を提出できる', () => {
      const { result } = renderHook(() => useGame());
      const config: GameConfig = {
        type: 'reflex',
        difficulty: 'medium',
        duration: 45,
      };

      act(() => {
        result.current.startGame(config);
        result.current.playGame();
      });

      const targetTime =
        result.current.currentSession?.currentQuestion.targetTime;
      const fastReaction = targetTime! - 100; // 目標時間より100ms早い
      let isCorrect: boolean;

      act(() => {
        isCorrect = result.current.submitAnswer(fastReaction);
      });

      expect(isCorrect!).toBe(true);
    });
  });

  describe('ゲーム終了', () => {
    it('強制終了ができる', () => {
      const { result } = renderHook(() => useGame());
      const config: GameConfig = {
        type: 'quiz',
        difficulty: 'medium',
        duration: 90,
      };

      act(() => {
        result.current.startGame(config);
        result.current.playGame();
      });

      expect(result.current.isGameActive).toBe(true);

      act(() => {
        result.current.forceEndGame();
      });

      expect(result.current.isGameActive).toBe(false);
      expect(result.current.currentSession).toBeNull();
    });

    it('時間切れで自動終了する', () => {
      const { result } = renderHook(() => useGame());
      const config: GameConfig = {
        type: 'memory',
        difficulty: 'easy',
        duration: 10,
      };

      act(() => {
        result.current.startGame(config);
        result.current.playGame();
      });

      act(() => {
        vi.advanceTimersByTime(11000); // 11秒経過（時間切れ）
      });

      expect(result.current.isGameActive).toBe(false);
      expect(result.current.currentSession).toBeNull();
    });
  });

  describe('コールバック', () => {
    it('ゲーム完了時にコールバックが呼ばれる', () => {
      const onGameComplete = vi.fn();
      const { result } = renderHook(() => useGame({ onGameComplete }));
      const config: GameConfig = {
        type: 'quiz',
        difficulty: 'easy',
        duration: 60,
      };

      act(() => {
        result.current.startGame(config);
        result.current.playGame();
        result.current.forceEndGame();
      });

      expect(onGameComplete).toHaveBeenCalledTimes(1);
      expect(onGameComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'quiz',
          difficulty: 'easy',
          score: expect.any(Object),
          reward: expect.any(Object),
        })
      );
    });

    it('報酬付与時にコールバックが呼ばれる', () => {
      const onRewardGiven = vi.fn();
      const { result } = renderHook(() => useGame({ onRewardGiven }));
      const config: GameConfig = {
        type: 'memory',
        difficulty: 'medium',
        duration: 45,
      };

      act(() => {
        result.current.startGame(config);
        result.current.playGame();
        result.current.forceEndGame();
      });

      expect(onRewardGiven).toHaveBeenCalledTimes(1);
      expect(onRewardGiven).toHaveBeenCalledWith(
        expect.objectContaining({
          experience: expect.any(Number),
          happiness: expect.any(Number),
          energy: expect.any(Number),
        })
      );
    });
  });

  describe('統計情報', () => {
    it('ゲーム完了後に統計が更新される', () => {
      const { result } = renderHook(() => useGame());
      const config: GameConfig = {
        type: 'reflex',
        difficulty: 'hard',
        duration: 30,
      };

      act(() => {
        result.current.startGame(config);
        result.current.playGame();
        result.current.forceEndGame();
      });

      expect(result.current.gameState.totalGamesPlayed).toBe(1);
      expect(result.current.gameState.totalExperienceEarned).toBeGreaterThan(0);
      expect(result.current.recentResults).toHaveLength(1);
    });

    it('最高スコアが記録される', () => {
      const { result } = renderHook(() => useGame());
      const config: GameConfig = {
        type: 'quiz',
        difficulty: 'medium',
        duration: 90,
      };

      act(() => {
        result.current.startGame(config);
        result.current.playGame();
        result.current.forceEndGame();
      });

      const bestScores = result.current.bestScores;
      expect(bestScores['quiz_medium']).toBeDefined();
      expect(bestScores['quiz_medium']).toBeGreaterThanOrEqual(0);
    });

    it('最近のゲーム結果が取得できる', () => {
      const { result } = renderHook(() => useGame());
      const config1: GameConfig = {
        type: 'memory',
        difficulty: 'easy',
        duration: 30,
      };
      const config2: GameConfig = {
        type: 'quiz',
        difficulty: 'medium',
        duration: 60,
      };

      // 1つ目のゲーム
      act(() => {
        result.current.startGame(config1);
        result.current.playGame();
        result.current.forceEndGame();
      });

      // 2つ目のゲーム
      act(() => {
        result.current.startGame(config2);
        result.current.playGame();
        result.current.forceEndGame();
      });

      const recentResults = result.current.recentResults;
      expect(recentResults).toHaveLength(2);
      expect(recentResults[0].type).toBe('quiz'); // 最新が先頭
      expect(recentResults[1].type).toBe('memory'); // 古いものが後
    });
  });

  describe('エラーハンドリング', () => {
    it('進行中のゲームがある状態で新しいゲームを開始しようとするとエラー', () => {
      const { result } = renderHook(() => useGame());
      const config: GameConfig = {
        type: 'memory',
        difficulty: 'easy',
        duration: 30,
      };

      act(() => {
        result.current.startGame(config);
        result.current.playGame();
      });

      expect(() => {
        act(() => {
          result.current.startGame(config);
        });
      }).toThrow('別のゲームが既に進行中です');
    });

    it('ゲームセッションなしで回答提出は false を返す', () => {
      const { result } = renderHook(() => useGame());

      let isCorrect: boolean;
      act(() => {
        isCorrect = result.current.submitAnswer('any answer');
      });

      expect(isCorrect!).toBe(false);
    });
  });

  describe('複数ゲーム実行', () => {
    it('複数のゲームを順番に実行できる', () => {
      const { result } = renderHook(() => useGame());
      const configs: GameConfig[] = [
        { type: 'memory', difficulty: 'easy', duration: 30 },
        { type: 'reflex', difficulty: 'medium', duration: 45 },
        { type: 'quiz', difficulty: 'hard', duration: 60 },
      ];

      configs.forEach((config, index) => {
        act(() => {
          result.current.startGame(config);
          result.current.playGame();
          result.current.forceEndGame();
        });

        expect(result.current.gameState.totalGamesPlayed).toBe(index + 1);
      });

      expect(result.current.recentResults).toHaveLength(3);
      expect(result.current.gameState.totalExperienceEarned).toBeGreaterThan(0);
    });
  });
});
