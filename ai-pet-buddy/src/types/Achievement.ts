/**
 * @file Achievement.ts
 * @description Achievement system type definitions for AI Pet Buddy
 *
 * Defines types for badges, titles, achievement tracking, and progress management.
 */

// Achievement categories
export type AchievementCategory =
  | 'evolution'
  | 'game'
  | 'care'
  | 'time'
  | 'level';

// Achievement rarity levels
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

// Badge definition
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  requirements: AchievementRequirement;
  unlocked: boolean;
  unlockedAt?: number; // timestamp
  progress: number; // 0-1 (0% to 100%)
}

// Title definition
export interface Title {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  requirements: AchievementRequirement;
  unlocked: boolean;
  unlockedAt?: number; // timestamp
  active: boolean; // if this title is currently displayed
}

// Achievement requirement definition
export interface AchievementRequirement {
  type:
    | 'evolution_count'
    | 'game_win_streak'
    | 'consecutive_days'
    | 'level_reached'
    | 'stat_max'
    | 'total_games'
    | 'total_playtime';
  value: number;
  description: string;
}

// Achievement progress data
export interface AchievementProgress {
  evolutionCount: number;
  maxWinStreak: number;
  currentWinStreak: number;
  consecutiveDays: number;
  maxLevel: number;
  maxHappiness: number;
  maxEnergy: number;
  totalGames: number;
  totalWins: number;
  totalPlaytime: number; // in minutes
  lastPlayDate: number; // timestamp
  firstPlayDate: number; // timestamp
}

// Achievement state
export interface AchievementState {
  badges: Badge[];
  titles: Title[];
  progress: AchievementProgress;
  newlyUnlocked: string[]; // IDs of newly unlocked achievements
}

// Achievement notification
export interface AchievementNotification {
  id: string;
  type: 'badge' | 'title';
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  timestamp: number;
}

// Default achievement progress
export const DEFAULT_ACHIEVEMENT_PROGRESS: AchievementProgress = {
  evolutionCount: 0,
  maxWinStreak: 0,
  currentWinStreak: 0,
  consecutiveDays: 0,
  maxLevel: 1,
  maxHappiness: 0,
  maxEnergy: 0,
  totalGames: 0,
  totalWins: 0,
  totalPlaytime: 0,
  lastPlayDate: Date.now(),
  firstPlayDate: Date.now(),
};

// Predefined badges
export const PREDEFINED_BADGES: Omit<
  Badge,
  'unlocked' | 'unlockedAt' | 'progress'
>[] = [
  // Evolution badges
  {
    id: 'first-evolution',
    name: '初回進化',
    description: '初めてペットを進化させました',
    icon: '🌟',
    category: 'evolution',
    rarity: 'common',
    requirements: {
      type: 'evolution_count',
      value: 1,
      description: 'ペットを1回進化させる',
    },
  },
  {
    id: 'evolution-master',
    name: '進化マスター',
    description: 'ペットを5回進化させました',
    icon: '🦋',
    category: 'evolution',
    rarity: 'epic',
    requirements: {
      type: 'evolution_count',
      value: 5,
      description: 'ペットを5回進化させる',
    },
  },
  // Game badges
  {
    id: 'game-beginner',
    name: 'ゲーム初心者',
    description: '5連勝を達成しました',
    icon: '🎮',
    category: 'game',
    rarity: 'common',
    requirements: {
      type: 'game_win_streak',
      value: 5,
      description: 'ゲームで5連勝する',
    },
  },
  {
    id: 'game-master',
    name: 'ゲームマスター',
    description: '10連勝を達成しました',
    icon: '🏆',
    category: 'game',
    rarity: 'rare',
    requirements: {
      type: 'game_win_streak',
      value: 10,
      description: 'ゲームで10連勝する',
    },
  },
  {
    id: 'game-legend',
    name: 'ゲームレジェンド',
    description: '20連勝を達成しました',
    icon: '👑',
    category: 'game',
    rarity: 'legendary',
    requirements: {
      type: 'game_win_streak',
      value: 20,
      description: 'ゲームで20連勝する',
    },
  },
  // Care badges
  {
    id: 'week-streak',
    name: '1週間継続',
    description: '7日連続でプレイしました',
    icon: '📅',
    category: 'time',
    rarity: 'common',
    requirements: {
      type: 'consecutive_days',
      value: 7,
      description: '7日連続でプレイする',
    },
  },
  {
    id: 'month-streak',
    name: '1ヶ月継続',
    description: '30日連続でプレイしました',
    icon: '🗓️',
    category: 'time',
    rarity: 'epic',
    requirements: {
      type: 'consecutive_days',
      value: 30,
      description: '30日連続でプレイする',
    },
  },
  // Level badges
  {
    id: 'level-10',
    name: 'レベル10到達',
    description: 'ペットがレベル10に到達しました',
    icon: '⭐',
    category: 'level',
    rarity: 'common',
    requirements: {
      type: 'level_reached',
      value: 10,
      description: 'ペットをレベル10まで育てる',
    },
  },
  {
    id: 'happiness-max',
    name: '幸福度マックス',
    description: '幸福度を100にしました',
    icon: '😊',
    category: 'care',
    rarity: 'rare',
    requirements: {
      type: 'stat_max',
      value: 100,
      description: '幸福度を100にする',
    },
  },
];

// Predefined titles
export const PREDEFINED_TITLES: Omit<
  Title,
  'unlocked' | 'unlockedAt' | 'active'
>[] = [
  {
    id: 'beginner-trainer',
    name: '初心者トレーナー',
    description: 'ペット育成を始めました',
    icon: '🐣',
    category: 'level',
    rarity: 'common',
    requirements: {
      type: 'level_reached',
      value: 1,
      description: 'ゲームを開始する',
    },
  },
  {
    id: 'veteran-trainer',
    name: 'ベテラントレーナー',
    description: 'ペットをレベル10まで育てました',
    icon: '🎓',
    category: 'level',
    rarity: 'rare',
    requirements: {
      type: 'level_reached',
      value: 10,
      description: 'ペットをレベル10まで育てる',
    },
  },
  {
    id: 'master-trainer',
    name: 'マスタートレーナー',
    description: 'すべての統計で高い成績を残しました',
    icon: '👨‍🏫',
    category: 'level',
    rarity: 'legendary',
    requirements: {
      type: 'total_games',
      value: 100,
      description: '100回以上ゲームをプレイする',
    },
  },
  {
    id: 'game-master-title',
    name: 'ゲームマスター',
    description: 'ゲームで優秀な成績を残しました',
    icon: '🎯',
    category: 'game',
    rarity: 'epic',
    requirements: {
      type: 'game_win_streak',
      value: 10,
      description: 'ゲームで10連勝する',
    },
  },
  {
    id: 'care-master',
    name: '愛情マスター',
    description: 'ペットを愛情いっぱいに育てました',
    icon: '💖',
    category: 'care',
    rarity: 'epic',
    requirements: {
      type: 'stat_max',
      value: 100,
      description: '幸福度を100にする',
    },
  },
  {
    id: 'evolution-master-title',
    name: '進化マスター',
    description: 'ペットの進化を極めました',
    icon: '🔥',
    category: 'evolution',
    rarity: 'legendary',
    requirements: {
      type: 'evolution_count',
      value: 5,
      description: 'ペットを5回進化させる',
    },
  },
];
