// Pet related types for the AI Pet Buddy app
export interface PetStats {
  happiness: number; // 0-100
  hunger: number; // 0-100
  energy: number; // 0-100
  level: number; // 1-10
}

export interface Accessory {
  id: string;
  name: string;
  type: string;
}

export interface Pet {
  id: string;
  name: string;
  type: string;
  stats: PetStats;
  lastUpdate: number;
  expression: 'happy' | 'neutral' | 'sad' | 'excited' | 'tired';
  experience?: number; // Experience points for leveling up
  color?: string; // カスタマイズされた色
  accessories?: Accessory[]; // カスタマイズされたアクセサリー
}

export const DEFAULT_PET: Pet = {
  id: 'buddy-001',
  name: 'Buddy',
  type: 'dragon',
  stats: {
    happiness: 80,
    hunger: 60,
    energy: 70,
    level: 1,
  },
  lastUpdate: Date.now(),
  expression: 'happy',
  experience: 0,
  color: '#FF6B6B', // デフォルトの色
  accessories: [], // デフォルトのアクセサリー
};
