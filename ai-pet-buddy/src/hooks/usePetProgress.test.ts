import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Pet } from '../types/Pet';
import { usePetProgress } from './usePetProgress';

describe('usePetProgress Hook', () => {
  let mockPet: Pet;
  let mockOnUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnUpdate = vi.fn();

    mockPet = {
      id: 'test-pet',
      name: 'TestPet',
      type: 'dragon',
      stats: {
        happiness: 80,
        hunger: 60,
        energy: 70,
        level: 1,
      },
      lastUpdate: Date.now(),
      expression: 'happy',
    };
  });

  describe('経験値獲得システム', () => {
    it('should calculate experience correctly from interactions', () => {
      const { result } = renderHook(() =>
        usePetProgress(mockPet, mockOnUpdate)
      );

      act(() => {
        // 餌を与える行動 (経験値+5)
        result.current.gainExperience('feed', 5);
      });

      expect(mockOnUpdate).toHaveBeenCalled();
      const callArgs = mockOnUpdate.mock.calls[0][0];
      expect(callArgs).toHaveProperty('experience');
      expect(callArgs.experience).toBe(5);
    });

    it('should accumulate experience from multiple actions', () => {
      let currentPet = { ...mockPet };

      // onUpdateでpetを更新するモック関数
      const mockOnUpdateWithState = vi.fn((updatedPet: Pet) => {
        currentPet = updatedPet;
      });

      const { result, rerender } = renderHook(
        ({ pet }) => usePetProgress(pet, mockOnUpdateWithState),
        { initialProps: { pet: currentPet } }
      );

      // 最初の経験値獲得
      act(() => {
        result.current.gainExperience('feed', 5);
        rerender({ pet: currentPet }); // 更新されたpetで再レンダリング
      });

      // 2回目の経験値獲得
      act(() => {
        result.current.gainExperience('play', 10);
        rerender({ pet: currentPet }); // 更新されたpetで再レンダリング
      });

      // 3回目の経験値獲得
      act(() => {
        result.current.gainExperience('rest', 3);
        rerender({ pet: currentPet }); // 更新されたpetで再レンダリング
      });

      // 最終的な経験値を確認
      expect(mockOnUpdateWithState).toHaveBeenCalledTimes(3);
      expect(currentPet.experience).toBe(18); // 5 + 10 + 3 = 18の累積経験値
    });
  });

  describe('レベルアップシステム', () => {
    it('should trigger level up when experience threshold is reached', () => {
      const { result } = renderHook(() =>
        usePetProgress(mockPet, mockOnUpdate)
      );

      act(() => {
        // レベル1→2に必要な経験値100を獲得
        result.current.gainExperience('mega-play', 100);
      });

      expect(mockOnUpdate).toHaveBeenCalled();
      const updatedPet =
        mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0];
      expect(updatedPet.stats.level).toBe(2);
    });

    it('should reset experience after level up', () => {
      const { result } = renderHook(() =>
        usePetProgress(mockPet, mockOnUpdate)
      );

      act(() => {
        // 120経験値獲得（100でレベルアップ、20余る）
        result.current.gainExperience('super-care', 120);
      });

      const updatedPet =
        mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0];
      expect(updatedPet.stats.level).toBe(2);
      expect(updatedPet.experience).toBe(20); // 余った経験値
    });

    it('should handle multiple level ups in single experience gain', () => {
      const { result } = renderHook(() =>
        usePetProgress(mockPet, mockOnUpdate)
      );

      act(() => {
        // 350経験値獲得（複数レベルアップ）
        result.current.gainExperience('ultimate-care', 350);
      });

      const updatedPet =
        mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0];
      expect(updatedPet.stats.level).toBeGreaterThan(2);
    });

    it('should not exceed maximum level', () => {
      const maxLevelPet: Pet = {
        ...mockPet,
        stats: { ...mockPet.stats, level: 10 },
      };

      const { result } = renderHook(() =>
        usePetProgress(maxLevelPet, mockOnUpdate)
      );

      act(() => {
        result.current.gainExperience('feed', 1000);
      });

      const updatedPet =
        mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0];
      expect(updatedPet.stats.level).toBe(10); // 最大レベル維持
    });
  });

  describe('レベル依存の必要経験値', () => {
    it('should require more experience for higher levels', () => {
      const { result } = renderHook(() =>
        usePetProgress(mockPet, mockOnUpdate)
      );

      // レベル1での必要経験値を取得
      const level1Required = result.current.getRequiredExperience(1);
      const level5Required = result.current.getRequiredExperience(5);

      expect(level5Required).toBeGreaterThan(level1Required);
    });

    it('should calculate experience to next level correctly', () => {
      const midLevelPet: Pet = {
        ...mockPet,
        stats: { ...mockPet.stats, level: 3 },
        experience: 50,
      };

      const { result } = renderHook(() =>
        usePetProgress(midLevelPet, mockOnUpdate)
      );

      const remaining = result.current.getExperienceToNextLevel();
      expect(remaining).toBeGreaterThan(0);
      expect(typeof remaining).toBe('number');
    });
  });

  describe('ステータスボーナス', () => {
    it('should apply stat bonuses on level up', () => {
      const { result } = renderHook(() =>
        usePetProgress(mockPet, mockOnUpdate)
      );

      const initialStats = { ...mockPet.stats };

      act(() => {
        result.current.gainExperience('levelup-action', 100);
      });

      const updatedPet =
        mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0];

      // レベルアップ時にステータスが向上している
      expect(updatedPet.stats.level).toBe(2);
      // 何らかのステータスが初期値より高くなっているはず
      const statsImproved =
        updatedPet.stats.happiness > initialStats.happiness ||
        updatedPet.stats.energy > initialStats.energy;
      expect(statsImproved).toBe(true);
    });
  });

  describe('エラーハンドリング', () => {
    it('should handle negative experience gracefully', () => {
      const { result } = renderHook(() =>
        usePetProgress(mockPet, mockOnUpdate)
      );

      expect(() => {
        act(() => {
          result.current.gainExperience('negative-action', -10);
        });
      }).not.toThrow();

      // 負の経験値は無視されるはず
      if (mockOnUpdate.mock.calls.length > 0) {
        const updatedPet = mockOnUpdate.mock.calls[0][0];
        expect(updatedPet.experience).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle missing onUpdate callback gracefully', () => {
      expect(() => {
        renderHook(() => usePetProgress(mockPet, undefined as any));
      }).not.toThrow();
    });

    it('should handle invalid pet data gracefully', () => {
      const invalidPet = {
        ...mockPet,
        stats: { ...mockPet.stats, level: -1 },
      };

      expect(() => {
        renderHook(() => usePetProgress(invalidPet, mockOnUpdate));
      }).not.toThrow();
    });
  });

  describe('進行状況の取得', () => {
    it('should provide current progress information', () => {
      const experiencedPet: Pet = {
        ...mockPet,
        experience: 75,
      };

      const { result } = renderHook(() =>
        usePetProgress(experiencedPet, mockOnUpdate)
      );

      const progress = result.current.getProgressInfo();

      expect(progress).toHaveProperty('currentLevel');
      expect(progress).toHaveProperty('currentExperience');
      expect(progress).toHaveProperty('experienceToNextLevel');
      expect(progress).toHaveProperty('progressPercentage');

      expect(progress.progressPercentage).toBeGreaterThan(0);
      expect(progress.progressPercentage).toBeLessThanOrEqual(100);
    });
  });
});
