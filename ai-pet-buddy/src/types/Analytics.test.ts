/**
 * @file Analytics.test.ts
 * @description Tests for Analytics type definitions and configurations
 */

import { describe, it, expect } from 'vitest';
import type {
  DashboardSection,
  InsightType,
  AnalyticsInsight,
  DashboardWidget,
  WidgetData,
  StatWidgetData,
  ChartWidgetData,
  ListWidgetData,
  ProgressWidgetData,
  BadgeWidgetData,
  DashboardLayout,
  AnalyticsConfig,
  ExportConfig,
  ExportData,
  AnalyticsEvent,
  RealtimeAnalytics,
  AnalyticsResponse,
} from './Analytics';
import {
  DEFAULT_ANALYTICS_CONFIG,
  DEFAULT_EXPORT_CONFIG,
  DEFAULT_DASHBOARD_WIDGETS,
  INSIGHT_TEMPLATES,
} from './Analytics';

describe('Analytics Types', () => {
  describe('DashboardSection', () => {
    it('should have valid section types', () => {
      const validSections: DashboardSection[] = [
        'overview',
        'games',
        'care',
        'evolution',
        'achievements',
        'export',
      ];

      validSections.forEach(section => {
        expect(typeof section).toBe('string');
        expect([
          'overview',
          'games',
          'care',
          'evolution',
          'achievements',
          'export',
        ]).toContain(section);
      });
    });
  });

  describe('InsightType', () => {
    it('should have valid insight types', () => {
      const validTypes: InsightType[] = [
        'trend',
        'milestone',
        'recommendation',
        'warning',
        'celebration',
      ];

      validTypes.forEach(type => {
        expect(typeof type).toBe('string');
        expect([
          'trend',
          'milestone',
          'recommendation',
          'warning',
          'celebration',
        ]).toContain(type);
      });
    });
  });

  describe('AnalyticsInsight', () => {
    it('should create valid insight object', () => {
      const insight: AnalyticsInsight = {
        id: 'test-insight',
        type: 'milestone',
        title: 'Test Milestone',
        description: 'A test milestone achievement',
        icon: '🎉',
        priority: 'high',
        timestamp: Date.now(),
        actionable: true,
        action: {
          label: 'Take Action',
          handler: 'handleTestAction',
        },
      };

      expect(insight.id).toBe('test-insight');
      expect([
        'trend',
        'milestone',
        'recommendation',
        'warning',
        'celebration',
      ]).toContain(insight.type);
      expect(['high', 'medium', 'low']).toContain(insight.priority);
      expect(typeof insight.timestamp).toBe('number');
      expect(insight.actionable).toBe(true);
      expect(insight.action).toBeDefined();
    });

    it('should handle non-actionable insight', () => {
      const insight: AnalyticsInsight = {
        id: 'celebration-insight',
        type: 'celebration',
        title: 'Great Job!',
        description: 'You achieved something great!',
        icon: '🎉',
        priority: 'medium',
        timestamp: Date.now(),
        actionable: false,
      };

      expect(insight.actionable).toBe(false);
      expect(insight.action).toBeUndefined();
    });
  });

  describe('DashboardWidget', () => {
    it('should create valid widget object', () => {
      const widget: DashboardWidget = {
        id: 'test-widget',
        title: 'Test Widget',
        type: 'stat',
        size: 'medium',
        position: {
          row: 0,
          col: 0,
          width: 2,
          height: 1,
        },
        data: {
          type: 'stat',
          value: 100,
          label: 'Test Stat',
          icon: '📊',
          color: '#4f46e5',
        } as StatWidgetData,
        refreshRate: 30,
        visible: true,
      };

      expect(widget.id).toBe('test-widget');
      expect(['stat', 'chart', 'list', 'progress', 'badge']).toContain(
        widget.type
      );
      expect(['small', 'medium', 'large']).toContain(widget.size);
      expect(widget.position.row).toBeGreaterThanOrEqual(0);
      expect(widget.position.col).toBeGreaterThanOrEqual(0);
      expect(widget.position.width).toBeGreaterThan(0);
      expect(widget.position.height).toBeGreaterThan(0);
      expect(widget.visible).toBe(true);
    });
  });

  describe('Widget Data Types', () => {
    describe('StatWidgetData', () => {
      it('should create valid stat widget data', () => {
        const statData: StatWidgetData = {
          type: 'stat',
          value: '1,234',
          label: 'Total Points',
          icon: '⭐',
          color: '#10b981',
          trend: {
            direction: 'up',
            value: 15,
            label: '+15 from last week',
          },
        };

        expect(statData.type).toBe('stat');
        expect(statData.value).toBe('1,234');
        expect(statData.trend?.direction).toBe('up');
        expect(['up', 'down', 'neutral']).toContain(statData.trend!.direction);
      });
    });

    describe('ChartWidgetData', () => {
      it('should create valid chart widget data', () => {
        const chartData: ChartWidgetData = {
          type: 'chart',
          chartConfig: {
            type: 'line',
            data: {
              labels: ['Jan', 'Feb', 'Mar'],
              datasets: [
                {
                  label: 'Test Data',
                  data: [10, 20, 30],
                },
              ],
            },
          },
          loading: false,
        };

        expect(chartData.type).toBe('chart');
        expect(chartData.chartConfig.type).toBe('line');
        expect(chartData.chartConfig.data.labels).toHaveLength(3);
        expect(chartData.loading).toBe(false);
      });

      it('should handle loading and error states', () => {
        const chartData: ChartWidgetData = {
          type: 'chart',
          chartConfig: {
            type: 'bar',
            data: {
              labels: [],
              datasets: [],
            },
          },
          loading: true,
          error: 'Failed to load data',
        };

        expect(chartData.loading).toBe(true);
        expect(chartData.error).toBe('Failed to load data');
      });
    });

    describe('ListWidgetData', () => {
      it('should create valid list widget data', () => {
        const listData: ListWidgetData = {
          type: 'list',
          items: [
            {
              id: 'item1',
              icon: '🏆',
              title: 'Achievement Unlocked',
              subtitle: 'First Victory',
              value: 'Just now',
              timestamp: Date.now(),
            },
            {
              id: 'item2',
              title: 'Level Up',
              subtitle: 'Level 5 reached',
            },
          ],
          maxItems: 5,
          showMore: true,
        };

        expect(listData.type).toBe('list');
        expect(listData.items).toHaveLength(2);
        expect(listData.items[0].id).toBe('item1');
        expect(listData.maxItems).toBe(5);
        expect(listData.showMore).toBe(true);
      });
    });

    describe('ProgressWidgetData', () => {
      it('should create valid progress widget data', () => {
        const progressData: ProgressWidgetData = {
          type: 'progress',
          items: [
            {
              id: 'health',
              label: 'Health',
              current: 80,
              max: 100,
              color: '#10b981',
              icon: '❤️',
            },
            {
              id: 'xp',
              label: 'Experience',
              current: 750,
              max: 1000,
              color: '#f59e0b',
            },
          ],
        };

        expect(progressData.type).toBe('progress');
        expect(progressData.items).toHaveLength(2);
        expect(progressData.items[0].current).toBeLessThanOrEqual(
          progressData.items[0].max
        );
        expect(progressData.items[1].current).toBeLessThanOrEqual(
          progressData.items[1].max
        );
      });
    });

    describe('BadgeWidgetData', () => {
      it('should create valid badge widget data', () => {
        const badgeData: BadgeWidgetData = {
          type: 'badge',
          badges: [
            {
              id: 'first-win',
              name: 'First Victory',
              icon: '🏆',
              unlocked: true,
              rarity: 'common',
            },
            {
              id: 'master',
              name: 'Master Player',
              icon: '👑',
              unlocked: false,
              rarity: 'legendary',
              progress: 0.6,
            },
          ],
          layout: 'grid',
        };

        expect(badgeData.type).toBe('badge');
        expect(badgeData.badges).toHaveLength(2);
        expect(['common', 'rare', 'epic', 'legendary']).toContain(
          badgeData.badges[0].rarity
        );
        expect(['grid', 'list']).toContain(badgeData.layout);
        expect(badgeData.badges[1].progress).toBe(0.6);
      });
    });
  });

  describe('DashboardLayout', () => {
    it('should create valid dashboard layout', () => {
      const layout: DashboardLayout = {
        id: 'custom-layout',
        name: 'My Custom Layout',
        widgets: [],
        created: Date.now(),
        lastModified: Date.now(),
      };

      expect(layout.id).toBe('custom-layout');
      expect(layout.name).toBe('My Custom Layout');
      expect(Array.isArray(layout.widgets)).toBe(true);
      expect(typeof layout.created).toBe('number');
      expect(typeof layout.lastModified).toBe('number');
    });
  });

  describe('AnalyticsConfig', () => {
    it('should create valid analytics configuration', () => {
      const config: AnalyticsConfig = {
        defaultTimePeriod: 'monthly',
        refreshInterval: 60,
        maxInsights: 10,
        enableNotifications: true,
        enableAutoRefresh: false,
        theme: 'dark',
        layout: {
          id: 'main',
          name: 'Main Layout',
          widgets: [],
          created: Date.now(),
          lastModified: Date.now(),
        },
      };

      expect(['daily', 'weekly', 'monthly', 'all']).toContain(
        config.defaultTimePeriod
      );
      expect(config.refreshInterval).toBeGreaterThan(0);
      expect(config.maxInsights).toBeGreaterThan(0);
      expect(['light', 'dark', 'auto']).toContain(config.theme);
    });
  });

  describe('ExportConfig', () => {
    it('should create valid export configuration', () => {
      const exportConfig: ExportConfig = {
        format: 'csv',
        sections: ['overview', 'games', 'achievements'],
        timePeriod: 'weekly',
        includeCharts: true,
        includeAchievements: true,
        includePersonalData: false,
      };

      expect(['json', 'csv', 'pdf']).toContain(exportConfig.format);
      expect(exportConfig.sections).toHaveLength(3);
      expect(['daily', 'weekly', 'monthly', 'all']).toContain(
        exportConfig.timePeriod
      );
      expect(typeof exportConfig.includeCharts).toBe('boolean');
    });
  });

  describe('ExportData', () => {
    it('should create valid export data structure', () => {
      const exportData: ExportData = {
        metadata: {
          exportDate: Date.now(),
          appVersion: '1.0.0',
          dataVersion: '1.0',
          format: 'json',
          timePeriod: 'all',
        },
        pet: {
          name: 'Buddy',
          level: 5,
          experience: 1250,
          stats: {
            happiness: 85,
            energy: 90,
            hunger: 30,
          },
        },
        statistics: {
          totalPlaytime: 1500,
          totalGames: 100,
          winRate: 0.65,
          achievements: {
            badgesUnlocked: 8,
            titlesUnlocked: 2,
          },
        },
        achievements: {
          badges: [
            {
              id: 'first-win',
              name: 'First Victory',
              unlocked: true,
              unlockedAt: Date.now() - 86400000,
            },
          ],
          titles: [
            {
              id: 'beginner',
              name: 'Beginner',
              unlocked: true,
              active: true,
              unlockedAt: Date.now() - 86400000,
            },
          ],
        },
      };

      expect(exportData.metadata.appVersion).toBe('1.0.0');
      expect(exportData.pet.level).toBeGreaterThan(0);
      expect(exportData.statistics.winRate).toBeGreaterThanOrEqual(0);
      expect(exportData.statistics.winRate).toBeLessThanOrEqual(1);
      expect(Array.isArray(exportData.achievements?.badges)).toBe(true);
    });
  });

  describe('AnalyticsEvent', () => {
    it('should create valid analytics event', () => {
      const event: AnalyticsEvent = {
        id: 'event-123',
        type: 'game_end',
        timestamp: Date.now(),
        data: {
          gameType: 'rock-paper-scissors',
          result: 'win',
          duration: 45,
          streak: 3,
        },
      };

      expect(event.id).toBe('event-123');
      expect([
        'game_start',
        'game_end',
        'achievement_unlock',
        'level_up',
        'care_action',
        'app_open',
        'app_close',
      ]).toContain(event.type);
      expect(typeof event.timestamp).toBe('number');
      expect(event.data).toBeDefined();
    });
  });

  describe('RealtimeAnalytics', () => {
    it('should create valid realtime analytics data', () => {
      const realtime: RealtimeAnalytics = {
        currentSession: {
          startTime: Date.now() - 1800000, // 30 minutes ago
          duration: 1800, // 30 minutes
          actionsPerformed: 15,
          gamesPlayed: 5,
          lastActivity: Date.now() - 60000, // 1 minute ago
        },
        today: {
          playtime: 120,
          games: 8,
          achievements: 2,
          careActions: 12,
        },
        notifications: [],
        insights: [],
      };

      expect(realtime.currentSession.duration).toBeGreaterThan(0);
      expect(realtime.currentSession.lastActivity).toBeGreaterThan(
        realtime.currentSession.startTime
      );
      expect(Array.isArray(realtime.notifications)).toBe(true);
      expect(Array.isArray(realtime.insights)).toBe(true);
    });
  });

  describe('AnalyticsResponse', () => {
    it('should create valid response object', () => {
      const response: AnalyticsResponse<string> = {
        success: true,
        data: 'test data',
        timestamp: Date.now(),
      };

      expect(response.success).toBe(true);
      expect(response.data).toBe('test data');
      expect(typeof response.timestamp).toBe('number');
    });

    it('should handle error response', () => {
      const response: AnalyticsResponse = {
        success: false,
        error: 'Failed to fetch data',
        timestamp: Date.now(),
      };

      expect(response.success).toBe(false);
      expect(response.error).toBe('Failed to fetch data');
      expect(response.data).toBeUndefined();
    });
  });
});

describe('Default Configurations', () => {
  describe('DEFAULT_ANALYTICS_CONFIG', () => {
    it('should have valid default values', () => {
      expect(['daily', 'weekly', 'monthly', 'all']).toContain(
        DEFAULT_ANALYTICS_CONFIG.defaultTimePeriod
      );
      expect(DEFAULT_ANALYTICS_CONFIG.refreshInterval).toBeGreaterThan(0);
      expect(DEFAULT_ANALYTICS_CONFIG.maxInsights).toBeGreaterThan(0);
      expect(typeof DEFAULT_ANALYTICS_CONFIG.enableNotifications).toBe(
        'boolean'
      );
      expect(['light', 'dark', 'auto']).toContain(
        DEFAULT_ANALYTICS_CONFIG.theme
      );
      expect(DEFAULT_ANALYTICS_CONFIG.layout).toBeDefined();
    });
  });

  describe('DEFAULT_EXPORT_CONFIG', () => {
    it('should have valid default values', () => {
      expect(['json', 'csv', 'pdf']).toContain(DEFAULT_EXPORT_CONFIG.format);
      expect(Array.isArray(DEFAULT_EXPORT_CONFIG.sections)).toBe(true);
      expect(['daily', 'weekly', 'monthly', 'all']).toContain(
        DEFAULT_EXPORT_CONFIG.timePeriod
      );
      expect(typeof DEFAULT_EXPORT_CONFIG.includeCharts).toBe('boolean');
    });
  });

  describe('DEFAULT_DASHBOARD_WIDGETS', () => {
    it('should have valid default widgets', () => {
      expect(DEFAULT_DASHBOARD_WIDGETS.length).toBeGreaterThan(0);

      DEFAULT_DASHBOARD_WIDGETS.forEach(widget => {
        expect(widget.id).toBeTruthy();
        expect(widget.title).toBeTruthy();
        expect(['stat', 'chart', 'list', 'progress', 'badge']).toContain(
          widget.type
        );
        expect(['small', 'medium', 'large']).toContain(widget.size);
        expect(widget.position).toBeDefined();
        expect(widget.data).toBeDefined();
        expect(typeof widget.visible).toBe('boolean');
      });
    });

    it('should have unique widget IDs', () => {
      const ids = DEFAULT_DASHBOARD_WIDGETS.map(widget => widget.id);
      const uniqueIds = [...new Set(ids)];

      expect(ids.length).toBe(uniqueIds.length);
    });

    it('should include essential widgets', () => {
      const widgetIds = DEFAULT_DASHBOARD_WIDGETS.map(widget => widget.id);

      expect(widgetIds).toContain('total-playtime');
      expect(widgetIds).toContain('win-rate');
      expect(widgetIds).toContain('current-level');
      expect(widgetIds).toContain('achievements');
    });
  });

  describe('INSIGHT_TEMPLATES', () => {
    it('should have valid insight templates', () => {
      const templates = Object.keys(INSIGHT_TEMPLATES);

      expect(templates.length).toBeGreaterThan(0);

      templates.forEach(key => {
        const template = INSIGHT_TEMPLATES[key];
        expect([
          'trend',
          'milestone',
          'recommendation',
          'warning',
          'celebration',
        ]).toContain(template.type);
        expect(template.title).toBeTruthy();
        expect(template.description).toBeTruthy();
        expect(template.icon).toBeTruthy();
        expect(['high', 'medium', 'low']).toContain(template.priority);
        expect(typeof template.actionable).toBe('boolean');
      });
    });

    it('should include essential templates', () => {
      const templateKeys = Object.keys(INSIGHT_TEMPLATES);

      expect(templateKeys).toContain('firstAchievement');
      expect(templateKeys).toContain('winningStreak');
      expect(templateKeys).toContain('careReminder');
      expect(templateKeys).toContain('playReminder');
      expect(templateKeys).toContain('levelUp');
    });

    it('should have consistent actionable templates', () => {
      Object.values(INSIGHT_TEMPLATES).forEach(template => {
        if (template.actionable) {
          expect(template.action).toBeDefined();
          expect(template.action!.label).toBeTruthy();
          expect(template.action!.handler).toBeTruthy();
        } else {
          expect(template.action).toBeUndefined();
        }
      });
    });
  });
});
