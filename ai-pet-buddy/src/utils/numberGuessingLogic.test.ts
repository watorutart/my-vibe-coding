/**
 * 数当てゲームロジックのテスト
 */

import { describe, it, expect, vi } from 'vitest';
import {
  DIFFICULTY_SETTINGS,
  generateTargetNumber,
  evaluateGuess,
  generateHint,
  calculateScore,
  calculateReward,
  getResultMessage,
  getWarningMessage,
  validateGuess
} from './numberGuessingLogic';

describe('numberGuessingLogic', () => {
  describe('DIFFICULTY_SETTINGS', () => {
    it('should have correct settings for each difficulty', () => {
      expect(DIFFICULTY_SETTINGS.easy).toEqual({
        min: 1,
        max: 50,
        maxAttempts: 8,
        baseReward: 75
      });
      
      expect(DIFFICULTY_SETTINGS.medium).toEqual({
        min: 1,
        max: 100,
        maxAttempts: 10,
        baseReward: 100
      });
      
      expect(DIFFICULTY_SETTINGS.hard).toEqual({
        min: 1,
        max: 200,
        maxAttempts: 12,
        baseReward: 150
      });
    });
  });

  describe('generateTargetNumber', () => {
    it('should generate number within easy range', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const target = generateTargetNumber('easy');
      expect(target).toBeGreaterThanOrEqual(1);
      expect(target).toBeLessThanOrEqual(50);
      expect(target).toBe(26); // Math.floor(0.5 * 50) + 1
    });

    it('should generate number within medium range', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.7);
      const target = generateTargetNumber('medium');
      expect(target).toBeGreaterThanOrEqual(1);
      expect(target).toBeLessThanOrEqual(100);
      expect(target).toBe(71); // Math.floor(0.7 * 100) + 1
    });

    it('should generate number within hard range', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.3);
      const target = generateTargetNumber('hard');
      expect(target).toBeGreaterThanOrEqual(1);
      expect(target).toBeLessThanOrEqual(200);
      expect(target).toBe(61); // Math.floor(0.3 * 200) + 1
    });
  });

  describe('evaluateGuess', () => {
    it('should return correct when guess equals target', () => {
      expect(evaluateGuess(50, 50)).toBe('correct');
      expect(evaluateGuess(1, 1)).toBe('correct');
      expect(evaluateGuess(100, 100)).toBe('correct');
    });

    it('should return too-high when guess is higher than target', () => {
      expect(evaluateGuess(60, 50)).toBe('too-high');
      expect(evaluateGuess(101, 100)).toBe('too-high');
    });

    it('should return too-low when guess is lower than target', () => {
      expect(evaluateGuess(40, 50)).toBe('too-low');
      expect(evaluateGuess(99, 100)).toBe('too-low');
    });
  });

  describe('generateHint', () => {
    it('should return correct message for correct guess', () => {
      expect(generateHint(50, 50)).toBe('🎉 正解です！');
    });

    it('should return too-high message', () => {
      expect(generateHint(60, 50)).toBe('📉 もっと小さい数字です');
    });

    it('should return too-low message', () => {
      expect(generateHint(40, 50)).toBe('📈 もっと大きい数字です');
    });
  });

  describe('calculateScore', () => {
    it('should return low score for incorrect answer', () => {
      const score = calculateScore(5, 10, 100, false);
      expect(score).toBe(10); // 100 * 0.1
    });

    it('should calculate efficiency-based score for correct answer', () => {
      // Perfect efficiency (1 attempt)
      expect(calculateScore(1, 10, 100, true)).toBe(100); // 100 * (10/10)
      
      // 50% efficiency (6 attempts out of 10)
      expect(calculateScore(6, 10, 100, true)).toBe(50); // 100 * (5/10)
      
      // Worst efficiency (10 attempts)
      expect(calculateScore(10, 10, 100, true)).toBe(10); // 100 * (1/10)
    });
  });

  describe('calculateReward', () => {
    it('should calculate low reward for incorrect answer', () => {
      const reward = calculateReward(5, 8, 'easy', false);
      expect(reward.experience).toBe(10); // 50 * 0.2
      expect(reward.happiness).toBe(1); // 8 * 0.2
      expect(reward.energy).toBe(-2); // Math.floor(-3 * 0.5)
      expect(reward.coins).toBe(0);
    });

    it('should calculate high reward for perfect game', () => {
      const reward = calculateReward(1, 8, 'easy', true);
      // efficiency = (8-1+1)/8 = 1.0
      // efficiencyMultiplier = 0.5 + (1.0 * 1.5) = 2.0
      // perfectBonus = 1.5
      expect(reward.experience).toBe(150); // 50 * 2.0 * 1.5
      expect(reward.happiness).toBe(16); // 8 * 2.0
      expect(reward.energy).toBe(-3);
      expect(reward.coins).toBe(4); // Math.floor(75/50) + 3
    });

    it('should calculate medium reward for average performance', () => {
      const reward = calculateReward(5, 8, 'medium', true);
      // efficiency = (8-5+1)/8 = 0.5
      // efficiencyMultiplier = 0.5 + (0.5 * 1.5) = 1.25
      expect(reward.experience).toBe(93); // 75 * 1.25
      expect(reward.happiness).toBe(12); // 10 * 1.25
      expect(reward.energy).toBe(-4);
      expect(reward.coins).toBe(1); // Math.floor(62/50)
    });
  });

  describe('getResultMessage', () => {
    it('should return failure message for incorrect answer', () => {
      const message = getResultMessage(false, 8, 8, 42);
      expect(message).toBe('残念！正解は 42 でした。8回以内に当てられませんでした。');
    });

    it('should return perfect message for 1 attempt', () => {
      const message = getResultMessage(true, 1, 8, 42);
      expect(message).toBe('🎉 パーフェクト！1回で正解です！素晴らしい！');
    });

    it('should return excellent message for 2-3 attempts', () => {
      expect(getResultMessage(true, 2, 8, 42)).toBe('🎊 素晴らしい！2回で正解です！');
      expect(getResultMessage(true, 3, 8, 42)).toBe('🎊 素晴らしい！3回で正解です！');
    });

    it('should return good message for attempts <= half of max', () => {
      expect(getResultMessage(true, 4, 8, 42)).toBe('👏 良い感じ！4回で正解です！');
    });

    it('should return basic success message for more attempts', () => {
      expect(getResultMessage(true, 6, 8, 42)).toBe('✅ 正解！6回で当てました！');
    });
  });

  describe('getWarningMessage', () => {
    it('should return warning for last chance', () => {
      expect(getWarningMessage(1)).toBe('⚠️ 最後のチャンスです！');
    });

    it('should return warning for 2 attempts left', () => {
      expect(getWarningMessage(2)).toBe('⚠️ 残り2回です！');
    });

    it('should return warning for 3 attempts left', () => {
      expect(getWarningMessage(3)).toBe('💡 残り3回です。慎重に！');
    });

    it('should return null for more than 3 attempts', () => {
      expect(getWarningMessage(4)).toBeNull();
      expect(getWarningMessage(5)).toBeNull();
    });
  });

  describe('validateGuess', () => {
    it('should reject NaN values', () => {
      const result = validateGuess(NaN, 'easy');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('数字を入力してください');
    });

    it('should reject values outside easy range', () => {
      expect(validateGuess(0, 'easy').isValid).toBe(false);
      expect(validateGuess(51, 'easy').isValid).toBe(false);
      expect(validateGuess(0, 'easy').errorMessage).toBe('1〜50の範囲で入力してください');
    });

    it('should reject values outside medium range', () => {
      expect(validateGuess(0, 'medium').isValid).toBe(false);
      expect(validateGuess(101, 'medium').isValid).toBe(false);
      expect(validateGuess(101, 'medium').errorMessage).toBe('1〜100の範囲で入力してください');
    });

    it('should reject values outside hard range', () => {
      expect(validateGuess(0, 'hard').isValid).toBe(false);
      expect(validateGuess(201, 'hard').isValid).toBe(false);
      expect(validateGuess(201, 'hard').errorMessage).toBe('1〜200の範囲で入力してください');
    });

    it('should reject non-integer values', () => {
      const result = validateGuess(25.5, 'easy');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('整数を入力してください');
    });

    it('should accept valid values', () => {
      expect(validateGuess(25, 'easy').isValid).toBe(true);
      expect(validateGuess(50, 'medium').isValid).toBe(true);
      expect(validateGuess(100, 'hard').isValid).toBe(true);
    });
  });
});