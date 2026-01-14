import { describe, expect, it } from 'vitest';
import type { Pet } from '../types/Pet';
import {
  calculateEvolutionProgress,
  checkEvolutionRequirements,
  createInitialEvolutionProgress,
  EVOLUTION_STAGES,
  evolvepet,
  getCurrentEvolutionStage,
  getNextEvolutionStage,
} from './evolutionEngine';

describe('evolutionEngine', () => {
  const mockBasePet: Pet = {
    id: 'test-pet-001',
    name: 'TestPet',
    type: 'dragon',
    stats: {
      happiness: 50,
      hunger: 50, // health -> hunger (Pet型に合わせる)
      energy: 50,
      level: 1,
    },
    lastUpdate: Date.now(),
    expression: 'neutral',
    experience: 0,
  };

  describe('EVOLUTION_STAGES', () => {
    it('should have correct number of stages', () => {
      expect(EVOLUTION_STAGES).toHaveLength(5);
    });

    it('should have stages in correct order', () => {
      expect(EVOLUTION_STAGES[0].id).toBe('baby');
      expect(EVOLUTION_STAGES[1].id).toBe('child');
      expect(EVOLUTION_STAGES[2].id).toBe('teen');
      expect(EVOLUTION_STAGES[3].id).toBe('adult');
      expect(EVOLUTION_STAGES[4].id).toBe('elder');
    });

    it('should have ascending level requirements', () => {
      for (let i = 1; i < EVOLUTION_STAGES.length; i++) {
        expect(EVOLUTION_STAGES[i].requiredLevel).toBeGreaterThan(
          EVOLUTION_STAGES[i - 1].requiredLevel
        );
      }
    });
  });

  describe('getCurrentEvolutionStage', () => {
    it('should return baby stage for level 1', () => {
      const pet = { ...mockBasePet, stats: { ...mockBasePet.stats, level: 1 } };
      const stage = getCurrentEvolutionStage(pet);
      expect(stage.id).toBe('baby');
    });

    it('should return child stage for level 5', () => {
      const pet = { ...mockBasePet, stats: { ...mockBasePet.stats, level: 5 } };
      const stage = getCurrentEvolutionStage(pet);
      expect(stage.id).toBe('child');
    });

    it('should return teen stage for level 15', () => {
      const pet = {
        ...mockBasePet,
        stats: { ...mockBasePet.stats, level: 15 },
      };
      const stage = getCurrentEvolutionStage(pet);
      expect(stage.id).toBe('teen');
    });

    it('should return adult stage for level 30', () => {
      const pet = {
        ...mockBasePet,
        stats: { ...mockBasePet.stats, level: 30 },
      };
      const stage = getCurrentEvolutionStage(pet);
      expect(stage.id).toBe('adult');
    });

    it('should return elder stage for level 50+', () => {
      const pet = {
        ...mockBasePet,
        stats: { ...mockBasePet.stats, level: 50 },
      };
      const stage = getCurrentEvolutionStage(pet);
      expect(stage.id).toBe('elder');
    });
  });

  describe('getNextEvolutionStage', () => {
    it('should return child stage for baby pet', () => {
      const pet = { ...mockBasePet, stats: { ...mockBasePet.stats, level: 1 } };
      const nextStage = getNextEvolutionStage(pet);
      expect(nextStage?.id).toBe('child');
    });

    it('should return teen stage for child pet', () => {
      const pet = { ...mockBasePet, stats: { ...mockBasePet.stats, level: 5 } };
      const nextStage = getNextEvolutionStage(pet);
      expect(nextStage?.id).toBe('teen');
    });

    it('should return null for elder pet', () => {
      const pet = {
        ...mockBasePet,
        stats: { ...mockBasePet.stats, level: 50 },
      };
      const nextStage = getNextEvolutionStage(pet);
      expect(nextStage).toBeNull();
    });
  });

  describe('checkEvolutionRequirements', () => {
    it('should return true when all requirements are met', () => {
      const pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 5,
          happiness: 40,
          energy: 30,
          hunger: 75, // health 25 -> hunger 75 (100-25)
        },
      };
      const childStage = EVOLUTION_STAGES.find(s => s.id === 'child')!;
      const requirements = checkEvolutionRequirements(pet, childStage);

      expect(requirements.canEvolve).toBe(true);
      expect(requirements.meetsLevel).toBe(true);
      expect(requirements.meetsStats).toBe(true);
    });

    it('should return false when level requirement is not met', () => {
      const pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 3,
          happiness: 40,
          energy: 30,
          hunger: 75, // health 25 -> hunger 75
        },
      };
      const childStage = EVOLUTION_STAGES.find(s => s.id === 'child')!;
      const requirements = checkEvolutionRequirements(pet, childStage);

      expect(requirements.canEvolve).toBe(false);
      expect(requirements.meetsLevel).toBe(false);
      expect(requirements.missingRequirements.level).toBe(2);
    });

    it('should return false when stat requirements are not met', () => {
      const pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 5,
          happiness: 20,
          energy: 15,
          hunger: 90, // health 10 -> hunger 90 (100-10)
        },
      };
      const childStage = EVOLUTION_STAGES.find(s => s.id === 'child')!;
      const requirements = checkEvolutionRequirements(pet, childStage);

      expect(requirements.canEvolve).toBe(false);
      expect(requirements.meetsStats).toBe(false);
      expect(requirements.missingRequirements.happiness).toBe(10);
      expect(requirements.missingRequirements.energy).toBe(10);
      expect(requirements.missingRequirements.health).toBe(10);
    });
  });

  describe('evolvepet', () => {
    it('should evolve pet when requirements are met', () => {
      const pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 5,
          happiness: 40,
          energy: 30,
          hunger: 75, // health 25 -> hunger 75
        },
      };
      const progress = createInitialEvolutionProgress();

      const result = evolvepet(pet, progress);

      expect(result.event).not.toBeNull();
      expect(result.event?.toStage).toBe('child');
      expect(result.progress.currentStage).toBe('child');
      expect(result.pet.stats.happiness).toBeGreaterThan(pet.stats.happiness);
      expect(result.progress.evolutionHistory).toHaveLength(2);
    });

    it('should not evolve pet when requirements are not met', () => {
      const pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 3,
          happiness: 20,
          energy: 15,
          hunger: 90, // health 10 -> hunger 90
        },
      };
      const progress = createInitialEvolutionProgress();

      const result = evolvepet(pet, progress);

      expect(result.event).toBeNull();
      expect(result.progress.currentStage).toBe('baby');
      expect(result.pet).toEqual(pet);
    });

    it('should not evolve elder pet', () => {
      const pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 50,
          happiness: 90,
          energy: 85,
          hunger: 20, // health 80 -> hunger 20
        },
      };
      const progress = {
        ...createInitialEvolutionProgress(),
        currentStage: 'elder' as const,
      };

      const result = evolvepet(pet, progress);

      expect(result.event).toBeNull();
      expect(result.pet).toEqual(pet);
    });

    it('should apply correct bonuses during evolution', () => {
      const pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 5,
          happiness: 40,
          energy: 30,
          hunger: 75, // health 25 -> hunger 75
        },
      };
      const progress = createInitialEvolutionProgress();

      const result = evolvepet(pet, progress);
      const childStage = EVOLUTION_STAGES.find(s => s.id === 'child')!;

      expect(result.pet.stats.happiness).toBe(
        pet.stats.happiness + childStage.bonuses.happiness
      );
      expect(result.pet.stats.energy).toBe(
        pet.stats.energy + childStage.bonuses.energy
      );
      // health bonus applied as hunger reduction
      expect(result.pet.stats.hunger).toBe(
        pet.stats.hunger - childStage.bonuses.health
      );
    });

    it('should cap stats at 100 during evolution', () => {
      const pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 5,
          happiness: 98,
          energy: 98,
          hunger: 2, // health 98 -> hunger 2
        },
      };
      const progress = createInitialEvolutionProgress();

      const result = evolvepet(pet, progress);

      expect(result.pet.stats.happiness).toBe(100);
      expect(result.pet.stats.energy).toBe(100);
      expect(result.pet.stats.hunger).toBe(0); // minimum hunger is 0
    });
  });

  describe('createInitialEvolutionProgress', () => {
    it('should create initial progress with baby stage', () => {
      const progress = createInitialEvolutionProgress();

      expect(progress.currentStage).toBe('baby');
      expect(progress.evolutionHistory).toHaveLength(1);
      expect(progress.evolutionHistory[0].toStage).toBe('baby');
      expect(progress.evolutionHistory[0].fromStage).toBe('none');
      expect(progress.lastEvolutionTime).toBeInstanceOf(Date);
    });
  });

  describe('calculateEvolutionProgress', () => {
    it('should return 100 for elder pet', () => {
      const pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 50,
        },
      };
      const progress = calculateEvolutionProgress(pet);
      expect(progress).toBe(100);
    });

    it('should return correct progress for partial requirements', () => {
      const pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 5, // meets level requirement (100%)
          happiness: 15, // 50% of required (30)
          energy: 12, // ~48% of required (25)
          hunger: 80, // health 20 -> hunger 80, 100% of required (health 20)
        },
      };
      // Create progress indicating pet is still in baby stage trying to evolve to child
      const evolutionProgress = createInitialEvolutionProgress();
      const progress = calculateEvolutionProgress(pet, evolutionProgress);
      // Should return minimum progress (energy at ~48%)
      expect(progress).toBeCloseTo(48, 0);
    });

    it('should return 0 for pet that meets no requirements', () => {
      const pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 1,
          happiness: 0,
          energy: 0,
          hunger: 100, // health 0 -> hunger 100
        },
      };
      const progress = calculateEvolutionProgress(pet);
      expect(progress).toBe(0);
    });

    it('should handle level requirement correctly', () => {
      const pet = {
        ...mockBasePet,
        stats: {
          ...mockBasePet.stats,
          level: 2, // 40% of required level (5)
          happiness: 30, // 100% of required (30)
          energy: 25, // 100% of required (25)
          hunger: 80, // health 20 -> hunger 80, 100% of required (health 20)
        },
      };
      // Create progress indicating pet is still in baby stage trying to evolve to child
      const evolutionProgress = createInitialEvolutionProgress();
      const progress = calculateEvolutionProgress(pet, evolutionProgress);
      // Should return level progress (40%)
      expect(progress).toBe(40);
    });
  });
});
