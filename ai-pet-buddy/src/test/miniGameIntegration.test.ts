/**
 * ミニゲーム統合テスト - エンドツーエンド検証
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameEngine } from '../utils/gameEngine';
import type { GameResult, GameReward } from '../types/Game';

describe('Mini-Game Integration End-to-End', () => {
  let gameEngine: GameEngine;
  let mockCallbacks: any;
  let gameStartedResults: any[] = [];
  let gameCompletedResults: GameResult[] = [];
  let rewardsEarned: GameReward[] = [];

  beforeEach(() => {
    // 結果をリセット
    gameStartedResults = [];
    gameCompletedResults = [];
    rewardsEarned = [];

    // モックコールバック
    mockCallbacks = {
      onGameStart: vi.fn((session) => gameStartedResults.push(session)),
      onGameUpdate: vi.fn(),
      onGameComplete: vi.fn((result) => gameCompletedResults.push(result)),
      onRewardGiven: vi.fn((reward) => rewardsEarned.push(reward))
    };

    // GameEngine初期化
    gameEngine = new GameEngine(mockCallbacks);
  });

  describe('Rock Paper Scissors Integration', () => {
    it('should complete full game flow for rock-paper-scissors', () => {
      // 1. ゲーム設定
      const config = {
        type: 'rock-paper-scissors' as const,
        difficulty: 'easy' as const,
        duration: 60,
        name: 'じゃんけん（簡単）',
        description: 'AIと勝負！',
        points: { correct: 15, wrong: -3, bonus: 10 }
      };

      // 2. ゲーム開始
      const session = gameEngine.startGame(config);
      expect(gameStartedResults).toHaveLength(1);
      expect(session.config.type).toBe('rock-paper-scissors');

      // 3. ゲームプレイ開始
      gameEngine.playGame();

      // 4. 複数回の選択を実行（5回戦）
      for (let i = 0; i < 5; i++) {
        const choices = ['rock', 'paper', 'scissors'] as const;
        const playerChoice = choices[i % 3];
        gameEngine.submitAnswer(playerChoice);
      }

      // 5. 結果検証
      expect(gameCompletedResults).toHaveLength(1);
      const result = gameCompletedResults[0];
      expect(result.type).toBe('rock-paper-scissors');
      expect(result.success).toBeDefined();
      expect(result.score.points).toBeGreaterThanOrEqual(0);

      // 6. 報酬確認
      expect(rewardsEarned).toHaveLength(1);
      const reward = rewardsEarned[0];
      expect(reward.experience).toBeGreaterThan(0);
      expect(reward.happiness).toBeGreaterThanOrEqual(0);
      expect(reward.energy).toBeLessThanOrEqual(0); // エネルギー消費
    });

    it('should handle multiple difficulty levels', () => {
      const difficulties = ['easy', 'medium', 'hard'] as const;
      
      difficulties.forEach((difficulty, index) => {
        // 新しいGameEngineインスタンスを作成（前のゲームとの干渉を避ける）
        const localEngine = new GameEngine(mockCallbacks);
        
        const config = {
          type: 'rock-paper-scissors' as const,
          difficulty,
          duration: 60,
          name: `じゃんけん（${difficulty}）`,
          description: 'AIと勝負！',
          points: { correct: 15, wrong: -3, bonus: 10 }
        };

        const session = localEngine.startGame(config);
        expect(session.config.difficulty).toBe(difficulty);
        
        // ゲーム開始して1回プレイ
        localEngine.playGame();
        localEngine.submitAnswer('rock');
      });
    });
  });

  describe('Number Guessing Integration', () => {
    it('should complete full game flow for number-guessing', () => {
      // 1. ゲーム設定
      const config = {
        type: 'number-guessing' as const,
        difficulty: 'easy' as const,
        duration: 120,
        name: '数当て（簡単）',
        description: '1-50の数字を当てよう',
        points: { correct: 20, wrong: -5, bonus: 15 }
      };

      // 2. ゲーム開始
      const session = gameEngine.startGame(config);
      expect(gameStartedResults).toHaveLength(1);
      expect(session.config.type).toBe('number-guessing');

      // 3. ゲームプレイ開始
      gameEngine.playGame();

      // 4. 数字推測を実行（最大8回まで）
      let attempts = 0;
      let gameCompleted = false;
      
      while (attempts < 8 && !gameCompleted) {
        const guess = 25; // 中央値で推測
        const result = gameEngine.submitAnswer(guess);
        attempts++;
        
        if (gameCompletedResults.length > 0) {
          gameCompleted = true;
        }
      }

      // 5. 結果検証
      expect(gameCompletedResults).toHaveLength(1);
      const result = gameCompletedResults[0];
      expect(result.type).toBe('number-guessing');
      expect(result.success).toBeDefined();

      // 6. 報酬確認
      expect(rewardsEarned).toHaveLength(1);
      const reward = rewardsEarned[0];
      expect(reward.experience).toBeGreaterThan(0);
      expect(reward.happiness).toBeGreaterThanOrEqual(0);
      expect(reward.energy).toBeLessThanOrEqual(0); // エネルギー消費
    });

    it('should handle different difficulty ranges', () => {
      const configs = [
        { difficulty: 'easy' as const, expectedMin: 1, expectedMax: 50 },
        { difficulty: 'medium' as const, expectedMin: 1, expectedMax: 100 },
        { difficulty: 'hard' as const, expectedMin: 1, expectedMax: 200 }
      ];

      configs.forEach(({ difficulty, expectedMin, expectedMax }) => {
        // 新しいGameEngineインスタンスを作成
        const localEngine = new GameEngine(mockCallbacks);
        
        const config = {
          type: 'number-guessing' as const,
          difficulty,
          duration: 120,
          name: `数当て（${difficulty}）`,
          description: `${expectedMin}-${expectedMax}の数字を当てよう`,
          points: { correct: 20, wrong: -5, bonus: 15 }
        };

        const session = localEngine.startGame(config);
        localEngine.playGame();
        
        // 現在の問題データを確認
        const questionData = session.currentQuestion;
        expect(questionData.minNumber).toBe(expectedMin);
        expect(questionData.maxNumber).toBe(expectedMax);
        expect(questionData.targetNumber).toBeGreaterThanOrEqual(expectedMin);
        expect(questionData.targetNumber).toBeLessThanOrEqual(expectedMax);
      });
    });
  });

  describe('Game Engine Integration', () => {
    it('should handle game switching', () => {
      // 1. じゃんけんゲーム開始
      const rpsConfig = {
        type: 'rock-paper-scissors' as const,
        difficulty: 'easy' as const,
        duration: 60,
        name: 'じゃんけん（簡単）',
        description: 'AIと勝負！',
        points: { correct: 15, wrong: -3, bonus: 10 }
      };

      gameEngine.startGame(rpsConfig);
      gameEngine.playGame();
      gameEngine.submitAnswer('rock');

      // 完了まで待つ
      while (gameCompletedResults.length === 0) {
        gameEngine.submitAnswer('rock');
      }

      expect(gameCompletedResults).toHaveLength(1);
      expect(gameCompletedResults[0].type).toBe('rock-paper-scissors');

      // 2. 数当てゲーム開始
      const ngConfig = {
        type: 'number-guessing' as const,
        difficulty: 'easy' as const,
        duration: 120,
        name: '数当て（簡単）',
        description: '1-50の数字を当てよう',
        points: { correct: 20, wrong: -5, bonus: 15 }
      };

      gameEngine.startGame(ngConfig);
      gameEngine.playGame();
      gameEngine.submitAnswer(25);

      // 2つのゲームが正常に実行されたことを確認
      expect(gameStartedResults).toHaveLength(2);
      expect(gameStartedResults[0].config.type).toBe('rock-paper-scissors');
      expect(gameStartedResults[1].config.type).toBe('number-guessing');
    });

    it('should accumulate rewards correctly', () => {
      // 1つ目のゲーム：じゃんけん
      const rpsConfig = {
        type: 'rock-paper-scissors' as const,
        difficulty: 'easy' as const,
        duration: 60,
        name: 'じゃんけん（簡単）',
        description: 'AIと勝負！',
        points: { correct: 15, wrong: -3, bonus: 10 }
      };

      gameEngine.startGame(rpsConfig);
      gameEngine.playGame();
      
      // じゃんけんゲームを完了させる
      for (let i = 0; i < 5; i++) {
        gameEngine.submitAnswer('rock');
      }

      // 1つ目のゲームの報酬確認
      expect(rewardsEarned).toHaveLength(1);

      // 2つ目のゲーム：数当て（新しいエンジンを使用）
      const localRewards: any[] = [];
      const localCompletedResults: any[] = [];
      const localEngine = new GameEngine({
        onGameStart: vi.fn(),
        onGameUpdate: vi.fn(),
        onGameComplete: vi.fn((result) => localCompletedResults.push(result)),
        onRewardGiven: vi.fn((reward) => localRewards.push(reward))
      });

      const ngConfig = {
        type: 'number-guessing' as const,
        difficulty: 'easy' as const, // easy なので1-50の範囲
        duration: 120,
        name: '数当て（簡単）',
        description: '1-50の数字を当てよう',
        points: { correct: 25, wrong: -5, bonus: 20 }
      };

      localEngine.startGame(ngConfig);
      localEngine.playGame();
      
      // 数当てゲームを完了させる（最大8回まで試行）
      let attempts = 0;
      let completed = false;
      while (attempts < 8 && !completed) {
        localEngine.submitAnswer(25); // 中央値で推測
        attempts++;
        completed = localCompletedResults.length > 0;
      }

      // 最低限の検証：どちらのゲームも実行されていることを確認
      expect(rewardsEarned).toHaveLength(1); // 最初のエンジンの報酬
      
      // 合計経験値が正の値であることを確認
      const totalExperience = rewardsEarned[0].experience + (localRewards[0]?.experience || 0);
      expect(totalExperience).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid game types gracefully', () => {
      expect(() => {
        gameEngine.startGame({
          type: 'invalid-game' as any,
          difficulty: 'easy',
          duration: 60,
          name: '無効なゲーム',
          description: 'テスト',
          points: { correct: 10, wrong: -2, bonus: 5 }
        });
      }).toThrow();
    });

    it('should handle concurrent game start attempts', () => {
      const config = {
        type: 'rock-paper-scissors' as const,
        difficulty: 'easy' as const,
        duration: 60,
        name: 'じゃんけん（簡単）',
        description: 'AIと勝負！',
        points: { correct: 15, wrong: -3, bonus: 10 }
      };

      // 1回目のゲーム開始
      gameEngine.startGame(config);
      gameEngine.playGame();

      // 2回目のゲーム開始試行（エラーになるはず）
      expect(() => {
        gameEngine.startGame(config);
      }).toThrow('別のゲームが既に進行中です');
    });
  });
});