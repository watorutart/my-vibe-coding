/**
 * @file Statistics.test.ts
 * @description Tests for Statistics type definitions and utility functions
 */

import { describe, it, expect } from 'vitest';
import type {
  GameStatistics,
  CareStatistics,
  EvolutionStatistics,
  PlaySessionStatistics,
  DailyStatistics,
  WeeklyStatistics,
  MonthlyStatistics,
  OverallStatistics,
  StatisticsData,
  ChartData,
  ChartConfig,
  StatisticsSummary,
  TimePeriod,
  EvolutionRecord
} from './Statistics';
import {
  DEFAULT_GAME_STATISTICS,
  DEFAULT_CARE_STATISTICS,
  DEFAULT_EVOLUTION_STATISTICS,
  DEFAULT_PLAY_SESSION_STATISTICS,
  DEFAULT_OVERALL_STATISTICS,
  DEFAULT_STATISTICS_DATA,
  formatPlaytime,
  formatWinRate,
  formatDate,
  formatDateTime,
  CHART_COLORS,
  CHART_COLOR_PALETTE
} from './Statistics';

describe('Statistics Types', () => {
  describe('TimePeriod', () => {
    it('should have valid time period types', () => {
      const validPeriods: TimePeriod[] = ['daily', 'weekly', 'monthly', 'all'];
      
      validPeriods.forEach(period => {
        expect(typeof period).toBe('string');
        expect(['daily', 'weekly', 'monthly', 'all']).toContain(period);
      });
    });
  });

  describe('GameStatistics', () => {
    it('should create valid game statistics object', () => {
      const gameStats: GameStatistics = {
        totalGames: 100,
        wins: 65,
        losses: 35,
        winRate: 0.65,
        maxWinStreak: 12,
        currentWinStreak: 3,
        averageGameDuration: 45,
        favoriteGame: 'rock-paper-scissors',
        gameBreakdown: {
          'rock-paper-scissors': {
            played: 60,
            won: 40,
            lost: 20,
            winRate: 0.67,
            bestStreak: 8
          },
          'number-guess': {
            played: 40,
            won: 25,
            lost: 15,
            winRate: 0.625,
            bestStreak: 12
          }
        }
      };

      expect(gameStats.totalGames).toBe(100);
      expect(gameStats.wins + gameStats.losses).toBe(gameStats.totalGames);
      expect(gameStats.winRate).toBeCloseTo(0.65);
      expect(gameStats.maxWinStreak).toBeGreaterThanOrEqual(gameStats.currentWinStreak);
      expect(Object.keys(gameStats.gameBreakdown)).toHaveLength(2);
    });

    it('should validate game breakdown consistency', () => {
      const gameStats: GameStatistics = {
        totalGames: 50,
        wins: 30,
        losses: 20,
        winRate: 0.6,
        maxWinStreak: 5,
        currentWinStreak: 2,
        averageGameDuration: 30,
        favoriteGame: 'rock-paper-scissors',
        gameBreakdown: {
          'rock-paper-scissors': {
            played: 30,
            won: 20,
            lost: 10,
            winRate: 0.67,
            bestStreak: 5
          },
          'number-guess': {
            played: 20,
            won: 10,
            lost: 10,
            winRate: 0.5,
            bestStreak: 3
          }
        }
      };

      const totalBreakdownGames = Object.values(gameStats.gameBreakdown)
        .reduce((sum, game) => sum + game.played, 0);
      
      expect(totalBreakdownGames).toBe(gameStats.totalGames);
    });
  });

  describe('CareStatistics', () => {
    it('should create valid care statistics object', () => {
      const careStats: CareStatistics = {
        totalFeedings: 150,
        totalPlaySessions: 200,
        totalRestSessions: 100,
        averageHappiness: 85.5,
        averageEnergy: 78.2,
        averageHunger: 45.8,
        maxHappiness: 100,
        maxEnergy: 100,
        timeSpentCaring: 1200,
        careActions: {
          feed: {
            count: 150,
            totalTime: 300,
            averageImprovement: 25.5
          },
          play: {
            count: 200,
            totalTime: 800,
            averageImprovement: 15.2
          }
        }
      };

      expect(careStats.totalFeedings).toBe(150);
      expect(careStats.averageHappiness).toBeGreaterThan(0);
      expect(careStats.averageHappiness).toBeLessThanOrEqual(100);
      expect(careStats.maxHappiness).toBeLessThanOrEqual(100);
      expect(careStats.maxEnergy).toBeLessThanOrEqual(100);
      expect(Object.keys(careStats.careActions)).toHaveLength(2);
    });
  });

  describe('EvolutionStatistics', () => {
    it('should create valid evolution statistics object', () => {
      const evolutionStats: EvolutionStatistics = {
        totalEvolutions: 5,
        currentLevel: 8,
        maxLevel: 8,
        totalExperience: 2500,
        averageExperiencePerDay: 50,
        evolutionHistory: [
          {
            id: 'evo-1',
            fromLevel: 1,
            toLevel: 2,
            timestamp: Date.now() - 86400000 * 10,
            experienceGained: 100,
            timeTaken: 24
          }
        ],
        timeToMaxLevel: 50
      };

      expect(evolutionStats.totalEvolutions).toBe(5);
      expect(evolutionStats.currentLevel).toBeLessThanOrEqual(evolutionStats.maxLevel);
      expect(evolutionStats.evolutionHistory).toHaveLength(1);
      expect(evolutionStats.totalExperience).toBeGreaterThan(0);
    });

    it('should validate evolution record', () => {
      const record: EvolutionRecord = {
        id: 'test-evolution',
        fromLevel: 3,
        toLevel: 4,
        timestamp: Date.now(),
        experienceGained: 150,
        timeTaken: 48
      };

      expect(record.toLevel).toBeGreaterThan(record.fromLevel);
      expect(record.experienceGained).toBeGreaterThan(0);
      expect(record.timeTaken).toBeGreaterThan(0);
      expect(typeof record.timestamp).toBe('number');
    });
  });

  describe('PlaySessionStatistics', () => {
    it('should create valid play session statistics', () => {
      const sessionStats: PlaySessionStatistics = {
        totalSessions: 50,
        totalPlaytime: 1500,
        averageSessionLength: 30,
        longestSession: 120,
        shortestSession: 5,
        currentStreak: 7,
        longestStreak: 15,
        dailyAverage: 60,
        weeklyAverage: 420,
        monthlyAverage: 1800,
        firstPlayDate: Date.now() - 86400000 * 30,
        lastPlayDate: Date.now(),
        activeDays: 25
      };

      expect(sessionStats.totalPlaytime / sessionStats.totalSessions)
        .toBeCloseTo(sessionStats.averageSessionLength);
      expect(sessionStats.longestSession).toBeGreaterThan(sessionStats.shortestSession);
      expect(sessionStats.longestStreak).toBeGreaterThanOrEqual(sessionStats.currentStreak);
      expect(sessionStats.lastPlayDate).toBeGreaterThan(sessionStats.firstPlayDate);
    });
  });

  describe('DailyStatistics', () => {
    it('should create valid daily statistics entry', () => {
      const dailyStats: DailyStatistics = {
        date: '2024-01-15',
        playtime: 60,
        games: {
          played: 10,
          won: 7,
          lost: 3
        },
        care: {
          feedings: 3,
          playTime: 30,
          restTime: 15
        },
        pet: {
          startLevel: 5,
          endLevel: 5,
          experienceGained: 25,
          evolutions: 0
        },
        achievements: {
          badgesUnlocked: 1,
          titlesUnlocked: 0
        }
      };

      expect(dailyStats.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(dailyStats.games.won + dailyStats.games.lost).toBe(dailyStats.games.played);
      expect(dailyStats.pet.endLevel).toBeGreaterThanOrEqual(dailyStats.pet.startLevel);
    });
  });

  describe('WeeklyStatistics', () => {
    it('should create valid weekly statistics', () => {
      const weeklyStats: WeeklyStatistics = {
        weekStart: '2024-01-08',
        weekEnd: '2024-01-14',
        totalPlaytime: 420,
        dailyAverage: 60,
        totalGames: 70,
        winRate: 0.65,
        petGrowth: {
          levelsGained: 2,
          experienceGained: 350,
          evolutions: 1
        },
        achievements: {
          badgesUnlocked: 3,
          titlesUnlocked: 1
        }
      };

      expect(weeklyStats.weekStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(weeklyStats.weekEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(weeklyStats.totalPlaytime / 7).toBeCloseTo(weeklyStats.dailyAverage);
      expect(weeklyStats.winRate).toBeGreaterThanOrEqual(0);
      expect(weeklyStats.winRate).toBeLessThanOrEqual(1);
    });
  });

  describe('MonthlyStatistics', () => {
    it('should create valid monthly statistics', () => {
      const monthlyStats: MonthlyStatistics = {
        month: '2024-01',
        totalPlaytime: 1800,
        dailyAverage: 60,
        totalGames: 300,
        winRate: 0.68,
        petGrowth: {
          levelsGained: 5,
          experienceGained: 1500,
          evolutions: 3
        },
        achievements: {
          badgesUnlocked: 8,
          titlesUnlocked: 2
        },
        milestones: ['Reached Level 10', 'First Evolution']
      };

      expect(monthlyStats.month).toMatch(/^\d{4}-\d{2}$/);
      expect(monthlyStats.winRate).toBeGreaterThanOrEqual(0);
      expect(monthlyStats.winRate).toBeLessThanOrEqual(1);
      expect(Array.isArray(monthlyStats.milestones)).toBe(true);
    });
  });

  describe('ChartData', () => {
    it('should create valid chart data structure', () => {
      const chartData: ChartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        datasets: [
          {
            label: 'Playtime',
            data: [30, 45, 60, 35, 50],
            backgroundColor: '#4f46e5',
            borderColor: '#3730a3',
            borderWidth: 2
          }
        ]
      };

      expect(chartData.labels).toHaveLength(5);
      expect(chartData.datasets).toHaveLength(1);
      expect(chartData.datasets[0].data).toHaveLength(5);
      expect(chartData.datasets[0].data.length).toBe(chartData.labels.length);
    });
  });

  describe('ChartConfig', () => {
    it('should create valid chart configuration', () => {
      const chartConfig: ChartConfig = {
        type: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3'],
          datasets: [{
            label: 'Games Won',
            data: [10, 15, 12]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          }
        }
      };

      expect(['line', 'bar', 'pie', 'doughnut', 'radar']).toContain(chartConfig.type);
      expect(chartConfig.data.labels).toHaveLength(3);
      expect(chartConfig.options?.responsive).toBe(true);
    });
  });

  describe('StatisticsSummary', () => {
    it('should create valid statistics summary', () => {
      const summary: StatisticsSummary = {
        totalPlaytime: '25時間30分',
        totalGames: 150,
        winRate: 0.68,
        currentLevel: 8,
        daysPlayed: 30,
        currentStreak: 7,
        badgesUnlocked: 12,
        titlesUnlocked: 3,
        favoriteGame: 'rock-paper-scissors',
        petHappiness: 95
      };

      expect(summary.winRate).toBeGreaterThanOrEqual(0);
      expect(summary.winRate).toBeLessThanOrEqual(1);
      expect(summary.currentLevel).toBeGreaterThan(0);
      expect(summary.petHappiness).toBeGreaterThanOrEqual(0);
      expect(summary.petHappiness).toBeLessThanOrEqual(100);
    });
  });
});

describe('Default Statistics', () => {
  describe('DEFAULT_GAME_STATISTICS', () => {
    it('should have valid default values', () => {
      expect(DEFAULT_GAME_STATISTICS.totalGames).toBe(0);
      expect(DEFAULT_GAME_STATISTICS.wins).toBe(0);
      expect(DEFAULT_GAME_STATISTICS.losses).toBe(0);
      expect(DEFAULT_GAME_STATISTICS.winRate).toBe(0);
      expect(DEFAULT_GAME_STATISTICS.maxWinStreak).toBe(0);
      expect(DEFAULT_GAME_STATISTICS.currentWinStreak).toBe(0);
      expect(typeof DEFAULT_GAME_STATISTICS.gameBreakdown).toBe('object');
    });
  });

  describe('DEFAULT_CARE_STATISTICS', () => {
    it('should have valid default values', () => {
      expect(DEFAULT_CARE_STATISTICS.totalFeedings).toBe(0);
      expect(DEFAULT_CARE_STATISTICS.totalPlaySessions).toBe(0);
      expect(DEFAULT_CARE_STATISTICS.averageHappiness).toBe(0);
      expect(typeof DEFAULT_CARE_STATISTICS.careActions).toBe('object');
    });
  });

  describe('DEFAULT_EVOLUTION_STATISTICS', () => {
    it('should have valid default values', () => {
      expect(DEFAULT_EVOLUTION_STATISTICS.totalEvolutions).toBe(0);
      expect(DEFAULT_EVOLUTION_STATISTICS.currentLevel).toBe(1);
      expect(DEFAULT_EVOLUTION_STATISTICS.maxLevel).toBe(1);
      expect(Array.isArray(DEFAULT_EVOLUTION_STATISTICS.evolutionHistory)).toBe(true);
      expect(DEFAULT_EVOLUTION_STATISTICS.timeToMaxLevel).toBe(-1);
    });
  });

  describe('DEFAULT_STATISTICS_DATA', () => {
    it('should have complete default structure', () => {
      expect(DEFAULT_STATISTICS_DATA.overall).toBeDefined();
      expect(Array.isArray(DEFAULT_STATISTICS_DATA.daily)).toBe(true);
      expect(Array.isArray(DEFAULT_STATISTICS_DATA.weekly)).toBe(true);
      expect(Array.isArray(DEFAULT_STATISTICS_DATA.monthly)).toBe(true);
    });
  });
});

describe('Utility Functions', () => {
  describe('formatPlaytime', () => {
    it('should format minutes correctly', () => {
      expect(formatPlaytime(30)).toBe('30分');
      expect(formatPlaytime(0)).toBe('0分');
      expect(formatPlaytime(59)).toBe('59分');
    });

    it('should format hours correctly', () => {
      expect(formatPlaytime(60)).toBe('1時間');
      expect(formatPlaytime(90)).toBe('1時間30分');
      expect(formatPlaytime(120)).toBe('2時間');
      expect(formatPlaytime(1439)).toBe('23時間59分');
    });

    it('should format days correctly', () => {
      expect(formatPlaytime(1440)).toBe('1日');
      expect(formatPlaytime(1500)).toBe('1日1時間');
      expect(formatPlaytime(2880)).toBe('2日');
      expect(formatPlaytime(4320)).toBe('3日');
    });
  });

  describe('formatWinRate', () => {
    it('should format win rates correctly', () => {
      expect(formatWinRate(0)).toBe('0%');
      expect(formatWinRate(0.5)).toBe('50%');
      expect(formatWinRate(0.666)).toBe('67%');
      expect(formatWinRate(1)).toBe('100%');
      expect(formatWinRate(0.123)).toBe('12%');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const timestamp = new Date('2024-01-15T10:30:00').getTime();
      const formatted = formatDate(timestamp);
      
      expect(formatted).toContain('2024');
      expect(formatted).toContain('1');
      expect(formatted).toContain('15');
    });
  });

  describe('formatDateTime', () => {
    it('should format datetime correctly', () => {
      const timestamp = new Date('2024-01-15T10:30:00').getTime();
      const formatted = formatDateTime(timestamp);
      
      expect(formatted).toContain('2024');
      expect(formatted).toContain('10');
      expect(formatted).toContain('30');
    });
  });
});

describe('Chart Constants', () => {
  describe('CHART_COLORS', () => {
    it('should have valid color definitions', () => {
      expect(CHART_COLORS.primary).toMatch(/^#[0-9a-f]{6}$/i);
      expect(CHART_COLORS.secondary).toMatch(/^#[0-9a-f]{6}$/i);
      expect(CHART_COLORS.success).toMatch(/^#[0-9a-f]{6}$/i);
      expect(CHART_COLORS.warning).toMatch(/^#[0-9a-f]{6}$/i);
      expect(CHART_COLORS.error).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('CHART_COLOR_PALETTE', () => {
    it('should have multiple colors available', () => {
      expect(CHART_COLOR_PALETTE.length).toBeGreaterThan(5);
      
      CHART_COLOR_PALETTE.forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it('should have unique colors', () => {
      const uniqueColors = [...new Set(CHART_COLOR_PALETTE)];
      expect(uniqueColors.length).toBe(CHART_COLOR_PALETTE.length);
    });
  });
});