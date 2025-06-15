/**
 * @file achievementEngine.test.ts
 * @description Tests for achievement engine functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { Pet } from '../types/Pet';
import type { AchievementState, AchievementProgress } from '../types/Achievement';
import { DEFAULT_ACHIEVEMENT_PROGRESS } from '../types/Achievement';
import {
  initializeAchievementState,
  updateGameProgress,
  updateCareProgress,
  updateLevelProgress,
  updateEvolutionProgress,
  updateSessionProgress,
  checkAchievementRequirement,
  calculateAchievementProgress,
  checkAchievements,
  activateTitle,
  getAchievementSummary,
  getNextAchievements,
  type GameData,
  type CareActionData,
  type SessionData
} from './achievementEngine';

describe('AchievementEngine', () => {
  let mockPet: Pet;
  let mockProgress: AchievementProgress;
  let mockAchievementState: AchievementState;

  beforeEach(() => {
    mockPet = {
      id: 'test-pet',
      name: 'Test Pet',
      type: 'dragon',
      stats: {
        happiness: 80,
        hunger: 20,
        energy: 90,
        level: 3  // Changed to match mockProgress.maxLevel
      },
      lastUpdate: Date.now(),
      expression: 'happy',
      experience: 500
    };

    mockProgress = {
      evolutionCount: 0, // Changed to 0 to ensure first-evolution badge is not complete
      maxWinStreak: 3,   // Changed to 3 to ensure game achievements are not complete  
      currentWinStreak: 1,
      consecutiveDays: 2, // Changed to 2 to ensure week-streak is not complete
      maxLevel: 3,       // Changed to 3 to ensure level achievements are not complete
      maxHappiness: 85,  // Changed to 85 to ensure happiness-max is not complete
      maxEnergy: 90,     // Changed to 90 to ensure no stat maxed
      totalGames: 20,    // Reduced to ensure total game achievements are not complete
      totalWins: 12,
      totalPlaytime: 500, // Reduced to ensure playtime achievements are not complete
      lastPlayDate: Date.now() - 86400000, // 1 day ago
      firstPlayDate: Date.now() - 86400000 * 30 // 30 days ago
    };

    mockAchievementState = initializeAchievementState();
    mockAchievementState.progress = mockProgress;
  });

  describe('initializeAchievementState', () => {
    it('should create initial achievement state with all badges locked', () => {
      const state = initializeAchievementState();

      expect(state.badges.length).toBeGreaterThan(0);
      expect(state.titles.length).toBeGreaterThan(0);
      
      // Most badges should be locked
      const lockedBadges = state.badges.filter(badge => !badge.unlocked);
      expect(lockedBadges.length).toBe(state.badges.length);

      // All badges should have 0 progress initially
      state.badges.forEach(badge => {
        expect(badge.progress).toBe(0);
      });
    });

    it('should unlock beginner trainer title by default', () => {
      const state = initializeAchievementState();

      const beginnerTitle = state.titles.find(title => title.id === 'beginner-trainer');
      expect(beginnerTitle).toBeDefined();
      expect(beginnerTitle!.unlocked).toBe(true);
      expect(beginnerTitle!.active).toBe(true);
      expect(beginnerTitle!.unlockedAt).toBeDefined();
    });

    it('should initialize with default progress', () => {
      const state = initializeAchievementState();

      expect(state.progress).toEqual(DEFAULT_ACHIEVEMENT_PROGRESS);
      expect(state.newlyUnlocked).toEqual([]);
    });
  });

  describe('updateGameProgress', () => {
    it('should update game statistics for a win', () => {
      const gameData: GameData = {
        type: 'rock-paper-scissors',
        result: 'win',
        timestamp: Date.now(),
        duration: 60 // 1 minute
      };

      const updatedProgress = updateGameProgress(mockProgress, gameData);

      expect(updatedProgress.totalGames).toBe(mockProgress.totalGames + 1);
      expect(updatedProgress.totalWins).toBe(mockProgress.totalWins + 1);
      expect(updatedProgress.currentWinStreak).toBe(mockProgress.currentWinStreak + 1);
      expect(updatedProgress.totalPlaytime).toBe(mockProgress.totalPlaytime + 1); // 60 seconds = 1 minute
      expect(updatedProgress.lastPlayDate).toBe(gameData.timestamp);
    });

    it('should update win streak record for new high', () => {
      const gameData: GameData = {
        type: 'number-guess',
        result: 'win',
        timestamp: Date.now(),
        duration: 30
      };

      // Set current streak near max
      const progress = {
        ...mockProgress,
        currentWinStreak: 2, // Changed from 7
        maxWinStreak: 3      // Changed from 8
      };

      const updatedProgress = updateGameProgress(progress, gameData);

      expect(updatedProgress.currentWinStreak).toBe(3);
      expect(updatedProgress.maxWinStreak).toBe(3); // Still the same

      // Another win should set new record
      const updatedProgress2 = updateGameProgress(updatedProgress, gameData);
      expect(updatedProgress2.currentWinStreak).toBe(4);
      expect(updatedProgress2.maxWinStreak).toBe(4); // New record
    });

    it('should reset current win streak on loss', () => {
      const gameData: GameData = {
        type: 'rock-paper-scissors',
        result: 'lose',
        timestamp: Date.now(),
        duration: 45
      };

      const updatedProgress = updateGameProgress(mockProgress, gameData);

      expect(updatedProgress.totalGames).toBe(mockProgress.totalGames + 1);
      expect(updatedProgress.totalWins).toBe(mockProgress.totalWins); // No change
      expect(updatedProgress.currentWinStreak).toBe(0); // Reset
      expect(updatedProgress.maxWinStreak).toBe(mockProgress.maxWinStreak); // No change
    });

    it('should handle draw results', () => {
      const gameData: GameData = {
        type: 'rock-paper-scissors',
        result: 'draw',
        timestamp: Date.now(),
        duration: 30
      };

      const updatedProgress = updateGameProgress(mockProgress, gameData);

      expect(updatedProgress.totalGames).toBe(mockProgress.totalGames + 1);
      expect(updatedProgress.totalWins).toBe(mockProgress.totalWins); // No change
      expect(updatedProgress.currentWinStreak).toBe(0); // Reset (draw breaks streak)
    });
  });

  describe('updateCareProgress', () => {
    it('should update max happiness when new record is achieved', () => {
      const careData: CareActionData = {
        action: 'feed',
        timestamp: Date.now(),
        statsBefore: {
          happiness: 90,
          energy: 80,
          hunger: 40
        },
        statsAfter: {
          happiness: 100, // New max
          energy: 85,
          hunger: 20
        }
      };

      const updatedProgress = updateCareProgress(mockProgress, careData);

      expect(updatedProgress.maxHappiness).toBe(100);
      expect(updatedProgress.lastPlayDate).toBe(careData.timestamp);
    });

    it('should update max energy when new record is achieved', () => {
      const careData: CareActionData = {
        action: 'rest',
        timestamp: Date.now(),
        statsBefore: {
          happiness: 80,
          energy: 95,
          hunger: 30
        },
        statsAfter: {
          happiness: 85,
          energy: 100, // Equal to current max
          hunger: 25
        }
      };

      const updatedProgress = updateCareProgress(mockProgress, careData);

      expect(updatedProgress.maxEnergy).toBe(100); // No change, already at max
    });

    it('should not decrease max stats', () => {
      const careData: CareActionData = {
        action: 'play',
        timestamp: Date.now(),
        statsBefore: {
          happiness: 100,
          energy: 100,
          hunger: 20
        },
        statsAfter: {
          happiness: 80, // Lower than max (85)
          energy: 80,   // Lower than max (90)
          hunger: 40
        }
      };

      const updatedProgress = updateCareProgress(mockProgress, careData);

      expect(updatedProgress.maxHappiness).toBe(mockProgress.maxHappiness); // No change
      expect(updatedProgress.maxEnergy).toBe(mockProgress.maxEnergy); // No change
    });
  });

  describe('updateLevelProgress', () => {
    it('should update max level when pet levels up', () => {
      const petLevelUp = {
        ...mockPet,
        stats: {
          ...mockPet.stats,
          level: 8 // Higher than current max (3)
        }
      };

      const updatedProgress = updateLevelProgress(mockProgress, petLevelUp);

      expect(updatedProgress.maxLevel).toBe(8);
    });

    it('should not decrease max level', () => {
      const petLowerLevel = {
        ...mockPet,
        stats: {
          ...mockPet.stats,
          level: 2 // Lower than current max (3)
        }
      };

      const updatedProgress = updateLevelProgress(mockProgress, petLowerLevel);

      expect(updatedProgress.maxLevel).toBe(mockProgress.maxLevel);
    });
  });

  describe('updateEvolutionProgress', () => {
    it('should increment evolution count', () => {
      const evolutionData = {
        timestamp: Date.now()
      };

      const updatedProgress = updateEvolutionProgress(mockProgress, evolutionData);

      expect(updatedProgress.evolutionCount).toBe(mockProgress.evolutionCount + 1); // 0 + 1 = 1
      expect(updatedProgress.lastPlayDate).toBe(evolutionData.timestamp);
    });
  });

  describe('updateSessionProgress', () => {
    it('should update playtime and consecutive days for new day', () => {
      const sessionData: SessionData = {
        startTime: Date.now() - 1800000, // 30 minutes ago
        endTime: Date.now(),
        actionsPerformed: 10
      };

      // Set last play date to yesterday
      const progressYesterday = {
        ...mockProgress,
        lastPlayDate: Date.now() - 86400000, // Yesterday
        consecutiveDays: 1 // Changed from 3
      };

      const updatedProgress = updateSessionProgress(progressYesterday, sessionData);

      expect(updatedProgress.totalPlaytime).toBe(progressYesterday.totalPlaytime + 30);
      expect(updatedProgress.consecutiveDays).toBe(2); // Increment from 1 to 2
      expect(updatedProgress.lastPlayDate).toBe(sessionData.endTime);
    });

    it('should reset consecutive days for gap in play', () => {
      const sessionData: SessionData = {
        startTime: Date.now() - 1800000,
        endTime: Date.now(),
        actionsPerformed: 5
      };

      // Set last play date to 3 days ago
      const progressWithGap = {
        ...mockProgress,
        lastPlayDate: Date.now() - 86400000 * 3, // 3 days ago
        consecutiveDays: 2 // Changed from 5
      };

      const updatedProgress = updateSessionProgress(progressWithGap, sessionData);

      expect(updatedProgress.consecutiveDays).toBe(1); // Reset to 1
    });

    it('should not change consecutive days for same day play', () => {
      const sessionData: SessionData = {
        startTime: Date.now() - 1800000,
        endTime: Date.now(),
        actionsPerformed: 8
      };

      // Set last play date to today
      const progressToday = {
        ...mockProgress,
        lastPlayDate: Date.now() - 3600000, // 1 hour ago (same day)
        consecutiveDays: 1 // Changed from 3
      };

      const updatedProgress = updateSessionProgress(progressToday, sessionData);

      expect(updatedProgress.consecutiveDays).toBe(1); // No change
    });
  });

  describe('checkAchievementRequirement', () => {
    it('should check evolution count requirement', () => {
      const requirement = {
        type: 'evolution_count' as const,
        value: 3,
        description: 'Evolve 3 times'
      };

      const result = checkAchievementRequirement(requirement, mockProgress, mockPet);

      expect(result.currentValue).toBe(0); // Changed from 2 to 0
      expect(result.met).toBe(false);

      // Test with met requirement
      const progressWith3Evolutions = { ...mockProgress, evolutionCount: 3 };
      const result2 = checkAchievementRequirement(requirement, progressWith3Evolutions, mockPet);
      
      expect(result2.currentValue).toBe(3);
      expect(result2.met).toBe(true);
    });

    it('should check game win streak requirement', () => {
      const requirement = {
        type: 'game_win_streak' as const,
        value: 10,
        description: 'Win 10 games in a row'
      };

      const result = checkAchievementRequirement(requirement, mockProgress, mockPet);

      expect(result.currentValue).toBe(3); // maxWinStreak changed to 3
      expect(result.met).toBe(false);
    });

    it('should check consecutive days requirement', () => {
      const requirement = {
        type: 'consecutive_days' as const,
        value: 7,
        description: 'Play 7 days in a row'
      };

      const result = checkAchievementRequirement(requirement, mockProgress, mockPet);

      expect(result.currentValue).toBe(2); // consecutiveDays changed to 2
      expect(result.met).toBe(false);
    });

    it('should check level requirement', () => {
      const requirement = {
        type: 'level_reached' as const,
        value: 5,
        description: 'Reach level 5'
      };

      const result = checkAchievementRequirement(requirement, mockProgress, mockPet);

      expect(result.currentValue).toBe(3); // maxLevel changed to 3
      expect(result.met).toBe(false); // Should be false since 3 < 5
    });

    it('should check stat max requirement', () => {
      const requirement = {
        type: 'stat_max' as const,
        value: 100,
        description: 'Max happiness'
      };

      const result = checkAchievementRequirement(requirement, mockProgress, mockPet);

      expect(result.currentValue).toBe(85); // maxHappiness changed to 85
      expect(result.met).toBe(false);
    });
  });

  describe('calculateAchievementProgress', () => {
    it('should calculate progress percentage correctly', () => {
      const requirement = {
        type: 'evolution_count' as const,
        value: 5,
        description: 'Evolve 5 times'
      };

      const progress = calculateAchievementProgress(requirement, mockProgress, mockPet);

      expect(progress).toBeCloseTo(0); // 0/5 = 0
    });

    it('should cap progress at 100%', () => {
      const requirement = {
        type: 'evolution_count' as const,
        value: 1,
        description: 'Evolve once'
      };

      // Use a progress with evolutionCount >= requirement value
      const progressWithMoreEvolutions = { ...mockProgress, evolutionCount: 2 };
      const progress = calculateAchievementProgress(requirement, progressWithMoreEvolutions, mockPet);

      expect(progress).toBe(1); // Capped at 1 (100%)
    });
  });

  describe('checkAchievements', () => {
    it('should unlock badges when requirements are met', () => {
      // Set up progress that meets first evolution requirement
      const progressWithEvolution = { ...mockProgress, evolutionCount: 1 };
      const stateWithEvolution = {
        ...mockAchievementState,
        progress: progressWithEvolution
      };

      const { updatedState, notifications } = checkAchievements(stateWithEvolution, mockPet);

      const firstEvolutionBadge = updatedState.badges.find(badge => badge.id === 'first-evolution');
      
      expect(firstEvolutionBadge?.unlocked).toBe(true);
      expect(firstEvolutionBadge?.unlockedAt).toBeDefined();
      expect(updatedState.newlyUnlocked).toContain('first-evolution');
      
      const notification = notifications.find(n => n.id === 'badge-first-evolution');
      expect(notification).toBeDefined();
      expect(notification?.type).toBe('badge');
    });

    it('should unlock titles when requirements are met', () => {
      // Set up progress that meets veteran trainer requirement (level 10)
      const petLevel10 = {
        ...mockPet,
        stats: { ...mockPet.stats, level: 10 }
      };
      const progressLevel10 = { ...mockProgress, maxLevel: 10 };
      const stateLevel10 = {
        ...mockAchievementState,
        progress: progressLevel10
      };

      const { updatedState, notifications } = checkAchievements(stateLevel10, petLevel10);

      const veteranTitle = updatedState.titles.find(title => title.id === 'veteran-trainer');
      
      expect(veteranTitle?.unlocked).toBe(true);
      expect(veteranTitle?.active).toBe(false); // Not auto-activated
      expect(updatedState.newlyUnlocked).toContain('veteran-trainer');
      
      const notification = notifications.find(n => n.id === 'title-veteran-trainer');
      expect(notification).toBeDefined();
      expect(notification?.type).toBe('title');
    });

    it('should update badge progress for incomplete achievements', () => {
      const { updatedState } = checkAchievements(mockAchievementState, mockPet);

      // Find a badge that should have some progress with our mock data
      // Let's use the game beginner badge which requires 5 win streak, and we have 3
      const gameBeginnerBadge = updatedState.badges.find(badge => badge.id === 'game-beginner');
      
      expect(gameBeginnerBadge?.progress).toBeGreaterThan(0);
      expect(gameBeginnerBadge?.progress).toBeLessThan(1);
      expect(gameBeginnerBadge?.unlocked).toBe(false);
    });

    it('should not re-unlock already unlocked achievements', () => {
      // Mark a badge as already unlocked
      const unlockedState = {
        ...mockAchievementState,
        badges: mockAchievementState.badges.map(badge =>
          badge.id === 'first-evolution'
            ? { ...badge, unlocked: true, unlockedAt: Date.now() - 86400000 }
            : badge
        )
      };

      const { updatedState, notifications } = checkAchievements(unlockedState, mockPet);

      expect(updatedState.newlyUnlocked).not.toContain('first-evolution');
      expect(notifications.find(n => n.id === 'badge-first-evolution')).toBeUndefined();
    });
  });

  describe('activateTitle', () => {
    it('should activate specified title and deactivate others', () => {
      // Set up state with multiple unlocked titles
      const stateWithTitles = {
        ...mockAchievementState,
        titles: mockAchievementState.titles.map(title => ({
          ...title,
          unlocked: true,
          active: title.id === 'beginner-trainer' // One already active
        }))
      };

      const updatedState = activateTitle(stateWithTitles, 'veteran-trainer');

      const veteranTitle = updatedState.titles.find(title => title.id === 'veteran-trainer');
      const beginnerTitle = updatedState.titles.find(title => title.id === 'beginner-trainer');

      expect(veteranTitle?.active).toBe(true);
      expect(beginnerTitle?.active).toBe(false);
    });

    it('should not activate locked titles', () => {
      const updatedState = activateTitle(mockAchievementState, 'master-trainer');

      const masterTitle = updatedState.titles.find(title => title.id === 'master-trainer');
      
      expect(masterTitle?.active).toBe(false); // Not unlocked, so can't activate
    });
  });

  describe('getAchievementSummary', () => {
    it('should calculate achievement statistics correctly', () => {
      // Set up state with some unlocked achievements
      const stateWithSomeUnlocked = {
        ...mockAchievementState,
        badges: mockAchievementState.badges.map((badge, index) => ({
          ...badge,
          unlocked: index < 3 // Unlock first 3 badges
        })),
        titles: mockAchievementState.titles.map((title, index) => ({
          ...title,
          unlocked: index < 2, // Unlock first 2 titles
          active: index === 0
        }))
      };

      const summary = getAchievementSummary(stateWithSomeUnlocked);

      expect(summary.badges.unlocked).toBe(3);
      expect(summary.badges.total).toBe(stateWithSomeUnlocked.badges.length);
      expect(summary.titles.unlocked).toBe(2);
      expect(summary.titles.total).toBe(stateWithSomeUnlocked.titles.length);
      expect(summary.titles.active?.active).toBe(true);
      expect(summary.overall.unlockedAchievements).toBe(5); // 3 + 2
    });
  });

  describe('getNextAchievements', () => {
    it('should return closest achievements to completion', () => {
      const nextAchievements = getNextAchievements(mockAchievementState, mockPet, 3);

      expect(nextAchievements).toHaveLength(3);
      
      // Should be sorted by progress (descending)
      for (let i = 0; i < nextAchievements.length - 1; i++) {
        expect(nextAchievements[i].progress).toBeGreaterThanOrEqual(
          nextAchievements[i + 1].progress
        );
      }

      nextAchievements.forEach(achievement => {
        expect(achievement.progress).toBeGreaterThanOrEqual(0);
        expect(achievement.progress).toBeLessThan(1); // Should be incomplete
        expect(achievement.remaining).toBeGreaterThan(0);
      });
    });

    it('should limit results to specified number', () => {
      const nextAchievements = getNextAchievements(mockAchievementState, mockPet, 2);

      expect(nextAchievements).toHaveLength(2);
    });

    it('should include both badges and titles', () => {
      const nextAchievements = getNextAchievements(mockAchievementState, mockPet, 5);

      const hasBadges = nextAchievements.some(achievement => achievement.badge);
      const hasTitles = nextAchievements.some(achievement => achievement.title);

      expect(hasBadges).toBe(true);
      expect(hasTitles).toBe(true);
    });
  });
});