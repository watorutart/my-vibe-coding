/**
 * Share型定義のテスト
 * 型の構造と妥当性を検証
 */

import { describe, it, expect } from 'vitest';
import type {
  ShareData,
  ScreenshotOptions,
  SocialShareOptions,
  ShareResult,
  WatermarkConfig,
  StatsCardData,
  ShareHistoryEntry,
  ShareSettings,
  SocialPlatform
} from './Share';

describe('Share Types', () => {
  describe('ShareData', () => {
    it('should have correct structure', () => {
      const shareData: ShareData = {
        imageDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        title: 'My AI Pet Buddy',
        description: 'Check out my adorable pet!',
        hashtags: ['#AIPetBuddy', '#VirtualPet', '#Gaming'],
        stats: {
          level: 5,
          happiness: 85,
          energy: 70,
          experience: 1250,
          evolutionStage: 'child'
        }
      };

      expect(shareData.imageDataUrl).toContain('data:image/png;base64');
      expect(shareData.title).toBe('My AI Pet Buddy');
      expect(shareData.description).toBe('Check out my adorable pet!');
      expect(shareData.hashtags).toHaveLength(3);
      expect(shareData.stats?.level).toBe(5);
    });

    it('should work without optional stats', () => {
      const shareData: ShareData = {
        imageDataUrl: 'data:image/png;base64,test',
        title: 'Test',
        description: 'Test description',
        hashtags: ['#test']
      };

      expect(shareData.stats).toBeUndefined();
    });
  });

  describe('ScreenshotOptions', () => {
    it('should have correct structure with all options', () => {
      const options: ScreenshotOptions = {
        width: 1080,
        height: 1080,
        quality: 0.9,
        showWatermark: true,
        backgroundColor: '#ffffff',
        scale: 2
      };

      expect(options.width).toBe(1080);
      expect(options.height).toBe(1080);
      expect(options.quality).toBe(0.9);
      expect(options.showWatermark).toBe(true);
      expect(options.backgroundColor).toBe('#ffffff');
      expect(options.scale).toBe(2);
    });

    it('should work with minimal options', () => {
      const options: ScreenshotOptions = {};

      expect(Object.keys(options)).toHaveLength(0);
    });

    it('should support null background color', () => {
      const options: ScreenshotOptions = {
        backgroundColor: null
      };

      expect(options.backgroundColor).toBeNull();
    });
  });

  describe('SocialPlatform', () => {
    it('should accept valid platform values', () => {
      const platforms: SocialPlatform[] = ['twitter', 'facebook', 'instagram', 'line'];

      platforms.forEach(platform => {
        const shareOptions: SocialShareOptions = {
          platform,
          shareData: {
            imageDataUrl: 'test',
            title: 'test',
            description: 'test',
            hashtags: []
          }
        };

        expect(shareOptions.platform).toBe(platform);
      });
    });
  });

  describe('SocialShareOptions', () => {
    it('should have correct structure', () => {
      const options: SocialShareOptions = {
        platform: 'twitter',
        shareData: {
          imageDataUrl: 'data:image/png;base64,test',
          title: 'Share Title',
          description: 'Share Description',
          hashtags: ['#test', '#share']
        },
        url: 'https://example.com'
      };

      expect(options.platform).toBe('twitter');
      expect(options.shareData.title).toBe('Share Title');
      expect(options.url).toBe('https://example.com');
    });

    it('should work without optional url', () => {
      const options: SocialShareOptions = {
        platform: 'facebook',
        shareData: {
          imageDataUrl: 'test',
          title: 'test',
          description: 'test',
          hashtags: []
        }
      };

      expect(options.url).toBeUndefined();
    });
  });

  describe('ShareResult', () => {
    it('should represent successful result', () => {
      const result: ShareResult = {
        success: true,
        shareUrl: 'https://twitter.com/intent/tweet?text=test'
      };

      expect(result.success).toBe(true);
      expect(result.shareUrl).toBe('https://twitter.com/intent/tweet?text=test');
      expect(result.error).toBeUndefined();
    });

    it('should represent failed result', () => {
      const result: ShareResult = {
        success: false,
        error: 'Network error occurred'
      };

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error occurred');
      expect(result.shareUrl).toBeUndefined();
    });
  });

  describe('WatermarkConfig', () => {
    it('should have correct structure with all options', () => {
      const config: WatermarkConfig = {
        text: 'AI Pet Buddy',
        position: 'bottom-right',
        opacity: 0.7,
        fontSize: '16px',
        color: '#ffffff'
      };

      expect(config.text).toBe('AI Pet Buddy');
      expect(config.position).toBe('bottom-right');
      expect(config.opacity).toBe(0.7);
      expect(config.fontSize).toBe('16px');
      expect(config.color).toBe('#ffffff');
    });

    it('should work with minimal config', () => {
      const config: WatermarkConfig = {
        text: 'Test'
      };

      expect(config.text).toBe('Test');
      expect(config.position).toBeUndefined();
      expect(config.opacity).toBeUndefined();
    });
  });

  describe('StatsCardData', () => {
    it('should have correct structure', () => {
      const statsData: StatsCardData = {
        petName: 'Fluffy',
        level: 15,
        evolutionStage: 'adult',
        totalPlayTime: 1440, // 24 hours
        gameWinRate: 0.75,
        achievementCount: 8,
        specialTitle: 'Champion',
        birthDate: new Date('2024-01-01')
      };

      expect(statsData.petName).toBe('Fluffy');
      expect(statsData.level).toBe(15);
      expect(statsData.evolutionStage).toBe('adult');
      expect(statsData.totalPlayTime).toBe(1440);
      expect(statsData.gameWinRate).toBe(0.75);
      expect(statsData.achievementCount).toBe(8);
      expect(statsData.specialTitle).toBe('Champion');
      expect(statsData.birthDate).toBeInstanceOf(Date);
    });

    it('should work without optional specialTitle', () => {
      const statsData: StatsCardData = {
        petName: 'Test Pet',
        level: 1,
        evolutionStage: 'baby',
        totalPlayTime: 60,
        gameWinRate: 0.5,
        achievementCount: 0,
        birthDate: new Date()
      };

      expect(statsData.specialTitle).toBeUndefined();
    });
  });

  describe('ShareHistoryEntry', () => {
    it('should have correct structure', () => {
      const entry: ShareHistoryEntry = {
        timestamp: Date.now(),
        platform: 'twitter',
        content: 'Check out my pet!',
        imageUrl: 'https://example.com/image.png',
        success: true
      };

      expect(typeof entry.timestamp).toBe('number');
      expect(entry.platform).toBe('twitter');
      expect(entry.content).toBe('Check out my pet!');
      expect(entry.imageUrl).toBe('https://example.com/image.png');
      expect(entry.success).toBe(true);
    });

    it('should work without optional imageUrl', () => {
      const entry: ShareHistoryEntry = {
        timestamp: Date.now(),
        platform: 'line',
        content: 'Text only share',
        success: true
      };

      expect(entry.imageUrl).toBeUndefined();
    });
  });

  describe('ShareSettings', () => {
    it('should have correct structure', () => {
      const settings: ShareSettings = {
        defaultHashtags: ['#AIPetBuddy', '#VirtualPet'],
        enableWatermark: true,
        autoSave: false,
        imageQuality: 0.9,
        includeStats: true
      };

      expect(settings.defaultHashtags).toHaveLength(2);
      expect(settings.enableWatermark).toBe(true);
      expect(settings.autoSave).toBe(false);
      expect(settings.imageQuality).toBe(0.9);
      expect(settings.includeStats).toBe(true);
    });
  });
});