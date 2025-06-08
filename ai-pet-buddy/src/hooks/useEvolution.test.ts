import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Pet } from '../types/Pet';
import type { EvolutionProgress } from '../types/Evolution';
import { useEvolution } from './useEvolution';

describe('useEvolution', () => {
  const mockBasePet: Pet = {
    id: 'test-pet',
    name: 'TestPet',
    type: 'dragon',
    stats: {
      happiness: 50,
      energy: 50,
      hunger: 50,  // health 50 -> hunger 50
      level: 1
    },
    lastUpdate: Date.now(),
    expression: 'neutral',
    experience: 0
  };

  const mockOnPetUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初期化', () => {
    it('should initialize with baby stage for level 1 pet', () => {
      const { result } = renderHook(() => 
        useEvolution(mockBasePet, mockOnPetUpdate)
      );

      expect(result.current.currentStage.id).toBe('baby');
      expect(result.current.nextStage?.id).toBe('child');
      expect(result.current.evolutionProgress.currentStage).toBe('baby');
    });

    it('should use provided initial progress', () => {
      const initialProgress: EvolutionProgress = {
        currentStage: 'teen',
        lastEvolutionTime: new Date(),
        evolutionHistory: [{
          fromStage: 'child',
          toStage: 'teen',
          timestamp: new Date(),
          level: 15
        }]
      };

      const { result } = renderHook(() => 
        useEvolution(mockBasePet, mockOnPetUpdate, initialProgress)
      );

      expect(result.current.evolutionProgress.currentStage).toBe('teen');
      expect(result.current.evolutionProgress.evolutionHistory).toHaveLength(1);
    });
  });

  describe('進化条件チェック', () => {
    it('should detect when evolution is possible', () => {
      const evolutionReadyPet: Pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 5,
          happiness: 40,
          energy: 30,
          hunger: 75  // health 25 -> hunger 75
        }
      };

      const { result } = renderHook(() => 
        useEvolution(evolutionReadyPet, mockOnPetUpdate)
      );

      expect(result.current.canEvolveNext).toBe(true);
      expect(result.current.evolutionRequirements?.canEvolve).toBe(true);
    });

    it('should detect when evolution is not possible', () => {
      const notReadyPet: Pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 3,
          happiness: 20,
          energy: 15,
          hunger: 90  // health 10 -> hunger 90
        }
      };

      const { result } = renderHook(() => 
        useEvolution(notReadyPet, mockOnPetUpdate)
      );

      expect(result.current.canEvolveNext).toBe(false);
      expect(result.current.evolutionRequirements?.canEvolve).toBe(false);
    });

    it('should return null requirements for elder pet', () => {
      const elderPet: Pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 50,
          happiness: 90,
          energy: 85,
          hunger: 20  // health 80 -> hunger 20
        }
      };

      const { result } = renderHook(() => 
        useEvolution(elderPet, mockOnPetUpdate)
      );

      expect(result.current.nextStage).toBeNull();
      expect(result.current.evolutionRequirements).toBeNull();
      expect(result.current.canEvolveNext).toBe(false);
    });
  });

  describe('進捗計算', () => {
    it('should calculate correct progress to next evolution', () => {
      const partialPet: Pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 5,      // 100% of requirement
          happiness: 15, // 50% of requirement (30)
          energy: 12,    // ~48% of requirement (25)
          hunger: 80     // health 20 -> hunger 80, 100% of requirement (health 20)
        }
      };

      const { result } = renderHook(() => 
        useEvolution(partialPet, mockOnPetUpdate)
      );

      // Should return the minimum progress (~48% for energy)
      expect(result.current.progressToNext).toBeCloseTo(48, 0);
    });

    it('should return 100% progress for elder pet', () => {
      const elderPet: Pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 50
        }
      };

      const { result } = renderHook(() => 
        useEvolution(elderPet, mockOnPetUpdate)
      );

      expect(result.current.progressToNext).toBe(100);
    });
  });

  describe('進化実行', () => {
    it('should successfully trigger evolution when conditions are met', () => {
      const evolutionReadyPet: Pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 5,
          happiness: 40,
          energy: 30,
          hunger: 75  // health 25 -> hunger 75
        }
      };

      const { result } = renderHook(() => 
        useEvolution(evolutionReadyPet, mockOnPetUpdate)
      );

      let evolutionEvent;
      act(() => {
        evolutionEvent = result.current.triggerEvolution();
      });

      expect(evolutionEvent).not.toBeNull();
      expect(evolutionEvent?.fromStage).toBe('baby');
      expect(evolutionEvent?.toStage).toBe('child');
      expect(mockOnPetUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          stats: expect.objectContaining({
            happiness: expect.any(Number),
            energy: expect.any(Number),
            hunger: expect.any(Number)
          })
        })
      );
    });

    it('should fail to trigger evolution when conditions are not met', () => {
      const notReadyPet: Pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 3,
          happiness: 20,
          energy: 15,
          hunger: 90  // health 10 -> hunger 90
        }
      };

      const { result } = renderHook(() => 
        useEvolution(notReadyPet, mockOnPetUpdate)
      );

      let evolutionEvent;
      act(() => {
        evolutionEvent = result.current.triggerEvolution();
      });

      expect(evolutionEvent).toBeNull();
      expect(mockOnPetUpdate).not.toHaveBeenCalled();
    });

    it('should update latest evolution event after successful evolution', () => {
      const evolutionReadyPet: Pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 5,
          happiness: 40,
          energy: 30,
          hunger: 75  // health 25 -> hunger 75
        }
      };

      const { result } = renderHook(() => 
        useEvolution(evolutionReadyPet, mockOnPetUpdate)
      );

      act(() => {
        result.current.triggerEvolution();
      });

      expect(result.current.latestEvolutionEvent).not.toBeNull();
      expect(result.current.latestEvolutionEvent?.toStage).toBe('child');
    });
  });

  describe('プログレスリセット', () => {
    it('should reset evolution progress to initial state', () => {
      const { result } = renderHook(() => 
        useEvolution(mockBasePet, mockOnPetUpdate)
      );

      // まず進化プログレスを変更
      act(() => {
        result.current.triggerEvolution();
      });

      // プログレスをリセット
      act(() => {
        result.current.resetEvolutionProgress();
      });

      expect(result.current.evolutionProgress.currentStage).toBe('baby');
      expect(result.current.latestEvolutionEvent).toBeNull();
      expect(result.current.evolutionProgress.evolutionHistory).toHaveLength(1);
      expect(result.current.evolutionProgress.evolutionHistory[0].toStage).toBe('baby');
    });
  });

  describe('進化履歴', () => {
    it('should return correct evolution history', () => {
      const { result } = renderHook(() => 
        useEvolution(mockBasePet, mockOnPetUpdate)
      );

      const history = result.current.getEvolutionHistory();
      
      expect(history).toHaveLength(1);
      expect(history[0].toStage).toBe('baby');
      expect(history[0].fromStage).toBe('none');
    });

    it('should update history after evolution', () => {
      const evolutionReadyPet: Pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 5,
          happiness: 40,
          energy: 30,
          hunger: 75  // health 25 -> hunger 75
        }
      };

      const { result } = renderHook(() => 
        useEvolution(evolutionReadyPet, mockOnPetUpdate)
      );

      act(() => {
        result.current.triggerEvolution();
      });

      const history = result.current.getEvolutionHistory();
      
      expect(history).toHaveLength(2);
      expect(history[1].toStage).toBe('child');
      expect(history[1].fromStage).toBe('baby');
    });
  });

  describe('ペット更新の反応', () => {
    it('should react to pet level changes', () => {
      let currentPet = { 
        ...mockBasePet, 
        stats: {
          ...mockBasePet.stats,
          level: 1
        }
      };
      
      const { result, rerender } = renderHook(
        ({ pet }) => useEvolution(pet, mockOnPetUpdate),
        { initialProps: { pet: currentPet } }
      );

      expect(result.current.currentStage.id).toBe('baby');

      // ペットのレベルを上げる
      currentPet = { 
        ...currentPet, 
        stats: {
          ...currentPet.stats,
          level: 5, 
          happiness: 40, 
          energy: 30, 
          hunger: 75  // health 25 -> hunger 75
        }
      };
      rerender({ pet: currentPet });

      expect(result.current.canEvolveNext).toBe(true);
    });

    it('should react to pet stat changes', () => {
      let currentPet = { 
        ...mockBasePet, 
        stats: {
          ...mockBasePet.stats,
          level: 5, 
          happiness: 10, 
          energy: 10, 
          hunger: 90  // health 10 -> hunger 90
        }
      };
      
      const { result, rerender } = renderHook(
        ({ pet }) => useEvolution(pet, mockOnPetUpdate),
        { initialProps: { pet: currentPet } }
      );

      expect(result.current.canEvolveNext).toBe(false);

      // ペットの統計値を上げる
      currentPet = { 
        ...currentPet, 
        stats: {
          ...currentPet.stats,
          happiness: 40, 
          energy: 30, 
          hunger: 75  // health 25 -> hunger 75
        }
      };
      rerender({ pet: currentPet });

      expect(result.current.canEvolveNext).toBe(true);
    });
  });

  describe('コンソールログ', () => {
    it('should log when evolution is possible', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const evolutionReadyPet: Pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 5,
          happiness: 40,
          energy: 30,
          hunger: 75  // health 25 -> hunger 75
        }
      };

      renderHook(() => useEvolution(evolutionReadyPet, mockOnPetUpdate));

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('進化可能: Baby Pet → Young Pet')
      );

      consoleSpy.mockRestore();
    });
  });
});
