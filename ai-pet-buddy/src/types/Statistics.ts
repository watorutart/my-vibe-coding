/**
 * @file Statistics.ts
 * @description Statistics system type definitions for AI Pet Buddy
 * 
 * Defines types for statistical data collection, analysis, and reporting.
 */

// Time period for statistics
export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'all';

// Game statistics
export interface GameStatistics {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number; // 0-1
  maxWinStreak: number;
  currentWinStreak: number;
  averageGameDuration: number; // in seconds
  favoriteGame: string;
  gameBreakdown: {
    [gameType: string]: {
      played: number;
      won: number;
      lost: number;
      winRate: number;
      bestStreak: number;
    };
  };
}

// Pet care statistics
export interface CareStatistics {
  totalFeedings: number;
  totalPlaySessions: number;
  totalRestSessions: number;
  averageHappiness: number;
  averageEnergy: number;
  averageHunger: number;
  maxHappiness: number;
  maxEnergy: number;
  timeSpentCaring: number; // in minutes
  careActions: {
    [action: string]: {
      count: number;
      totalTime: number;
      averageImprovement: number;
    };
  };
}

// Evolution statistics
export interface EvolutionStatistics {
  totalEvolutions: number;
  currentLevel: number;
  maxLevel: number;
  totalExperience: number;
  averageExperiencePerDay: number;
  evolutionHistory: EvolutionRecord[];
  timeToMaxLevel: number; // in days, -1 if not reached
}

// Evolution record for history
export interface EvolutionRecord {
  id: string;
  fromLevel: number;
  toLevel: number;
  timestamp: number;
  experienceGained: number;
  timeTaken: number; // in hours
}

// Play session statistics
export interface PlaySessionStatistics {
  totalSessions: number;
  totalPlaytime: number; // in minutes
  averageSessionLength: number; // in minutes
  longestSession: number; // in minutes
  shortestSession: number; // in minutes
  currentStreak: number; // consecutive days
  longestStreak: number; // max consecutive days
  dailyAverage: number; // average playtime per day
  weeklyAverage: number; // average playtime per week
  monthlyAverage: number; // average playtime per month
  firstPlayDate: number; // timestamp
  lastPlayDate: number; // timestamp
  activeDays: number; // total days played
}

// Daily statistics entry
export interface DailyStatistics {
  date: string; // YYYY-MM-DD format
  playtime: number; // in minutes
  games: {
    played: number;
    won: number;
    lost: number;
  };
  care: {
    feedings: number;
    playTime: number;
    restTime: number;
  };
  pet: {
    startLevel: number;
    endLevel: number;
    experienceGained: number;
    evolutions: number;
  };
  achievements: {
    badgesUnlocked: number;
    titlesUnlocked: number;
  };
}

// Weekly statistics summary
export interface WeeklyStatistics {
  weekStart: string; // YYYY-MM-DD format
  weekEnd: string; // YYYY-MM-DD format
  totalPlaytime: number;
  dailyAverage: number;
  totalGames: number;
  winRate: number;
  petGrowth: {
    levelsGained: number;
    experienceGained: number;
    evolutions: number;
  };
  achievements: {
    badgesUnlocked: number;
    titlesUnlocked: number;
  };
}

// Monthly statistics summary
export interface MonthlyStatistics {
  month: string; // YYYY-MM format
  totalPlaytime: number;
  dailyAverage: number;
  totalGames: number;
  winRate: number;
  petGrowth: {
    levelsGained: number;
    experienceGained: number;
    evolutions: number;
  };
  achievements: {
    badgesUnlocked: number;
    titlesUnlocked: number;
  };
  milestones: string[]; // notable achievements this month
}

// Overall statistics summary
export interface OverallStatistics {
  game: GameStatistics;
  care: CareStatistics;
  evolution: EvolutionStatistics;
  sessions: PlaySessionStatistics;
  createdAt: number; // timestamp
  lastUpdated: number; // timestamp
}

// Statistics data storage
export interface StatisticsData {
  overall: OverallStatistics;
  daily: DailyStatistics[];
  weekly: WeeklyStatistics[];
  monthly: MonthlyStatistics[];
}

// Chart data for visualizations
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

// Chart configuration
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar';
  data: ChartData;
  options?: ChartOptions;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    title?: {
      display?: boolean;
      text?: string;
    };
  };
  scales?: {
    x?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
    y?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
      beginAtZero?: boolean;
    };
  };
}

// Statistics summary for dashboard
export interface StatisticsSummary {
  totalPlaytime: string; // formatted time string
  totalGames: number;
  winRate: number;
  currentLevel: number;
  daysPlayed: number;
  currentStreak: number;
  badgesUnlocked: number;
  titlesUnlocked: number;
  favoriteGame: string;
  petHappiness: number;
}

// Default statistics
export const DEFAULT_GAME_STATISTICS: GameStatistics = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  winRate: 0,
  maxWinStreak: 0,
  currentWinStreak: 0,
  averageGameDuration: 0,
  favoriteGame: '',
  gameBreakdown: {}
};

export const DEFAULT_CARE_STATISTICS: CareStatistics = {
  totalFeedings: 0,
  totalPlaySessions: 0,
  totalRestSessions: 0,
  averageHappiness: 0,
  averageEnergy: 0,
  averageHunger: 0,
  maxHappiness: 0,
  maxEnergy: 0,
  timeSpentCaring: 0,
  careActions: {}
};

export const DEFAULT_EVOLUTION_STATISTICS: EvolutionStatistics = {
  totalEvolutions: 0,
  currentLevel: 1,
  maxLevel: 1,
  totalExperience: 0,
  averageExperiencePerDay: 0,
  evolutionHistory: [],
  timeToMaxLevel: -1
};

export const DEFAULT_PLAY_SESSION_STATISTICS: PlaySessionStatistics = {
  totalSessions: 0,
  totalPlaytime: 0,
  averageSessionLength: 0,
  longestSession: 0,
  shortestSession: 0,
  currentStreak: 0,
  longestStreak: 0,
  dailyAverage: 0,
  weeklyAverage: 0,
  monthlyAverage: 0,
  firstPlayDate: Date.now(),
  lastPlayDate: Date.now(),
  activeDays: 0
};

export const DEFAULT_OVERALL_STATISTICS: OverallStatistics = {
  game: DEFAULT_GAME_STATISTICS,
  care: DEFAULT_CARE_STATISTICS,
  evolution: DEFAULT_EVOLUTION_STATISTICS,
  sessions: DEFAULT_PLAY_SESSION_STATISTICS,
  createdAt: Date.now(),
  lastUpdated: Date.now()
};

export const DEFAULT_STATISTICS_DATA: StatisticsData = {
  overall: DEFAULT_OVERALL_STATISTICS,
  daily: [],
  weekly: [],
  monthly: []
};

// Utility functions for statistics
export function formatPlaytime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}時間${remainingMinutes}分` : `${hours}時間`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}日${remainingHours}時間` : `${days}日`;
}

export function formatWinRate(winRate: number): string {
  return `${Math.round(winRate * 100)}%`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('ja-JP');
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('ja-JP');
}

// Color palette for charts
export const CHART_COLORS = {
  primary: '#4f46e5',
  secondary: '#06b6d4',
  accent: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  background: '#f8fafc',
  text: '#1e293b'
};

export const CHART_COLOR_PALETTE = [
  '#4f46e5', // indigo
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#3b82f6', // blue
  '#f97316', // orange
  '#84cc16', // lime
  '#ec4899', // pink
  '#6b7280', // gray
  '#14b8a6'  // teal
];