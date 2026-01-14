import { describe, it, expect } from 'vitest';
import { DEFAULT_PET, type Pet, type PetStats } from '../types/Pet';

describe('Pet Types', () => {
  describe('DEFAULT_PET', () => {
    it('should have correct initial values', () => {
      expect(DEFAULT_PET.id).toBe('buddy-001');
      expect(DEFAULT_PET.name).toBe('Buddy');
      expect(DEFAULT_PET.type).toBe('dragon');
      expect(DEFAULT_PET.expression).toBe('happy');
    });

    it('should have valid initial stats', () => {
      const stats = DEFAULT_PET.stats;
      expect(stats.happiness).toBe(80);
      expect(stats.hunger).toBe(60);
      expect(stats.energy).toBe(70);
      expect(stats.level).toBe(1);
    });

    it('should have stats within valid ranges', () => {
      const stats = DEFAULT_PET.stats;
      expect(stats.happiness).toBeGreaterThanOrEqual(0);
      expect(stats.happiness).toBeLessThanOrEqual(100);
      expect(stats.hunger).toBeGreaterThanOrEqual(0);
      expect(stats.hunger).toBeLessThanOrEqual(100);
      expect(stats.energy).toBeGreaterThanOrEqual(0);
      expect(stats.energy).toBeLessThanOrEqual(100);
      expect(stats.level).toBeGreaterThanOrEqual(1);
      expect(stats.level).toBeLessThanOrEqual(10);
    });

    it('should have a recent lastUpdate timestamp', () => {
      const now = Date.now();
      const timeDiff = now - DEFAULT_PET.lastUpdate;
      // Should be created within the last few seconds
      expect(timeDiff).toBeLessThan(5000);
    });
  });

  describe('Pet interface', () => {
    it('should accept valid pet expressions', () => {
      const validExpressions: Pet['expression'][] = [
        'happy',
        'neutral',
        'sad',
        'excited',
        'tired',
      ];

      validExpressions.forEach(expression => {
        const pet: Pet = {
          ...DEFAULT_PET,
          expression,
        };
        expect(pet.expression).toBe(expression);
      });
    });
  });

  describe('PetStats interface', () => {
    it('should accept valid stat ranges', () => {
      const validStats: PetStats = {
        happiness: 50,
        hunger: 30,
        energy: 90,
        level: 5,
      };

      expect(validStats.happiness).toBe(50);
      expect(validStats.hunger).toBe(30);
      expect(validStats.energy).toBe(90);
      expect(validStats.level).toBe(5);
    });
  });
});
