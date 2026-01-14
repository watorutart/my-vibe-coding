/**
 * shareUtils.tsのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateFileName,
  generateShareText,
  generateShareUrl,
  shareToSocial,
  downloadImage,
  getImageDimensions,
  getImageSize,
  getImageFormat,
  saveShareData,
  loadShareData,
  isValidImageDataUrl,
  normalizeHashtags,
  DEFAULT_SHARE_SETTINGS,
  PLATFORM_CONFIG,
} from './shareUtils';
import type { ShareData, SocialShareOptions } from '../types/Share';

// モックデータ
const mockShareData: ShareData = {
  imageDataUrl:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  title: 'My AI Pet Buddy',
  description: 'Check out my adorable pet!',
  hashtags: ['#AIPetBuddy', '#VirtualPet', '#Gaming'],
  stats: {
    level: 5,
    happiness: 85,
    energy: 70,
    experience: 1250,
    evolutionStage: 'child',
  },
};

describe('shareUtils', () => {
  beforeEach(() => {
    // Date.now() をモック
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('generateFileName', () => {
    it('should generate filename with default values', () => {
      const filename = generateFileName();
      expect(filename).toBe('pet-buddy-20240101-120000.png');
    });

    it('should generate filename with custom prefix and extension', () => {
      const filename = generateFileName('custom-pet', 'jpg');
      expect(filename).toBe('custom-pet-20240101-120000.jpg');
    });

    it('should include timestamp in filename', () => {
      const filename = generateFileName();
      expect(filename).toMatch(/pet-buddy-\d{8}-\d{6}\.png/);
    });

    it('should generate consistent filename regardless of timezone', () => {
      // Test that the filename is generated in UTC regardless of system timezone
      // This test ensures files have consistent names across different user timezones
      vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
      const filename = generateFileName();

      // The filename should be based on UTC time, not local time
      // When system time is set to 2024-01-01T12:00:00Z,
      // the filename should always be pet-buddy-20240101-120000.png
      // regardless of the user's local timezone
      expect(filename).toBe('pet-buddy-20240101-120000.png');
    });

    it('should handle different times consistently in UTC', () => {
      // Test different times to ensure UTC handling is consistent
      vi.setSystemTime(new Date('2024-12-31T23:59:59Z'));
      const filename1 = generateFileName();
      expect(filename1).toBe('pet-buddy-20241231-235959.png');

      vi.setSystemTime(new Date('2024-01-01T00:00:01Z'));
      const filename2 = generateFileName();
      expect(filename2).toBe('pet-buddy-20240101-000001.png');

      // Reset to original time for other tests
      vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    });
  });

  describe('generateShareText', () => {
    it('should generate text for Twitter', () => {
      const text = generateShareText(mockShareData, 'twitter');
      expect(text).toContain('My AI Pet Buddy');
      expect(text).toContain('Check out my adorable pet!');
      expect(text).toContain('レベル: 5');
      expect(text).toContain('進化段階: child');
      expect(text).toContain('#AIPetBuddy');
    });

    it('should generate text for Facebook', () => {
      const dataWithoutHashtags: ShareData = {
        ...mockShareData,
        hashtags: [],
      };
      const text = generateShareText(dataWithoutHashtags, 'facebook');
      expect(text).toContain('My AI Pet Buddy');
      expect(text).toContain('#FacebookGaming');
    });

    it('should handle text without stats', () => {
      const dataWithoutStats: ShareData = {
        ...mockShareData,
        stats: undefined,
      };
      const text = generateShareText(dataWithoutStats, 'twitter');
      expect(text).not.toContain('レベル:');
      expect(text).not.toContain('進化段階:');
    });

    it('should truncate long text for Twitter', () => {
      const longShareData: ShareData = {
        ...mockShareData,
        description: 'A'.repeat(300), // 非常に長い説明文
        hashtags: ['#AIPetBuddy', '#VirtualPet', '#Gaming', '#LongHashtag'],
      };
      const text = generateShareText(longShareData, 'twitter');
      expect(text.length).toBeLessThanOrEqual(280);
      expect(text).toContain('...');
    });

    it('should use custom hashtags when provided', () => {
      const customHashtagData: ShareData = {
        ...mockShareData,
        hashtags: ['#CustomTag1', '#CustomTag2'],
      };
      const text = generateShareText(customHashtagData, 'twitter');
      expect(text).toContain('#CustomTag1');
      expect(text).toContain('#CustomTag2');
      expect(text).not.toContain('#TwitterGaming');
    });
  });

  describe('generateShareUrl', () => {
    it('should generate Twitter share URL', () => {
      const options: SocialShareOptions = {
        platform: 'twitter',
        shareData: mockShareData,
        url: 'https://example.com',
      };
      const url = generateShareUrl(options);
      expect(url).toContain('https://twitter.com/intent/tweet');
      expect(url).toContain('text=');
      expect(url).toContain('url=');
    });

    it('should generate Facebook share URL', () => {
      const options: SocialShareOptions = {
        platform: 'facebook',
        shareData: mockShareData,
        url: 'https://example.com',
      };
      const url = generateShareUrl(options);
      expect(url).toContain('https://www.facebook.com/sharer/sharer.php');
      expect(url).toContain('u=');
    });

    it('should generate LINE share URL', () => {
      const options: SocialShareOptions = {
        platform: 'line',
        shareData: mockShareData,
        url: 'https://example.com',
      };
      const url = generateShareUrl(options);
      expect(url).toContain('https://social-plugins.line.me/lineit/share');
      expect(url).toContain('text=');
    });

    it('should return empty string for Instagram', () => {
      const options: SocialShareOptions = {
        platform: 'instagram',
        shareData: mockShareData,
      };
      const url = generateShareUrl(options);
      expect(url).toBe('');
    });

    it('should handle missing URL for Facebook', () => {
      const options: SocialShareOptions = {
        platform: 'facebook',
        shareData: mockShareData,
      };
      const url = generateShareUrl(options);
      expect(url).toBe('');
    });

    it('should properly encode special characters', () => {
      const specialCharData: ShareData = {
        ...mockShareData,
        title: 'Test & Title with "quotes"',
        description: 'Description with special chars: @#$%',
      };
      const options: SocialShareOptions = {
        platform: 'twitter',
        shareData: specialCharData,
      };
      const url = generateShareUrl(options);
      expect(url).toContain('Test%20%26%20Title');
    });
  });

  describe('shareToSocial', () => {
    let mockWindowOpen: any;

    beforeEach(() => {
      // window.open をモック
      mockWindowOpen = vi.fn();
      vi.stubGlobal('window', { open: mockWindowOpen });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should successfully share to Twitter', async () => {
      mockWindowOpen.mockReturnValue({}); // 成功をシミュレート

      const options: SocialShareOptions = {
        platform: 'twitter',
        shareData: mockShareData,
        url: 'https://example.com',
      };

      const result = await shareToSocial(options);
      expect(result.success).toBe(true);
      expect(result.shareUrl).toContain('twitter.com');
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com'),
        'share',
        'width=600,height=400,scrollbars=yes,resizable=yes'
      );
    });

    it('should handle Instagram sharing', async () => {
      const options: SocialShareOptions = {
        platform: 'instagram',
        shareData: mockShareData,
      };

      const result = await shareToSocial(options);
      expect(result.success).toBe(false);
      expect(result.error).toContain(
        'Instagram does not support direct web sharing'
      );
    });

    it('should handle popup blocking', async () => {
      mockWindowOpen.mockReturnValue(null); // ポップアップブロックをシミュレート

      const options: SocialShareOptions = {
        platform: 'twitter',
        shareData: mockShareData,
      };

      const result = await shareToSocial(options);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Popup blocked');
    });

    it('should handle errors gracefully', async () => {
      mockWindowOpen.mockImplementation(() => {
        throw new Error('Test error');
      });

      const options: SocialShareOptions = {
        platform: 'twitter',
        shareData: mockShareData,
      };

      const result = await shareToSocial(options);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
    });
  });

  describe('downloadImage', () => {
    let mockCreateElement: any;
    let mockLink: any;
    let mockAppendChild: any;
    let mockRemoveChild: any;

    beforeEach(() => {
      mockLink = {
        download: '',
        href: '',
        click: vi.fn(),
      };

      mockCreateElement = vi.fn().mockReturnValue(mockLink);
      mockAppendChild = vi.fn();
      mockRemoveChild = vi.fn();

      vi.stubGlobal('document', {
        createElement: mockCreateElement,
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild,
        },
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should download image with default filename', () => {
      downloadImage(mockShareData.imageDataUrl);

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockLink.download).toBe('pet-buddy-20240101-120000.png');
      expect(mockLink.href).toBe(mockShareData.imageDataUrl);
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
    });

    it('should download image with custom filename', () => {
      const customFilename = 'custom-image.jpg';
      downloadImage(mockShareData.imageDataUrl, customFilename);

      expect(mockLink.download).toBe(customFilename);
    });
  });

  describe('getImageDimensions', () => {
    it('should get image dimensions', async () => {
      // Image オブジェクトをモック
      const mockImage = {
        width: 100,
        height: 100,
        onload: null as any,
        onerror: null as any,
        src: '',
      };

      vi.stubGlobal(
        'Image',
        vi.fn().mockImplementation(() => mockImage)
      );

      const promise = getImageDimensions(mockShareData.imageDataUrl);

      // onload を呼び出す
      mockImage.onload();

      const dimensions = await promise;
      expect(dimensions).toEqual({ width: 100, height: 100 });

      vi.unstubAllGlobals();
    });

    it('should handle image load error', async () => {
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
      };

      vi.stubGlobal(
        'Image',
        vi.fn().mockImplementation(() => mockImage)
      );

      const promise = getImageDimensions('invalid-url');

      // onerror を呼び出す
      mockImage.onerror();

      await expect(promise).rejects.toThrow('Failed to load image');

      vi.unstubAllGlobals();
    });
  });

  describe('getImageSize', () => {
    it('should calculate image size from data URL', () => {
      const size = getImageSize(mockShareData.imageDataUrl);
      expect(size).toBeGreaterThan(0);
    });

    it('should return 0 for invalid data URL', () => {
      const size = getImageSize('invalid-data-url');
      expect(size).toBe(0);
    });
  });

  describe('getImageFormat', () => {
    it('should extract image format from data URL', () => {
      const format = getImageFormat(mockShareData.imageDataUrl);
      expect(format).toBe('png');
    });

    it('should handle JPEG format', () => {
      const jpegDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/';
      const format = getImageFormat(jpegDataUrl);
      expect(format).toBe('jpeg');
    });

    it('should return unknown for invalid format', () => {
      const format = getImageFormat('invalid-url');
      expect(format).toBe('unknown');
    });
  });

  describe('saveShareData and loadShareData', () => {
    let mockLocalStorage: any;

    beforeEach(() => {
      mockLocalStorage = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
      };
      vi.stubGlobal('localStorage', mockLocalStorage);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should save share data to localStorage', () => {
      saveShareData(mockShareData, 'test-key');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        expect.stringContaining('"imageDataUrl"')
      );
    });

    it('should load share data from localStorage', () => {
      const savedData = JSON.stringify({
        ...mockShareData,
        timestamp: Date.now(),
      });
      mockLocalStorage.getItem.mockReturnValue(savedData);

      const loadedData = loadShareData('test-key');
      expect(loadedData).toEqual(
        expect.objectContaining({
          title: mockShareData.title,
          description: mockShareData.description,
        })
      );
    });

    it('should return null for non-existent data', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const loadedData = loadShareData('non-existent-key');
      expect(loadedData).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      saveShareData(mockShareData);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save share data:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('isValidImageDataUrl', () => {
    it('should validate PNG data URL', () => {
      expect(isValidImageDataUrl(mockShareData.imageDataUrl)).toBe(true);
    });

    it('should validate JPEG data URL', () => {
      const jpegUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/';
      expect(isValidImageDataUrl(jpegUrl)).toBe(true);
    });

    it('should reject invalid data URL', () => {
      expect(isValidImageDataUrl('invalid-url')).toBe(false);
      expect(isValidImageDataUrl('data:text/plain;base64,SGVsbG8=')).toBe(
        false
      );
    });
  });

  describe('normalizeHashtags', () => {
    it('should add # prefix to hashtags without it', () => {
      const hashtags = ['AIPetBuddy', 'VirtualPet', '#Gaming'];
      const normalized = normalizeHashtags(hashtags);
      expect(normalized).toEqual(['#AIPetBuddy', '#VirtualPet', '#Gaming']);
    });

    it('should remove spaces from hashtags', () => {
      const hashtags = ['# AI Pet Buddy', 'Virtual Pet '];
      const normalized = normalizeHashtags(hashtags);
      expect(normalized).toEqual(['#AIPetBuddy', '#VirtualPet']);
    });

    it('should filter out empty hashtags', () => {
      const hashtags = ['#ValidTag', '#', '', 'ValidTag2'];
      const normalized = normalizeHashtags(hashtags);
      expect(normalized).toEqual(['#ValidTag', '#ValidTag2']);
    });
  });

  describe('constants', () => {
    it('should have valid DEFAULT_SHARE_SETTINGS', () => {
      expect(DEFAULT_SHARE_SETTINGS.defaultHashtags).toBeInstanceOf(Array);
      expect(DEFAULT_SHARE_SETTINGS.enableWatermark).toBe(true);
      expect(DEFAULT_SHARE_SETTINGS.imageQuality).toBe(0.9);
    });

    it('should have valid PLATFORM_CONFIG', () => {
      expect(PLATFORM_CONFIG.twitter.maxLength).toBe(280);
      expect(PLATFORM_CONFIG.facebook.maxLength).toBeGreaterThan(0);
      expect(PLATFORM_CONFIG.twitter.baseUrl).toContain('twitter.com');
      expect(PLATFORM_CONFIG.facebook.baseUrl).toContain('facebook.com');
    });
  });
});
