/**
 * @file Achievement.test.ts
 * @description Tests for Achievement type definitions and validations
 */

import { describe, it, expect } from 'vitest';
import type {
  Badge,
  Title,
  AchievementRequirement,
  AchievementProgress,
  AchievementState,
  AchievementNotification,
  AchievementCategory,
  AchievementRarity
} from './Achievement';
import {
  DEFAULT_ACHIEVEMENT_PROGRESS,
  PREDEFINED_BADGES,
  PREDEFINED_TITLES
} from './Achievement';

describe('Achievement Types', () => {
  describe('AchievementCategory', () => {
    it('should have valid category types', () => {
      const validCategories: AchievementCategory[] = ['evolution', 'game', 'care', 'time', 'level'];
      
      validCategories.forEach(category => {
        expect(typeof category).toBe('string');
        expect(['evolution', 'game', 'care', 'time', 'level']).toContain(category);
      });
    });
  });

  describe('AchievementRarity', () => {
    it('should have valid rarity types', () => {
      const validRarities: AchievementRarity[] = ['common', 'rare', 'epic', 'legendary'];
      
      validRarities.forEach(rarity => {
        expect(typeof rarity).toBe('string');
        expect(['common', 'rare', 'epic', 'legendary']).toContain(rarity);
      });
    });
  });

  describe('AchievementRequirement', () => {
    it('should create valid requirement object', () => {
      const requirement: AchievementRequirement = {
        type: 'level_reached',
        value: 10,
        description: 'Reach level 10'
      };

      expect(requirement.type).toBe('level_reached');
      expect(requirement.value).toBe(10);
      expect(requirement.description).toBe('Reach level 10');
      expect(typeof requirement.description).toBe('string');
    });

    it('should validate requirement types', () => {
      const validTypes = [
        'evolution_count',
        'game_win_streak', 
        'consecutive_days',
        'level_reached',
        'stat_max',
        'total_games',
        'total_playtime'
      ];

      const requirement: AchievementRequirement = {
        type: 'evolution_count',
        value: 1,
        description: 'Test requirement'
      };

      expect(validTypes).toContain(requirement.type);
    });
  });

  describe('Badge', () => {
    it('should create valid badge object', () => {
      const badge: Badge = {
        id: 'test-badge',
        name: 'Test Badge',
        description: 'A test badge',
        icon: '🏆',
        category: 'game',
        rarity: 'common',
        requirements: {
          type: 'game_win_streak',
          value: 5,
          description: 'Win 5 games in a row'
        },
        unlocked: false,
        progress: 0.5
      };

      expect(badge.id).toBe('test-badge');
      expect(badge.name).toBe('Test Badge');
      expect(badge.unlocked).toBe(false);
      expect(badge.progress).toBe(0.5);
      expect(badge.progress).toBeGreaterThanOrEqual(0);
      expect(badge.progress).toBeLessThanOrEqual(1);
    });

    it('should handle unlocked badge with timestamp', () => {
      const unlockedAt = Date.now();
      const badge: Badge = {
        id: 'unlocked-badge',
        name: 'Unlocked Badge',
        description: 'Already unlocked',
        icon: '✅',
        category: 'evolution',
        rarity: 'rare',
        requirements: {
          type: 'evolution_count',
          value: 1,
          description: 'Evolve once'
        },
        unlocked: true,
        unlockedAt,
        progress: 1
      };

      expect(badge.unlocked).toBe(true);
      expect(badge.unlockedAt).toBe(unlockedAt);
      expect(badge.progress).toBe(1);
    });
  });

  describe('Title', () => {
    it('should create valid title object', () => {
      const title: Title = {
        id: 'test-title',
        name: 'Test Title',
        description: 'A test title',
        icon: '👑',
        category: 'level',
        rarity: 'epic',
        requirements: {
          type: 'level_reached',
          value: 10,
          description: 'Reach level 10'
        },
        unlocked: true,
        unlockedAt: Date.now(),
        active: true
      };

      expect(title.id).toBe('test-title');
      expect(title.name).toBe('Test Title');
      expect(title.unlocked).toBe(true);
      expect(title.active).toBe(true);
      expect(typeof title.unlockedAt).toBe('number');
    });

    it('should handle inactive unlocked title', () => {
      const title: Title = {
        id: 'inactive-title',
        name: 'Inactive Title',
        description: 'Not currently active',
        icon: '🎯',
        category: 'game',
        rarity: 'legendary',
        requirements: {
          type: 'total_games',
          value: 100,
          description: 'Play 100 games'
        },
        unlocked: true,
        unlockedAt: Date.now(),
        active: false
      };

      expect(title.unlocked).toBe(true);
      expect(title.active).toBe(false);
    });
  });

  describe('AchievementProgress', () => {
    it('should create valid progress object', () => {
      const progress: AchievementProgress = {
        evolutionCount: 3,
        maxWinStreak: 15,
        currentWinStreak: 5,
        consecutiveDays: 12,
        maxLevel: 8,
        maxHappiness: 95,
        maxEnergy: 100,
        totalGames: 50,
        totalWins: 35,
        totalPlaytime: 1200,
        lastPlayDate: Date.now(),
        firstPlayDate: Date.now() - 86400000 * 30 // 30 days ago
      };

      expect(progress.evolutionCount).toBe(3);
      expect(progress.maxWinStreak).toBe(15);
      expect(progress.currentWinStreak).toBe(5);
      expect(progress.totalWins).toBeLessThanOrEqual(progress.totalGames);
      expect(progress.lastPlayDate).toBeGreaterThan(progress.firstPlayDate);
    });

    it('should validate win rate consistency', () => {
      const progress: AchievementProgress = {
        evolutionCount: 0,
        maxWinStreak: 0,
        currentWinStreak: 0,
        consecutiveDays: 1,
        maxLevel: 5,
        maxHappiness: 80,
        maxEnergy: 90,
        totalGames: 20,
        totalWins: 12,
        totalPlaytime: 300,
        lastPlayDate: Date.now(),
        firstPlayDate: Date.now() - 86400000
      };

      expect(progress.totalWins).toBeLessThanOrEqual(progress.totalGames);
      expect(progress.totalWins / progress.totalGames).toBeCloseTo(0.6);
    });
  });

  describe('AchievementState', () => {
    it('should create valid achievement state', () => {
      const state: AchievementState = {
        badges: [],
        titles: [],
        progress: DEFAULT_ACHIEVEMENT_PROGRESS,
        newlyUnlocked: []
      };

      expect(Array.isArray(state.badges)).toBe(true);
      expect(Array.isArray(state.titles)).toBe(true);
      expect(Array.isArray(state.newlyUnlocked)).toBe(true);
      expect(state.progress).toEqual(DEFAULT_ACHIEVEMENT_PROGRESS);
    });

    it('should handle newly unlocked achievements', () => {
      const state: AchievementState = {
        badges: [],
        titles: [],
        progress: DEFAULT_ACHIEVEMENT_PROGRESS,
        newlyUnlocked: ['first-evolution', 'week-streak']
      };

      expect(state.newlyUnlocked).toHaveLength(2);
      expect(state.newlyUnlocked).toContain('first-evolution');
      expect(state.newlyUnlocked).toContain('week-streak');
    });
  });

  describe('AchievementNotification', () => {
    it('should create valid notification object', () => {
      const notification: AchievementNotification = {
        id: 'test-notification',
        type: 'badge',
        name: 'Test Achievement',
        description: 'You unlocked something!',
        icon: '🎉',
        rarity: 'rare',
        timestamp: Date.now()
      };

      expect(notification.type).toBe('badge');
      expect(['badge', 'title']).toContain(notification.type);
      expect(notification.name).toBe('Test Achievement');
      expect(typeof notification.timestamp).toBe('number');
    });
  });

  describe('DEFAULT_ACHIEVEMENT_PROGRESS', () => {
    it('should have valid default values', () => {
      expect(DEFAULT_ACHIEVEMENT_PROGRESS.evolutionCount).toBe(0);
      expect(DEFAULT_ACHIEVEMENT_PROGRESS.maxWinStreak).toBe(0);
      expect(DEFAULT_ACHIEVEMENT_PROGRESS.currentWinStreak).toBe(0);
      expect(DEFAULT_ACHIEVEMENT_PROGRESS.consecutiveDays).toBe(0);
      expect(DEFAULT_ACHIEVEMENT_PROGRESS.maxLevel).toBe(1);
      expect(DEFAULT_ACHIEVEMENT_PROGRESS.totalGames).toBe(0);
      expect(DEFAULT_ACHIEVEMENT_PROGRESS.totalWins).toBe(0);
      expect(DEFAULT_ACHIEVEMENT_PROGRESS.totalPlaytime).toBe(0);
      expect(typeof DEFAULT_ACHIEVEMENT_PROGRESS.lastPlayDate).toBe('number');
      expect(typeof DEFAULT_ACHIEVEMENT_PROGRESS.firstPlayDate).toBe('number');
    });

    it('should have logical consistency', () => {
      expect(DEFAULT_ACHIEVEMENT_PROGRESS.totalWins).toBeLessThanOrEqual(DEFAULT_ACHIEVEMENT_PROGRESS.totalGames);
      expect(DEFAULT_ACHIEVEMENT_PROGRESS.currentWinStreak).toBeLessThanOrEqual(DEFAULT_ACHIEVEMENT_PROGRESS.maxWinStreak);
      expect(DEFAULT_ACHIEVEMENT_PROGRESS.maxLevel).toBeGreaterThanOrEqual(1);
    });
  });

  describe('PREDEFINED_BADGES', () => {
    it('should have valid badge definitions', () => {
      expect(PREDEFINED_BADGES.length).toBeGreaterThan(0);
      
      PREDEFINED_BADGES.forEach(badge => {
        expect(badge.id).toBeTruthy();
        expect(badge.name).toBeTruthy();
        expect(badge.description).toBeTruthy();
        expect(badge.icon).toBeTruthy();
        expect(['evolution', 'game', 'care', 'time', 'level']).toContain(badge.category);
        expect(['common', 'rare', 'epic', 'legendary']).toContain(badge.rarity);
        expect(badge.requirements).toBeTruthy();
        expect(badge.requirements.value).toBeGreaterThan(0);
      });
    });

    it('should have unique badge IDs', () => {
      const ids = PREDEFINED_BADGES.map(badge => badge.id);
      const uniqueIds = [...new Set(ids)];
      
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('should include specific required badges', () => {
      const badgeIds = PREDEFINED_BADGES.map(badge => badge.id);
      
      expect(badgeIds).toContain('first-evolution');
      expect(badgeIds).toContain('game-master');
      expect(badgeIds).toContain('week-streak');
      expect(badgeIds).toContain('level-10');
      expect(badgeIds).toContain('happiness-max');
    });
  });

  describe('PREDEFINED_TITLES', () => {
    it('should have valid title definitions', () => {
      expect(PREDEFINED_TITLES.length).toBeGreaterThan(0);
      
      PREDEFINED_TITLES.forEach(title => {
        expect(title.id).toBeTruthy();
        expect(title.name).toBeTruthy();
        expect(title.description).toBeTruthy();
        expect(title.icon).toBeTruthy();
        expect(['evolution', 'game', 'care', 'time', 'level']).toContain(title.category);
        expect(['common', 'rare', 'epic', 'legendary']).toContain(title.rarity);
        expect(title.requirements).toBeTruthy();
        expect(title.requirements.value).toBeGreaterThan(0);
      });
    });

    it('should have unique title IDs', () => {
      const ids = PREDEFINED_TITLES.map(title => title.id);
      const uniqueIds = [...new Set(ids)];
      
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('should include specific required titles', () => {
      const titleIds = PREDEFINED_TITLES.map(title => title.id);
      
      expect(titleIds).toContain('beginner-trainer');
      expect(titleIds).toContain('veteran-trainer');
      expect(titleIds).toContain('master-trainer');
      expect(titleIds).toContain('game-master-title');
      expect(titleIds).toContain('care-master');
      expect(titleIds).toContain('evolution-master-title');
    });
  });
});