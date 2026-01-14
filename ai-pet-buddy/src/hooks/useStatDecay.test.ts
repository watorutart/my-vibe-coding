import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Pet } from '../types/Pet';
import { useStatDecay } from './useStatDecay';

describe('useStatDecay Hook', () => {
  let mockPet: Pet;
  let mockOnUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset timers and mocks
    vi.useFakeTimers();
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

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('基本的な自動減衰機能', () => {
    it('should decrease stats over time', () => {
      renderHook(() => useStatDecay(mockPet, mockOnUpdate));

      // 5分経過をシミュレート
      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000);
      });

      // onUpdateが呼ばれてステータスが減少していることを確認
      expect(mockOnUpdate).toHaveBeenCalled();
      const updatedPet = mockOnUpdate.mock.calls[0][0];
      expect(updatedPet.stats.hunger).toBeGreaterThan(mockPet.stats.hunger);
      expect(updatedPet.stats.energy).toBeLessThan(mockPet.stats.energy);
    });

    it('should not decrease stats below 0', () => {
      const lowStatsPet: Pet = {
        ...mockPet,
        stats: {
          happiness: 5,
          hunger: 95,
          energy: 3,
          level: 1,
        },
      };

      renderHook(() => useStatDecay(lowStatsPet, mockOnUpdate));

      // 長時間経過をシミュレート
      act(() => {
        vi.advanceTimersByTime(60 * 60 * 1000); // 1時間
      });

      expect(mockOnUpdate).toHaveBeenCalled();
      const updatedPet = mockOnUpdate.mock.calls[0][0];
      expect(updatedPet.stats.happiness).toBeGreaterThanOrEqual(0);
      expect(updatedPet.stats.hunger).toBeLessThanOrEqual(100);
      expect(updatedPet.stats.energy).toBeGreaterThanOrEqual(0);
    });
  });

  describe('減衰レート制御', () => {
    it('should decay at different rates for different stats', () => {
      renderHook(() => useStatDecay(mockPet, mockOnUpdate));

      act(() => {
        vi.advanceTimersByTime(10 * 60 * 1000); // 10分
      });

      expect(mockOnUpdate).toHaveBeenCalled();
      const updatedPet = mockOnUpdate.mock.calls[0][0];

      // 各ステータスの減衰率が異なることを確認
      const happinessDecay =
        mockPet.stats.happiness - updatedPet.stats.happiness;
      const hungerIncrease = updatedPet.stats.hunger - mockPet.stats.hunger;
      const energyDecay = mockPet.stats.energy - updatedPet.stats.energy;

      expect(happinessDecay).toBeGreaterThan(0);
      expect(hungerIncrease).toBeGreaterThan(0);
      expect(energyDecay).toBeGreaterThan(0);

      // お腹の減り方が最も速いはず
      expect(hungerIncrease).toBeGreaterThan(happinessDecay);
    });

    it('should pause decay when pet is being interacted with recently', () => {
      const recentlyUpdatedPet: Pet = {
        ...mockPet,
        lastUpdate: Date.now() - 1000, // 1秒前
      };

      renderHook(() => useStatDecay(recentlyUpdatedPet, mockOnUpdate));

      act(() => {
        vi.advanceTimersByTime(2 * 60 * 1000); // 2分
      });

      // 最近更新されたため、まだコールされていないか、されていても変化が小さいはず
      if (mockOnUpdate.mock.calls.length > 0) {
        const updatedPet = mockOnUpdate.mock.calls[0][0];
        const changeMagnitude = Math.abs(
          updatedPet.stats.happiness -
            mockPet.stats.happiness +
            (updatedPet.stats.hunger - mockPet.stats.hunger) +
            (updatedPet.stats.energy - mockPet.stats.energy)
        );
        expect(changeMagnitude).toBeLessThan(10); // 大きな変化はないはず
      }
    });
  });

  describe('エラーハンドリング', () => {
    it('should handle invalid pet data gracefully', () => {
      const invalidPet = {
        ...mockPet,
        stats: {
          happiness: -10,
          hunger: 150,
          energy: -5,
          level: 0,
        },
      };

      expect(() => {
        renderHook(() => useStatDecay(invalidPet, mockOnUpdate));
      }).not.toThrow();
    });

    it('should handle missing onUpdate callback gracefully', () => {
      expect(() => {
        renderHook(() => useStatDecay(mockPet, undefined as any));
      }).not.toThrow();
    });

    it('should clean up interval on unmount', () => {
      const { unmount } = renderHook(() => useStatDecay(mockPet, mockOnUpdate));

      const intervalSpy = vi.spyOn(globalThis, 'clearInterval');
      unmount();

      expect(intervalSpy).toHaveBeenCalled();
    });
  });

  describe('タイミング制御', () => {
    it('should update at regular intervals', () => {
      renderHook(() => useStatDecay(mockPet, mockOnUpdate));

      // 複数の間隔で更新されることを確認
      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000); // 5分
      });
      const firstCallCount = mockOnUpdate.mock.calls.length;

      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000); // さらに5分
      });
      const secondCallCount = mockOnUpdate.mock.calls.length;

      expect(secondCallCount).toBeGreaterThan(firstCallCount);
    });

    it('should respect minimum time between updates', () => {
      const veryRecentPet: Pet = {
        ...mockPet,
        lastUpdate: Date.now() - 100, // 100ms前
      };

      renderHook(() => useStatDecay(veryRecentPet, mockOnUpdate));

      act(() => {
        vi.advanceTimersByTime(1000); // 1秒
      });

      // 最小間隔より短い場合は更新されないはず
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });
});
