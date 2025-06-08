import type {
  EvolutionEvent,
  EvolutionProgress,
  EvolutionRequirements,
  EvolutionStage
} from '../types/Evolution';
import type { Pet } from '../types/Pet';

// Pet統計の取得ヘルパー
function getPetStats(pet: Pet) {
  return {
    level: pet.stats.level,
    happiness: pet.stats.happiness,
    energy: pet.stats.energy,
    health: 100 - pet.stats.hunger // health = 100 - hunger
  };
}

// Pet統計の更新ヘルパー
function updatePetStats(pet: Pet, updates: Partial<{happiness: number; energy: number; health: number}>): Pet {
  const newHunger = updates.health !== undefined ? 100 - updates.health : pet.stats.hunger;
  return {
    ...pet,
    stats: {
      ...pet.stats,
      happiness: updates.happiness ?? pet.stats.happiness,
      energy: updates.energy ?? pet.stats.energy,
      hunger: newHunger
    }
  };
}

/**
 * 進化ステージの定義
 */
export const EVOLUTION_STAGES: EvolutionStage[] = [
  {
    id: 'baby',
    name: 'Baby Pet',
    requiredLevel: 1,
    requiredStats: {
      happiness: 10,
      energy: 10,
      health: 10
    },
    appearance: {
      emoji: '🥚',
      color: '#FFE4B5',
      size: 'small'
    },
    bonuses: {
      happiness: 0,
      energy: 0,
      health: 0
    },
    unlocks: ['basic_care'],
    description: 'A newly hatched pet that needs lots of care'
  },
  {
    id: 'child',
    name: 'Young Pet',
    requiredLevel: 5,
    requiredStats: {
      happiness: 30,
      energy: 25,
      health: 20
    },
    appearance: {
      emoji: '🐣',
      color: '#F0F8FF',
      size: 'medium'
    },
    bonuses: {
      happiness: 5,
      energy: 3,
      health: 2
    },
    unlocks: ['play_games', 'basic_training'],
    description: 'An energetic young pet ready to explore'
  },
  {
    id: 'teen',
    name: 'Teen Pet',
    requiredLevel: 15,
    requiredStats: {
      happiness: 60,
      energy: 50,
      health: 45
    },
    appearance: {
      emoji: '🐱',
      color: '#FFE4E1',
      size: 'medium'
    },
    bonuses: {
      happiness: 10,
      energy: 8,
      health: 6
    },
    unlocks: ['advanced_games', 'social_interaction'],
    description: 'A playful teen pet with growing independence'
  },
  {
    id: 'adult',
    name: 'Adult Pet',
    requiredLevel: 30,
    requiredStats: {
      happiness: 80,
      energy: 70,
      health: 65
    },
    appearance: {
      emoji: '🐈',
      color: '#DDA0DD',
      size: 'large'
    },
    bonuses: {
      happiness: 15,
      energy: 12,
      health: 10
    },
    unlocks: ['expert_training', 'leadership_skills'],
    description: 'A mature adult pet with full capabilities'
  },
  {
    id: 'elder',
    name: 'Elder Pet',
    requiredLevel: 50,
    requiredStats: {
      happiness: 95,
      energy: 85,
      health: 80
    },
    appearance: {
      emoji: '🦁',
      color: '#FFD700',
      size: 'large'
    },
    bonuses: {
      happiness: 20,
      energy: 15,
      health: 15
    },
    unlocks: ['wisdom_sharing', 'mentoring'],
    description: 'A wise elder pet with maximum experience'
  }
];

/**
 * 現在の進化ステージを取得
 * @param pet - ペットオブジェクト
 * @returns 現在の進化ステージ
 */
export function getCurrentEvolutionStage(pet: Pet): EvolutionStage {
  const stats = getPetStats(pet);
  
  // レベルのみに基づいて理論的な最大ステージを決定
  // これは初期化時の推測にのみ使用される
  for (let i = EVOLUTION_STAGES.length - 1; i >= 0; i--) {
    const stage = EVOLUTION_STAGES[i];
    if (stats.level >= stage.requiredLevel) {
      return stage;
    }
  }
  
  // デフォルトは最初のステージ（baby）
  return EVOLUTION_STAGES[0];
}

/**
 * 次の進化ステージを取得
 * @param pet - ペットオブジェクト  
 * @param progress - 現在の進化プログレス
 * @returns 次の進化ステージ（最終ステージの場合はnull）
 */
export function getNextEvolutionStage(pet: Pet, progress?: EvolutionProgress): EvolutionStage | null {
  // 進化プログレスが提供されている場合は、それを使用
  const currentStageId = progress ? progress.currentStage : getCurrentEvolutionStage(pet).id;
  const currentIndex = EVOLUTION_STAGES.findIndex(stage => stage.id === currentStageId);
  
  if (currentIndex === -1 || currentIndex >= EVOLUTION_STAGES.length - 1) {
    return null; // 最終ステージまたは見つからない場合
  }
  
  // 次のステージを返す
  return EVOLUTION_STAGES[currentIndex + 1];
}

/**
 * 進化の条件をチェック
 * @param pet - ペットオブジェクト
 * @param targetStage - 目標進化ステージ
 * @returns 進化要件の詳細
 */
export function checkEvolutionRequirements(pet: Pet, targetStage: EvolutionStage): EvolutionRequirements {
  const stats = getPetStats(pet);
  
  const meetsLevel = stats.level >= targetStage.requiredLevel;
  const meetsHappiness = stats.happiness >= targetStage.requiredStats.happiness;
  const meetsEnergy = stats.energy >= targetStage.requiredStats.energy;
  const meetsHealth = stats.health >= targetStage.requiredStats.health;
  
  const canEvolve = meetsLevel && meetsHappiness && meetsEnergy && meetsHealth;
  const meetsStats = meetsHappiness && meetsEnergy && meetsHealth;
  
  return {
    canEvolve,
    meetsLevel,
    meetsStats,
    missingRequirements: {
      level: meetsLevel ? 0 : targetStage.requiredLevel - stats.level,
      happiness: meetsHappiness ? 0 : targetStage.requiredStats.happiness - stats.happiness,
      energy: meetsEnergy ? 0 : targetStage.requiredStats.energy - stats.energy,
      health: meetsHealth ? 0 : targetStage.requiredStats.health - stats.health
    }
  };
}

/**
 * 進化を実行
 * @param pet - ペットオブジェクト
 * @param progress - 進化プログレス
 * @returns 更新されたペットと進化プログレス、進化イベント
 */
export function evolvepet(
  pet: Pet, 
  progress: EvolutionProgress
): { pet: Pet; progress: EvolutionProgress; event: EvolutionEvent | null } {
  const nextStage = getNextEvolutionStage(pet, progress);
  
  if (!nextStage) {
    return { pet, progress, event: null };
  }
  
  const requirements = checkEvolutionRequirements(pet, nextStage);
  
  if (!requirements.canEvolve) {
    return { pet, progress, event: null };
  }
  
  // 現在の統計値を取得
  const stats = getPetStats(pet);
  
  // 進化を実行
  const now = new Date();
  const updatedPet = updatePetStats(pet, {
    happiness: Math.min(100, stats.happiness + nextStage.bonuses.happiness),
    energy: Math.min(100, stats.energy + nextStage.bonuses.energy),
    health: Math.min(100, stats.health + nextStage.bonuses.health)
  });
  
  const evolutionEvent: EvolutionEvent = {
    fromStage: progress.currentStage,
    toStage: nextStage.id,
    timestamp: now,
    level: stats.level
  };
  
  const updatedProgress: EvolutionProgress = {
    currentStage: nextStage.id,
    lastEvolutionTime: now,
    evolutionHistory: [...progress.evolutionHistory, evolutionEvent]
  };
  
  return {
    pet: updatedPet,
    progress: updatedProgress,
    event: evolutionEvent
  };
}

/**
 * 進化プログレスの初期化
 * @returns 初期進化プログレス
 */
export function createInitialEvolutionProgress(): EvolutionProgress {
  const now = new Date();
  return {
    currentStage: 'baby',
    lastEvolutionTime: now,
    evolutionHistory: [{
      fromStage: 'none',
      toStage: 'baby',
      timestamp: now,
      level: 1
    }]
  };
}

/**
 * 進化プログレスの計算
 * @param pet - ペットオブジェクト
 * @param progress - 現在の進化プログレス（省略可能）
 * @returns 次の進化までの進捗率（0-100）
 */
export function calculateEvolutionProgress(pet: Pet, progress?: EvolutionProgress): number {
  const nextStage = getNextEvolutionStage(pet, progress);
  
  if (!nextStage) {
    return 100; // 最終ステージ
  }
  
  const stats = getPetStats(pet);
  
  // 各要件の達成率を計算（0で割らないよう注意）
  const levelProgress = nextStage.requiredLevel > 0 
    ? Math.min(100, (stats.level / nextStage.requiredLevel) * 100)
    : 100;
  
  const happinessProgress = nextStage.requiredStats.happiness > 0
    ? Math.min(100, (stats.happiness / nextStage.requiredStats.happiness) * 100)
    : 100;
    
  const energyProgress = nextStage.requiredStats.energy > 0
    ? Math.min(100, (stats.energy / nextStage.requiredStats.energy) * 100)
    : 100;
    
  const healthProgress = nextStage.requiredStats.health > 0
    ? Math.min(100, (stats.health / nextStage.requiredStats.health) * 100)
    : 100;
  
  // 全体の進捗率を計算（最も低い要件に基づく）
  const overallProgress = Math.min(levelProgress, happinessProgress, energyProgress, healthProgress);
  
  // 四捨五入して返す
  return Math.round(overallProgress);
}

/**
 * ペットの現在のレベルに基づいて進化プログレスを同期する
 * @param pet - ペットオブジェクト
 * @param progress - 現在の進化プログレス（省略可能）
 * @returns 同期された進化プログレス
 */
export function syncProgressWithPet(pet: Pet, progress?: EvolutionProgress): EvolutionProgress {
  // 初期プログレスが提供されている場合は、それを尊重する
  if (progress) {
    return progress;
  }
  
  const stats = getPetStats(pet);
  const now = new Date();
  
  // ペットが既に最高レベル（elder stage要件）に達している場合は、elder stageに設定
  const elderStage = EVOLUTION_STAGES[EVOLUTION_STAGES.length - 1];
  if (stats.level >= elderStage.requiredLevel) {
    return {
      currentStage: elderStage.id,
      lastEvolutionTime: now,
      evolutionHistory: [{
        fromStage: 'none',
        toStage: elderStage.id,
        timestamp: now,
        level: stats.level
      }]
    };
  }
  
  // それ以外の場合は、常にbaby stageから開始する
  // これにより、進化システムがペットの実際の進化の旅路を追跡できる
  return {
    currentStage: 'baby',
    lastEvolutionTime: now,
    evolutionHistory: [{
      fromStage: 'none',
      toStage: 'baby',
      timestamp: now,
      level: stats.level
    }]
  };
}
