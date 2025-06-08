import { describe, expect, it } from 'vitest';
import type {
    GameConfig,
    GameResult,
    GameReward,
    GameScore,
    GameSession,
    GameState,
    MemoryGameData,
    QuizGameData,
    ReflexGameData,
} from './Game';

describe('Game Types', () => {
  describe('GameReward', () => {
    it('should have correct structure', () => {
      const reward: GameReward = {
        experience: 100,
        happiness: 20,
        energy: -10,
        coins: 50,
      };

      expect(reward.experience).toBe(100);
      expect(reward.happiness).toBe(20);
      expect(reward.energy).toBe(-10);
      expect(reward.coins).toBe(50);
    });

    it('should allow coins to be optional', () => {
      const reward: GameReward = {
        experience: 50,
        happiness: 10,
        energy: -5,
      };

      expect(reward.coins).toBeUndefined();
    });
  });

  describe('GameConfig', () => {
    it('should have correct structure', () => {
      const config: GameConfig = {
        type: 'memory',
        difficulty: 'medium',
        duration: 60,
        maxAttempts: 3,
      };

      expect(config.type).toBe('memory');
      expect(config.difficulty).toBe('medium');
      expect(config.duration).toBe(60);
      expect(config.maxAttempts).toBe(3);
    });

    it('should allow all game types', () => {
      const memoryGame: GameConfig = { type: 'memory', difficulty: 'easy', duration: 30 };
      const reflexGame: GameConfig = { type: 'reflex', difficulty: 'hard', duration: 45 };
      const quizGame: GameConfig = { type: 'quiz', difficulty: 'medium', duration: 120 };

      expect(memoryGame.type).toBe('memory');
      expect(reflexGame.type).toBe('reflex');
      expect(quizGame.type).toBe('quiz');
    });
  });

  describe('GameScore', () => {
    it('should have correct structure', () => {
      const score: GameScore = {
        points: 1500,
        accuracy: 0.85,
        timeRemaining: 30,
        combo: 5,
      };

      expect(score.points).toBe(1500);
      expect(score.accuracy).toBe(0.85);
      expect(score.timeRemaining).toBe(30);
      expect(score.combo).toBe(5);
    });
  });

  describe('GameSession', () => {
    it('should have correct structure', () => {
      const session: GameSession = {
        gameId: 'game-123',
        config: {
          type: 'memory',
          difficulty: 'easy',
          duration: 60,
        },
        status: 'playing',
        startTime: new Date(),
        score: {
          points: 0,
          accuracy: 0,
          timeRemaining: 60,
          combo: 0,
        },
        questionHistory: [],
      };

      expect(session.gameId).toBe('game-123');
      expect(session.config.type).toBe('memory');
      expect(session.status).toBe('playing');
      expect(session.questionHistory).toEqual([]);
    });
  });

  describe('GameResult', () => {
    it('should have correct structure', () => {
      const result: GameResult = {
        gameId: 'game-456',
        type: 'quiz',
        difficulty: 'hard',
        score: {
          points: 2000,
          accuracy: 0.9,
          timeRemaining: 15,
          combo: 8,
        },
        reward: {
          experience: 200,
          happiness: 30,
          energy: -15,
        },
        completedAt: new Date(),
        success: true,
      };

      expect(result.gameId).toBe('game-456');
      expect(result.type).toBe('quiz');
      expect(result.success).toBe(true);
      expect(result.score.points).toBe(2000);
    });
  });

  describe('MemoryGameData', () => {
    it('should have correct structure', () => {
      const memoryData: MemoryGameData = {
        sequence: ['red', 'blue', 'green'],
        playerSequence: ['red', 'blue'],
        currentStep: 2,
        colors: ['red', 'blue', 'green', 'yellow'],
      };

      expect(memoryData.sequence).toEqual(['red', 'blue', 'green']);
      expect(memoryData.playerSequence).toEqual(['red', 'blue']);
      expect(memoryData.currentStep).toBe(2);
      expect(memoryData.colors.length).toBe(4);
    });
  });

  describe('ReflexGameData', () => {
    it('should have correct structure', () => {
      const reflexData: ReflexGameData = {
        targetTime: 500,
        actualTime: 420,
        stimulus: 'green-light',
        showTime: new Date(),
      };

      expect(reflexData.targetTime).toBe(500);
      expect(reflexData.actualTime).toBe(420);
      expect(reflexData.stimulus).toBe('green-light');
      expect(reflexData.showTime).toBeInstanceOf(Date);
    });
  });

  describe('QuizGameData', () => {
    it('should have correct structure', () => {
      const quizData: QuizGameData = {
        question: 'What is the best way to make your pet happy?',
        options: ['Feed', 'Play', 'Rest', 'All of the above'],
        correctAnswer: 3,
        explanation: 'All activities contribute to pet happiness',
        category: 'pet',
      };

      expect(quizData.question).toContain('pet happy');
      expect(quizData.options.length).toBe(4);
      expect(quizData.correctAnswer).toBe(3);
      expect(quizData.category).toBe('pet');
    });
  });

  describe('GameState', () => {
    it('should have correct structure', () => {
      const gameState: GameState = {
        currentSession: null,
        availableGames: [
          { type: 'memory', difficulty: 'easy', duration: 30 },
          { type: 'reflex', difficulty: 'medium', duration: 45 },
        ],
        recentResults: [],
        totalGamesPlayed: 0,
        totalExperienceEarned: 0,
        bestScores: {},
      };

      expect(gameState.currentSession).toBeNull();
      expect(gameState.availableGames.length).toBe(2);
      expect(gameState.totalGamesPlayed).toBe(0);
      expect(gameState.bestScores).toEqual({});
    });
  });
});
