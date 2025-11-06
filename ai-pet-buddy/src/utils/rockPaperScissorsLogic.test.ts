/**
 * じゃんけんロジックのテスト
 */

import { describe, it, expect, vi } from 'vitest';
import {
  determineWinner,
  generateAIChoice,
  calculateScore,
  calculateReward,
  getChoiceIcon,
  getChoiceName,
  getResultMessage,
  type Choice,
} from './rockPaperScissorsLogic';

describe('rockPaperScissorsLogic', () => {
  describe('determineWinner', () => {
    it('should return draw when choices are the same', () => {
      expect(determineWinner('rock', 'rock')).toBe('draw');
      expect(determineWinner('paper', 'paper')).toBe('draw');
      expect(determineWinner('scissors', 'scissors')).toBe('draw');
    });

    it('should return win when player wins', () => {
      expect(determineWinner('rock', 'scissors')).toBe('win');
      expect(determineWinner('paper', 'rock')).toBe('win');
      expect(determineWinner('scissors', 'paper')).toBe('win');
    });

    it('should return lose when player loses', () => {
      expect(determineWinner('rock', 'paper')).toBe('lose');
      expect(determineWinner('paper', 'scissors')).toBe('lose');
      expect(determineWinner('scissors', 'rock')).toBe('lose');
    });
  });

  describe('generateAIChoice', () => {
    it('should return a valid choice', () => {
      const validChoices: Choice[] = ['rock', 'paper', 'scissors'];
      const choice = generateAIChoice();
      expect(validChoices).toContain(choice);
    });

    it('should generate different choices over multiple calls', () => {
      // Mock Math.random to test different outcomes
      const choices = new Set<Choice>();

      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.1) // rock
        .mockReturnValueOnce(0.4) // paper
        .mockReturnValueOnce(0.8); // scissors

      choices.add(generateAIChoice());
      choices.add(generateAIChoice());
      choices.add(generateAIChoice());

      expect(choices.size).toBeGreaterThan(1);
    });
  });

  describe('calculateScore', () => {
    it('should calculate correct base scores for wins', () => {
      expect(calculateScore('win', 0, 'easy')).toBe(100);
      expect(calculateScore('win', 0, 'medium')).toBe(150);
      expect(calculateScore('win', 0, 'hard')).toBe(200);
    });

    it('should calculate correct base scores for draws', () => {
      expect(calculateScore('draw', 0, 'easy')).toBe(25);
      expect(calculateScore('draw', 0, 'medium')).toBe(35);
      expect(calculateScore('draw', 0, 'hard')).toBe(50);
    });

    it('should calculate correct base scores for losses', () => {
      expect(calculateScore('lose', 0, 'easy')).toBe(10);
      expect(calculateScore('lose', 0, 'medium')).toBe(15);
      expect(calculateScore('lose', 0, 'hard')).toBe(20);
    });

    it('should add consecutive bonus correctly', () => {
      expect(calculateScore('win', 3, 'easy')).toBe(100 + 75); // 100 + (3 * 25)
      expect(calculateScore('draw', 2, 'medium')).toBe(35 + 50); // 35 + (2 * 25)
    });
  });

  describe('calculateReward', () => {
    it('should calculate correct rewards for wins', () => {
      const reward = calculateReward('win', 0, 'easy');
      expect(reward.experience).toBe(75);
      expect(reward.happiness).toBe(10);
      expect(reward.energy).toBe(-3);
      expect(reward.coins).toBe(1);
    });

    it('should calculate correct rewards for draws', () => {
      const reward = calculateReward('draw', 0, 'medium');
      expect(reward.experience).toBe(35);
      expect(reward.happiness).toBe(4);
      expect(reward.energy).toBe(-1);
      expect(reward.coins).toBe(0);
    });

    it('should calculate correct rewards for losses', () => {
      const reward = calculateReward('lose', 0, 'hard');
      expect(reward.experience).toBe(30);
      expect(reward.happiness).toBe(3);
      expect(reward.energy).toBe(-1);
      expect(reward.coins).toBe(0);
    });

    it('should add consecutive bonus to experience', () => {
      const reward = calculateReward('win', 5, 'easy');
      const expectedBonus = Math.floor(5 * 0.2 * 75); // 75
      expect(reward.experience).toBe(75 + expectedBonus);
    });

    it('should give bonus coins for consecutive wins', () => {
      expect(calculateReward('win', 0, 'easy').coins).toBe(1);
      expect(calculateReward('win', 1, 'easy').coins).toBe(1);
      expect(calculateReward('win', 2, 'easy').coins).toBe(2);
      expect(calculateReward('win', 3, 'easy').coins).toBe(2);
      expect(calculateReward('win', 4, 'easy').coins).toBe(3);
    });
  });

  describe('getChoiceIcon', () => {
    it('should return correct icons for each choice', () => {
      expect(getChoiceIcon('rock')).toBe('✊');
      expect(getChoiceIcon('paper')).toBe('✋');
      expect(getChoiceIcon('scissors')).toBe('✌️');
    });
  });

  describe('getChoiceName', () => {
    it('should return correct Japanese names for each choice', () => {
      expect(getChoiceName('rock')).toBe('グー');
      expect(getChoiceName('paper')).toBe('パー');
      expect(getChoiceName('scissors')).toBe('チョキ');
    });
  });

  describe('getResultMessage', () => {
    it('should return correct messages for each result', () => {
      expect(getResultMessage('win')).toBe('あなたの勝ち！');
      expect(getResultMessage('lose')).toBe('あなたの負け...');
      expect(getResultMessage('draw')).toBe('あいこ！');
    });
  });
});
