/**
 * @file Analytics.ts
 * @description Analytics system type definitions for AI Pet Buddy
 * 
 * Defines types for analytics dashboard, data visualization, and insights.
 */

import type { ChartConfig, TimePeriod } from './Statistics';
import type { AchievementNotification } from './Achievement';

// Analytics dashboard section types
export type DashboardSection = 'overview' | 'games' | 'care' | 'evolution' | 'achievements' | 'export';

// Analytics insight types
export type InsightType = 'trend' | 'milestone' | 'recommendation' | 'warning' | 'celebration';

// Analytics insight
export interface AnalyticsInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
  actionable: boolean;
  action?: {
    label: string;
    handler: string; // function name or action type
  };
}

// Dashboard widget configuration
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'stat' | 'chart' | 'list' | 'progress' | 'badge';
  size: 'small' | 'medium' | 'large';
  position: {
    row: number;
    col: number;
    width: number;
    height: number;
  };
  data: WidgetData;
  refreshRate?: number; // in seconds, 0 for no auto-refresh
  visible: boolean;
}

// Widget data union type
export type WidgetData = StatWidgetData | ChartWidgetData | ListWidgetData | ProgressWidgetData | BadgeWidgetData;

// Stat widget data
export interface StatWidgetData {
  type: 'stat';
  value: string | number;
  label: string;
  icon?: string;
  color?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: number;
    label: string;
  };
}

// Chart widget data
export interface ChartWidgetData {
  type: 'chart';
  chartConfig: ChartConfig;
  loading?: boolean;
  error?: string;
}

// List widget data
export interface ListWidgetData {
  type: 'list';
  items: ListItem[];
  maxItems?: number;
  showMore?: boolean;
}

export interface ListItem {
  id: string;
  icon?: string;
  title: string;
  subtitle?: string;
  value?: string;
  timestamp?: number;
}

// Progress widget data
export interface ProgressWidgetData {
  type: 'progress';
  items: ProgressItem[];
}

export interface ProgressItem {
  id: string;
  label: string;
  current: number;
  max: number;
  color?: string;
  icon?: string;
}

// Badge widget data
export interface BadgeWidgetData {
  type: 'badge';
  badges: BadgeItem[];
  layout: 'grid' | 'list';
}

export interface BadgeItem {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress?: number;
}

// Dashboard layout
export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  created: number;
  lastModified: number;
}

// Analytics configuration
export interface AnalyticsConfig {
  defaultTimePeriod: TimePeriod;
  refreshInterval: number; // in seconds
  maxInsights: number;
  enableNotifications: boolean;
  enableAutoRefresh: boolean;
  theme: 'light' | 'dark' | 'auto';
  layout: DashboardLayout;
}

// Export configuration
export interface ExportConfig {
  format: 'json' | 'csv' | 'pdf';
  sections: DashboardSection[];
  timePeriod: TimePeriod;
  includeCharts: boolean;
  includeAchievements: boolean;
  includePersonalData: boolean;
}

// Export data structure
export interface ExportData {
  metadata: {
    exportDate: number;
    appVersion: string;
    dataVersion: string;
    format: string;
    timePeriod: TimePeriod;
  };
  pet: {
    name: string;
    level: number;
    experience: number;
    stats: {
      happiness: number;
      energy: number;
      hunger: number;
    };
  };
  statistics: {
    totalPlaytime: number;
    totalGames: number;
    winRate: number;
    achievements: {
      badgesUnlocked: number;
      titlesUnlocked: number;
    };
  };
  achievements?: {
    badges: Array<{
      id: string;
      name: string;
      unlocked: boolean;
      unlockedAt?: number;
    }>;
    titles: Array<{
      id: string;
      name: string;
      unlocked: boolean;
      active: boolean;
      unlockedAt?: number;
    }>;
  };
  history?: {
    daily: Array<{
      date: string;
      playtime: number;
      games: number;
      achievements: number;
    }>;
  };
}

// Analytics event tracking
export interface AnalyticsEvent {
  id: string;
  type: 'game_start' | 'game_end' | 'achievement_unlock' | 'level_up' | 'care_action' | 'app_open' | 'app_close';
  timestamp: number;
  data: EventData;
}

export type EventData = GameEventData | AchievementEventData | LevelUpEventData | CareEventData | AppEventData;

export interface GameEventData {
  gameType: string;
  result?: 'win' | 'lose' | 'draw';
  duration?: number;
  streak?: number;
}

export interface AchievementEventData {
  achievementId: string;
  achievementType: 'badge' | 'title';
  category: string;
  rarity: string;
}

export interface LevelUpEventData {
  fromLevel: number;
  toLevel: number;
  experienceGained: number;
  totalExperience: number;
}

export interface CareEventData {
  action: 'feed' | 'play' | 'rest';
  statsBefore: {
    happiness: number;
    energy: number;
    hunger: number;
  };
  statsAfter: {
    happiness: number;
    energy: number;
    hunger: number;
  };
}

export interface AppEventData {
  sessionDuration?: number;
  screenTime?: number;
  actionsPerformed?: number;
}

// Analytics service response
export interface AnalyticsResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// Real-time analytics data
export interface RealtimeAnalytics {
  currentSession: {
    startTime: number;
    duration: number;
    actionsPerformed: number;
    gamesPlayed: number;
    lastActivity: number;
  };
  today: {
    playtime: number;
    games: number;
    achievements: number;
    careActions: number;
  };
  notifications: AchievementNotification[];
  insights: AnalyticsInsight[];
}

// Default configurations
export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  defaultTimePeriod: 'weekly',
  refreshInterval: 30,
  maxInsights: 5,
  enableNotifications: true,
  enableAutoRefresh: true,
  theme: 'auto',
  layout: {
    id: 'default',
    name: 'Default Layout',
    widgets: [],
    created: Date.now(),
    lastModified: Date.now()
  }
};

export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  format: 'json',
  sections: ['overview', 'games', 'achievements'],
  timePeriod: 'all',
  includeCharts: false,
  includeAchievements: true,
  includePersonalData: true
};

// Default dashboard widgets
export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidget[] = [
  {
    id: 'total-playtime',
    title: 'Total Playtime',
    type: 'stat',
    size: 'small',
    position: { row: 0, col: 0, width: 1, height: 1 },
    data: {
      type: 'stat',
      value: '0分',
      label: 'Total Playtime',
      icon: '⏱️',
      color: '#4f46e5'
    },
    visible: true
  },
  {
    id: 'win-rate',
    title: 'Win Rate',
    type: 'stat',
    size: 'small',
    position: { row: 0, col: 1, width: 1, height: 1 },
    data: {
      type: 'stat',
      value: '0%',
      label: 'Win Rate',
      icon: '🏆',
      color: '#10b981'
    },
    visible: true
  },
  {
    id: 'current-level',
    title: 'Current Level',
    type: 'stat',
    size: 'small',
    position: { row: 0, col: 2, width: 1, height: 1 },
    data: {
      type: 'stat',
      value: 1,
      label: 'Level',
      icon: '⭐',
      color: '#f59e0b'
    },
    visible: true
  },
  {
    id: 'achievements',
    title: 'Achievements',
    type: 'stat',
    size: 'small',
    position: { row: 0, col: 3, width: 1, height: 1 },
    data: {
      type: 'stat',
      value: 0,
      label: 'Unlocked',
      icon: '🏅',
      color: '#8b5cf6'
    },
    visible: true
  },
  {
    id: 'playtime-chart',
    title: 'Weekly Playtime',
    type: 'chart',
    size: 'large',
    position: { row: 1, col: 0, width: 4, height: 2 },
    data: {
      type: 'chart',
      chartConfig: {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Playtime (minutes)',
            data: [0, 0, 0, 0, 0, 0, 0],
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Minutes'
              }
            }
          }
        }
      }
    },
    visible: true
  },
  {
    id: 'recent-achievements',
    title: 'Recent Achievements',
    type: 'list',
    size: 'medium',
    position: { row: 3, col: 0, width: 2, height: 2 },
    data: {
      type: 'list',
      items: [],
      maxItems: 5
    },
    visible: true
  },
  {
    id: 'pet-progress',
    title: 'Pet Progress',
    type: 'progress',
    size: 'medium',
    position: { row: 3, col: 2, width: 2, height: 2 },
    data: {
      type: 'progress',
      items: [
        {
          id: 'happiness',
          label: 'Happiness',
          current: 0,
          max: 100,
          color: '#f59e0b',
          icon: '😊'
        },
        {
          id: 'energy',
          label: 'Energy',
          current: 0,
          max: 100,
          color: '#10b981',
          icon: '⚡'
        },
        {
          id: 'hunger',
          label: 'Hunger',
          current: 0,
          max: 100,
          color: '#ef4444',
          icon: '🍽️'
        }
      ]
    },
    visible: true
  }
];

// Predefined insights templates
export const INSIGHT_TEMPLATES: Record<string, Omit<AnalyticsInsight, 'id' | 'timestamp'>> = {
  firstAchievement: {
    type: 'celebration',
    title: '初めてのアチーブメント！',
    description: 'おめでとうございます！最初のバッジを獲得しました。',
    icon: '🎉',
    priority: 'high',
    actionable: false
  },
  winningStreak: {
    type: 'milestone',
    title: '連勝記録更新！',
    description: '素晴らしい成績です！この調子で頑張りましょう。',
    icon: '🔥',
    priority: 'medium',
    actionable: false
  },
  careReminder: {
    type: 'recommendation',
    title: 'ペットのお世話',
    description: 'ペットの幸福度が下がっています。お世話をしてあげましょう。',
    icon: '💝',
    priority: 'medium',
    actionable: true,
    action: {
      label: 'お世話する',
      handler: 'showCarePanel'
    }
  },
  playReminder: {
    type: 'recommendation',
    title: 'ゲームで遊ぼう',
    description: '今日はまだゲームをプレイしていません。一緒に遊びませんか？',
    icon: '🎮',
    priority: 'low',
    actionable: true,
    action: {
      label: 'ゲームする',
      handler: 'showGamePanel'
    }
  },
  levelUp: {
    type: 'celebration',
    title: 'レベルアップ！',
    description: 'ペットがレベルアップしました！おめでとうございます！',
    icon: '⭐',
    priority: 'high',
    actionable: false
  }
};