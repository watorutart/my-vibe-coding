import { useEffect, useRef } from 'react';
import type { Pet } from '../types/Pet';

interface UseStatDecayOptions {
  decayInterval?: number; // ミリ秒
  minimumTimeBetweenUpdates?: number; // ミリ秒
  decayRates?: {
    happiness: number;
    hunger: number;
    energy: number;
  };
}

const DEFAULT_OPTIONS: Required<UseStatDecayOptions> = {
  decayInterval: 60000, // 1分
  minimumTimeBetweenUpdates: 30000, // 30秒
  decayRates: {
    happiness: 1, // 1分に1ポイント減少
    hunger: 2, // 1分に2ポイント増加
    energy: 1.5, // 1分に1.5ポイント減少
  },
};

export function useStatDecay(
  pet: Pet,
  onUpdate: (updatedPet: Pet) => void,
  options: UseStatDecayOptions = {}
) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!pet || !onUpdate) {
      return;
    }

    // 既存のインターバルをクリア
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastUpdate = now - pet.lastUpdate;

      // 最小更新間隔を確認
      if (timeSinceLastUpdate < config.minimumTimeBetweenUpdates) {
        return;
      }

      // 実際の経過時間に基づいて減衰量を計算
      const minutesPassed = timeSinceLastUpdate / (60 * 1000);

      const updatedStats = {
        happiness: Math.max(
          0,
          pet.stats.happiness - config.decayRates.happiness * minutesPassed
        ),
        hunger: Math.min(
          100,
          pet.stats.hunger + config.decayRates.hunger * minutesPassed
        ),
        energy: Math.max(
          0,
          pet.stats.energy - config.decayRates.energy * minutesPassed
        ),
        level: pet.stats.level, // レベルは減らない
      };

      // ペットの状態を更新
      const updatedPet: Pet = {
        ...pet,
        stats: updatedStats,
        lastUpdate: now,
      };

      onUpdate(updatedPet);
    }, config.decayInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    pet.id,
    pet.lastUpdate,
    onUpdate,
    config.decayInterval,
    config.minimumTimeBetweenUpdates,
  ]);
}
