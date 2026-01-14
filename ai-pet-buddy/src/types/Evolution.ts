/**
 * ペット進化システムの型定義
 *
 * ペットのレベルと状態に基づく進化システムを定義
 * 各進化段階には固有の外観と特性が存在
 */

export interface EvolutionStage {
  /** 進化段階の一意識別子 */
  id: string;

  /** 進化段階の表示名 */
  name: string;

  /** この段階に必要な最低レベル */
  requiredLevel: number;

  /** 進化に必要な最低ステータス */
  requiredStats: {
    happiness: number;
    energy: number;
    health: number;
  };

  /** この段階での外観設定 */
  appearance: {
    /** 表示される絵文字 */
    emoji: string;
    /** メインカラー */
    color: string;
    /** サイズ */
    size: 'small' | 'medium' | 'large';
    /** 特殊エフェクト */
    effects?: string[];
  };

  /** この段階でのボーナス効果 */
  bonuses: {
    happiness: number;
    energy: number;
    health: number;
  };

  /** この段階で解放される機能 */
  unlocks: string[];

  /** 進化段階の説明 */
  description: string;
}

export interface EvolutionProgress {
  /** 現在の進化段階ID */
  currentStage: string;

  /** 最後に進化した時刻 */
  lastEvolutionTime: Date;

  /** 進化履歴 */
  evolutionHistory: EvolutionEvent[];
}

export interface EvolutionRequirements {
  /** 進化可能かどうか */
  canEvolve: boolean;

  /** レベル要求を満たしているか */
  meetsLevel: boolean;

  /** ステータス要求を満たしているか */
  meetsStats: boolean;

  /** 不足している要素 */
  missingRequirements: {
    level: number;
    happiness: number;
    energy: number;
    health: number;
  };
}

export interface EvolutionEvent {
  /** 以前の段階 */
  fromStage: string;

  /** 新しい段階 */
  toStage: string;

  /** イベント発生時刻 */
  timestamp: Date;

  /** ペットのレベル */
  level: number;
}
