/**
 * @file useAchievements.test.ts
 * @description Tests for useAchievements hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Pet } from '../types/Pet';
import {
  useAchievements,
  type UseAchievementsOptions,
} from './useAchievements';
import type { GameData, CareActionData } from '../utils/achievementEngine';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('useAchievements', () => {
  let mockPet: Pet;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    mockPet = {
      id: 'test-pet',
      name: 'Test Pet',
      type: 'dragon',
      stats: {
        happiness: 80,
        hunger: 20,
        energy: 90,
        level: 3,
      },
      lastUpdate: Date.now(),
      expression: 'happy',
      experience: 300,
    };

    // Mock localStorage to return null (no saved data)
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with default state when no saved data exists', async () => {
      const { result } = renderHook(() => useAchievements(mockPet));

      expect(result.current.isLoading).toBe(true);

      // Wait for loading to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.achievementState).toBeDefined();
      expect(result.current.achievementState.badges.length).toBeGreaterThan(0);
      expect(result.current.achievementState.titles.length).toBeGreaterThan(0);
      expect(result.current.notifications).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should load saved achievement data when available', async () => {
      const savedData = {
        badges: [
          {
            id: 'test-badge',
            name: 'Test Badge',
            unlocked: true,
            progress: 1,
            description: 'Test',
            icon: '🏆',
            category: 'game' as const,
            rarity: 'common' as const,
            requirements: {
              type: 'total_games' as const,
              value: 1,
              description: 'Test',
            },
          },
        ],
        titles: [
          {
            id: 'test-title',
            name: 'Test Title',
            unlocked: true,
            active: true,
            description: 'Test',
            icon: '👑',
            category: 'level' as const,
            rarity: 'common' as const,
            requirements: {
              type: 'level_reached' as const,
              value: 1,
              description: 'Test',
            },
          },
        ],
        progress: {
          evolutionCount: 1,
          maxWinStreak: 5,
          currentWinStreak: 2,
          consecutiveDays: 3,
          maxLevel: 5,
          maxHappiness: 95,
          maxEnergy: 100,
          totalGames: 10,
          totalWins: 7,
          totalPlaytime: 300,
          lastPlayDate: Date.now(),
          firstPlayDate: Date.now() - 86400000,
        },
        newlyUnlocked: [],
        lastSaved: Date.now(),
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedData));

      const { result } = renderHook(() => useAchievements(mockPet));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.achievementState.progress.evolutionCount).toBe(1);
      expect(result.current.achievementState.progress.maxWinStreak).toBe(5);
    });

    it('should handle invalid saved data gracefully', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      const { result } = renderHook(() => useAchievements(mockPet));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeTruthy();
      expect(result.current.achievementState).toBeDefined(); // Should fall back to initial state
    });

    it('should initialize with beginner trainer title active', async () => {
      const { result } = renderHook(() => useAchievements(mockPet));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const beginnerTitle = result.current.achievementState.titles.find(
        title => title.id === 'beginner-trainer'
      );

      expect(beginnerTitle?.unlocked).toBe(true);
      expect(beginnerTitle?.active).toBe(true);
    });
  });

  describe('Game Recording', () => {
    it('should record game win and update achievements', async () => {
      const { result } = renderHook(() => useAchievements(mockPet));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const gameData: GameData = {
        type: 'rock-paper-scissors',
        result: 'win',
        timestamp: Date.now(),
        duration: 30,
      };

      act(() => {
        result.current.recordGameResult(gameData);
      });

      expect(result.current.achievementState.progress.totalGames).toBe(1);
      expect(result.current.achievementState.progress.totalWins).toBe(1);
      expect(result.current.achievementState.progress.currentWinStreak).toBe(1);
    });

    it('should record game loss and reset win streak', async () => {
      const { result } = renderHook(() => useAchievements(mockPet));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // First, record a win
      const winData: GameData = {
        type: 'rock-paper-scissors',
        result: 'win',
        timestamp: Date.now(),
        duration: 30,
      };

      act(() => {
        result.current.recordGameResult(winData);
      });

      expect(result.current.achievementState.progress.currentWinStreak).toBe(1);

      // Then record a loss
      const lossData: GameData = {
        type: 'rock-paper-scissors',
        result: 'lose',
        timestamp: Date.now(),
        duration: 25,
      };

      act(() => {
        result.current.recordGameResult(lossData);
      });

      expect(result.current.achievementState.progress.totalGames).toBe(2);
      expect(result.current.achievementState.progress.totalWins).toBe(1);
      expect(result.current.achievementState.progress.currentWinStreak).toBe(0); // Reset
    });

    it('should trigger achievement notification when requirement is met', async () => {
      const { result } = renderHook(() => useAchievements(mockPet));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Record an evolution to unlock the first evolution badge
      act(() => {
        result.current.recordEvolution();
      });

      expect(result.current.achievementState.progress.evolutionCount).toBe(1);
      expect(result.current.notifications.length).toBeGreaterThan(0);

      const evolutionBadge = result.current.achievementState.badges.find(
        badge => badge.id === 'first-evolution'
      );
      expect(evolutionBadge?.unlocked).toBe(true);
    });
  });

  describe('Care Recording', () => {
    it('should record care action and update max stats', async () => {
      const { result } = renderHook(() => useAchievements(mockPet));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const careData: CareActionData = {
        action: 'feed',
        timestamp: Date.now(),
        statsBefore: { happiness: 80, energy: 90, hunger: 30 },
        statsAfter: { happiness: 100, energy: 95, hunger: 10 },
      };

      act(() => {
        result.current.recordCareAction(careData);
      });

      expect(result.current.achievementState.progress.maxHappiness).toBe(100);
      expect(result.current.achievementState.progress.maxEnergy).toBe(95);
    });
  });

  describe('Level Up Recording', () => {
    it('should record level up and update max level', async () => {
      const { result } = renderHook(() => useAchievements(mockPet));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const leveledUpPet = {
        ...mockPet,
        stats: { ...mockPet.stats, level: 8 },
      };

      act(() => {
        result.current.recordLevelUp(leveledUpPet);
      });

      expect(result.current.achievementState.progress.maxLevel).toBe(8);
    });

    it('should automatically detect level changes', async () => {
      const { result, rerender } = renderHook(
        ({ pet }) => useAchievements(pet),
        { initialProps: { pet: mockPet } }
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Change pet level and rerender
      const leveledUpPet = {
        ...mockPet,
        stats: { ...mockPet.stats, level: 7 },
      };

      rerender({ pet: leveledUpPet });

      expect(result.current.achievementState.progress.maxLevel).toBe(7);
    });
  });

  describe('Session Tracking', () => {
    it('should track session start and end', async () => {
      const { result } = renderHook(() =>
        useAchievements(mockPet, { enableSessionTracking: true })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.startSession();
      });

      // Simulate some actions
      act(() => {
        result.current.recordGameResult({
          type: 'test',
          result: 'win',
          timestamp: Date.now(),
          duration: 30,
        });
      });

      // End session after delay
      act(() => {
        result.current.endSession();
      });

      // Session data should be recorded in playtime
      expect(
        result.current.achievementState.progress.totalPlaytime
      ).toBeGreaterThan(0);
    });

    it('should disable session tracking when option is false', async () => {
      const { result } = renderHook(() =>
        useAchievements(mockPet, { enableSessionTracking: false })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.startSession();
        result.current.endSession();
      });

      // Should not affect playtime since tracking is disabled
      expect(result.current.achievementState.progress.totalPlaytime).toBe(0);
    });
  });

  describe('Title Management', () => {
    it('should activate selected title and deactivate others', async () => {
      const { result } = renderHook(() => useAchievements(mockPet));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // First unlock a title by reaching requirements
      const leveledUpPet = {
        ...mockPet,
        stats: { ...mockPet.stats, level: 10 },
      };

      act(() => {
        result.current.recordLevelUp(leveledUpPet);
      });

      // Find an unlocked title to activate
      const veteranTitle = result.current.achievementState.titles.find(
        title => title.id === 'veteran-trainer' && title.unlocked
      );

      if (veteranTitle) {
        act(() => {
          result.current.setActiveTitle('veteran-trainer');
        });

        const updatedVeteranTitle = result.current.achievementState.titles.find(
          title => title.id === 'veteran-trainer'
        );
        const beginnerTitle = result.current.achievementState.titles.find(
          title => title.id === 'beginner-trainer'
        );

        expect(updatedVeteranTitle?.active).toBe(true);
        expect(beginnerTitle?.active).toBe(false);
      }
    });
  });

  describe('Notification Management', () => {
    it('should dismiss specific notifications', async () => {
      const { result } = renderHook(() => useAchievements(mockPet));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Trigger a notification
      act(() => {
        result.current.recordEvolution();
      });

      expect(result.current.notifications.length).toBeGreaterThan(0);

      const notificationId = result.current.notifications[0].id;

      act(() => {
        result.current.dismissNotification(notificationId);
      });

      expect(
        result.current.notifications.find(n => n.id === notificationId)
      ).toBeUndefined();
    });

    it('should clear all notifications', async () => {
      const { result } = renderHook(() => useAchievements(mockPet));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Trigger multiple notifications
      act(() => {
        result.current.recordEvolution();
        result.current.recordEvolution();
      });

      expect(result.current.notifications.length).toBeGreaterThan(0);

      act(() => {
        result.current.clearAllNotifications();
      });

      expect(result.current.notifications).toEqual([]);
    });

    it('should limit notification count', async () => {
      const { result } = renderHook(() =>
        useAchievements(mockPet, { maxNotifications: 2 })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Trigger multiple notifications
      act(() => {
        result.current.recordEvolution();
        result.current.recordEvolution();
        result.current.recordEvolution();
      });

      expect(result.current.notifications.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Data Persistence', () => {
    it('should auto-save when enabled', async () => {
      vi.useFakeTimers();

      const { result } = renderHook(() =>
        useAchievements(mockPet, {
          autoSave: true,
          saveInterval: 1000,
        })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.recordGameResult({
          type: 'test',
          result: 'win',
          timestamp: Date.now(),
          duration: 30,
        });
      });

      // Fast-forward time to trigger auto-save
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should not auto-save when disabled', async () => {
      const { result } = renderHook(() =>
        useAchievements(mockPet, { autoSave: false })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.recordGameResult({
          type: 'test',
          result: 'win',
          timestamp: Date.now(),
          duration: 30,
        });
      });

      // Should not call setItem automatically
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle save errors gracefully', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() => useAchievements(mockPet));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        try {
          await result.current.saveAchievements();
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });

      expect(result.current.error).toBeTruthy();
    });

    it('should manually save achievements', async () => {
      const { result } = renderHook(() =>
        useAchievements(mockPet, { autoSave: false })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.saveAchievements();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'ai-pet-buddy-achievements',
        expect.any(String)
      );
    });
  });

  describe('Utility Functions', () => {
    it('should provide achievement summary', async () => {
      const { result } = renderHook(() => useAchievements(mockPet));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const summary = result.current.getSummary();

      expect(summary.badges).toBeDefined();
      expect(summary.titles).toBeDefined();
      expect(summary.overall).toBeDefined();
      expect(typeof summary.badges.total).toBe('number');
      expect(typeof summary.badges.unlocked).toBe('number');
    });

    it('should provide next achievements', async () => {
      const { result } = renderHook(() => useAchievements(mockPet));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const nextAchievements = result.current.getNextAchievements(3);

      expect(Array.isArray(nextAchievements)).toBe(true);
      expect(nextAchievements.length).toBeLessThanOrEqual(3);

      nextAchievements.forEach(achievement => {
        expect(achievement.progress).toBeGreaterThanOrEqual(0);
        expect(achievement.remaining).toBeGreaterThan(0);
      });
    });

    it('should reset achievements', async () => {
      const { result } = renderHook(() => useAchievements(mockPet));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Make some progress
      act(() => {
        result.current.recordGameResult({
          type: 'test',
          result: 'win',
          timestamp: Date.now(),
          duration: 30,
        });
      });

      expect(result.current.achievementState.progress.totalGames).toBe(1);

      act(() => {
        result.current.resetAchievements();
      });

      expect(result.current.achievementState.progress.totalGames).toBe(0);
      expect(result.current.notifications).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'ai-pet-buddy-achievements'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage access errors', async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const { result } = renderHook(() => useAchievements(mockPet));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.achievementState).toBeDefined(); // Should still provide fallback state
    });

    it('should recover from corrupted data', async () => {
      const corruptedData = {
        badges: 'invalid',
        // Missing required fields
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(corruptedData));

      const { result } = renderHook(() => useAchievements(mockPet));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.achievementState.badges).toBeDefined();
      expect(Array.isArray(result.current.achievementState.badges)).toBe(true);
    });
  });
});
