
import { describe, it, expect } from 'vitest';
import type { 
  EvolutionStage, 
  EvolutionProgress, 
  EvolutionRequirements, 
  EvolutionEvent 
} from './Evolution';

describe('Evolution Types', () => {
  describe('EvolutionStage', () => {
    it('should define a valid evolution stage structure', () => {
      const stage: EvolutionStage = {
        id: 'baby',
        name: 'Baby Pet',
        requiredLevel: 1,
        requiredStats: {
          happiness: 0,
          energy: 0,
          health: 0
        },
        appearance: {
          emoji: '🐣',
          color: '#FFD700',
          size: 'small'
        },
        unlockMessage: 'Your pet has been born!'
      };

      expect(stage.id).toBe('baby');
      expect(stage.name).toBe('Baby Pet');
      expect(stage.requiredLevel).toBe(1);
      expect(stage.appearance.size).toBe('small');
    });

    it('should support optional bonuses', () => {
      const stage: EvolutionStage = {
        id: 'adult',
        name: 'Adult Pet',
        requiredLevel: 10,
        requiredStats: {
          happiness: 80,
          energy: 70,
          health: 90
        },
        appearance: {
          emoji: '🐾',
          color: '#4CAF50',
          size: 'large',
          effects: ['sparkle', 'glow']
        },
        unlockMessage: 'Your pet has evolved into an adult!',
        bonuses: {
          statMultiplier: 1.2,
          experienceBonus: 1.5
        }
      };

      expect(stage.bonuses).toBeDefined();
      expect(stage.bonuses?.statMultiplier).toBe(1.2);
      expect(stage.appearance.effects).toContain('sparkle');
    });
  });

  describe('EvolutionProgress', () => {
    it('should track evolution progress correctly', () => {
      const progress: EvolutionProgress = {
        currentStageId: 'baby',
        availableStages: ['baby', 'child'],
        nextStageId: 'child',
        progressToNext: 45,
        evolutionHistory: [
          {
            stageId: 'baby',
            timestamp: new Date('2023-01-01'),
            level: 1
          }
        ]
      };

      expect(progress.currentStageId).toBe('baby');
      expect(progress.progressToNext).toBe(45);
      expect(progress.evolutionHistory).toHaveLength(1);
    });

    it('should handle final stage without next stage', () => {
      const progress: EvolutionProgress = {
        currentStageId: 'ultimate',
        availableStages: ['baby', 'child', 'adult', 'ultimate'],
        progressToNext: 100,
        evolutionHistory: []
      };

      expect(progress.nextStageId).toBeUndefined();
      expect(progress.progressToNext).toBe(100);
    });
  });

  describe('EvolutionRequirements', () => {
    it('should validate evolution requirements', () => {
      const requirements: EvolutionRequirements = {
        levelMet: true,
        statsMet: {
          happiness: true,
          energy: false,
          health: true
        },
        canEvolve: false,
        missingRequirements: ['energy too low']
      };

      expect(requirements.canEvolve).toBe(false);
      expect(requirements.statsMet.energy).toBe(false);
      expect(requirements.missingRequirements).toContain('energy too low');
    });

    it('should allow evolution when all requirements are met', () => {
      const requirements: EvolutionRequirements = {
        levelMet: true,
        statsMet: {
          happiness: true,
          energy: true,
          health: true
        },
        canEvolve: true,
        missingRequirements: []
      };

      expect(requirements.canEvolve).toBe(true);
      expect(requirements.missingRequirements).toHaveLength(0);
    });
  });

  describe('EvolutionEvent', () => {
    it('should record evolution events with complete data', () => {
      const event: EvolutionEvent = {
        type: 'level_up',
        fromStage: 'baby',
        toStage: 'child',
        timestamp: new Date(),
        petLevel: 5,
        petStats: {
          happiness: 75,
          energy: 80,
          health: 85
        }
      };

      expect(event.type).toBe('level_up');
      expect(event.fromStage).toBe('baby');
      expect(event.toStage).toBe('child');
      expect(event.petLevel).toBe(5);
    });

    it('should support different evolution trigger types', () => {
      const triggers = ['level_up', 'stat_threshold', 'time_based', 'special_action', 'manual'] as const;
      
      triggers.forEach(trigger => {
        const event: EvolutionEvent = {
          type: trigger,
          fromStage: 'stage1',
          toStage: 'stage2',
          timestamp: new Date(),
          petLevel: 1,
          petStats: { happiness: 50, energy: 50, health: 50 }
        };

        expect(event.type).toBe(trigger);
      });
    });
  });

  describe('Type Safety', () => {
    it('should enforce size enum values', () => {
      const validSizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
      
      validSizes.forEach(size => {
        const stage: EvolutionStage = {
          id: 'test',
          name: 'Test',
          requiredLevel: 1,
          requiredStats: { happiness: 0, energy: 0, health: 0 },
          appearance: { emoji: '🐾', color: '#000', size },
          unlockMessage: 'Test'
        };

        expect(stage.appearance.size).toBe(size);
      });
    });

    it('should maintain date type integrity', () => {
      const now = new Date();
      const progress: EvolutionProgress = {
        currentStageId: 'test',
        availableStages: ['test'],
        progressToNext: 0,
        lastEvolutionTime: now,
        evolutionHistory: [
          {
            stageId: 'test',
            timestamp: now,
            level: 1
          }
        ]
      };

      expect(progress.lastEvolutionTime).toBeInstanceOf(Date);
      expect(progress.evolutionHistory[0].timestamp).toBeInstanceOf(Date);
    });
  });
});
