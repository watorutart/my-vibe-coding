/**
 * useShare.tsのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useShare } from './useShare';
import type { ShareData, StatsCardData, SocialShareOptions } from '../types/Share';

// モジュールをモック
vi.mock('../utils/imageGenerator', () => ({
  captureElement: vi.fn(),
  generateStatsCard: vi.fn(),
  addWatermark: vi.fn()
}));

vi.mock('../utils/shareUtils', () => ({
  shareToSocial: vi.fn(),
  downloadImage: vi.fn(),
  generateShareText: vi.fn(),
  saveShareData: vi.fn()
}));

import * as imageGenerator from '../utils/imageGenerator';
import * as shareUtils from '../utils/shareUtils';

// モック関数への参照
const mockCaptureElement = vi.mocked(imageGenerator.captureElement);
const mockGenerateStatsCard = vi.mocked(imageGenerator.generateStatsCard);
const mockAddWatermark = vi.mocked(imageGenerator.addWatermark);
const mockShareToSocial = vi.mocked(shareUtils.shareToSocial);
const mockGenerateShareText = vi.mocked(shareUtils.generateShareText);
const mockSaveShareData = vi.mocked(shareUtils.saveShareData);

// テストデータ
const MOCK_IMAGE_DATA_URL = 'data:image/png;base64,test';
const mockElement = document.createElement('div');
const mockStatsData: StatsCardData = {
  petName: 'Test Pet',
  level: 10,
  evolutionStage: 'adult',
  totalPlayTime: 1440,
  gameWinRate: 0.75,
  achievementCount: 5,
  birthDate: new Date('2024-01-01')
};

describe('useShare', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトのモック実装
    mockCaptureElement.mockResolvedValue(MOCK_IMAGE_DATA_URL);
    mockGenerateStatsCard.mockResolvedValue(MOCK_IMAGE_DATA_URL);
    mockAddWatermark.mockResolvedValue(MOCK_IMAGE_DATA_URL);
    mockShareToSocial.mockResolvedValue({ success: true, shareUrl: 'https://example.com' });
    mockGenerateShareText.mockReturnValue('Test share text');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useShare());

      expect(result.current.isSharing).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.lastShareImageUrl).toBeNull();
      expect(result.current.shareHistory).toEqual([]);
    });
  });

  describe('captureScreenshot', () => {
    it('should capture screenshot successfully', async () => {
      const { result } = renderHook(() => useShare());

      const imageUrl = await act(async () => {
        return await result.current.captureScreenshot(mockElement);
      });

      expect(imageUrl).toBe(MOCK_IMAGE_DATA_URL);
      expect(result.current.lastShareImageUrl).toBe(MOCK_IMAGE_DATA_URL);
      expect(result.current.isSharing).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockCaptureElement).toHaveBeenCalledWith(mockElement, {});
    });

    it('should capture screenshot with custom options', async () => {
      const { result } = renderHook(() => useShare());
      const options = { width: 500, height: 500 };

      await act(async () => {
        await result.current.captureScreenshot(mockElement, options);
      });

      expect(mockCaptureElement).toHaveBeenCalledWith(mockElement, options);
    });

    it('should handle capture error', async () => {
      const { result } = renderHook(() => useShare());
      const errorMessage = 'Capture failed';
      mockCaptureElement.mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        await expect(result.current.captureScreenshot(mockElement))
          .rejects.toThrow(errorMessage);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isSharing).toBe(false);
    });

    it('should handle unknown error', async () => {
      const { result } = renderHook(() => useShare());
      mockCaptureElement.mockRejectedValue('Unknown error');

      await act(async () => {
        await expect(result.current.captureScreenshot(mockElement))
          .rejects.toThrow('スクリーンショットの撮影に失敗しました');
      });

      expect(result.current.error).toBe('スクリーンショットの撮影に失敗しました');
    });
  });

  describe('shareToSocial', () => {
    const mockShareData: ShareData = {
      imageDataUrl: MOCK_IMAGE_DATA_URL,
      title: 'Test',
      description: 'Test description',
      hashtags: ['#test']
    };

    const mockShareOptions: SocialShareOptions = {
      platform: 'twitter',
      shareData: mockShareData
    };

    it('should share to social successfully', async () => {
      const { result } = renderHook(() => useShare());

      const shareResult = await act(async () => {
        return await result.current.shareToSocial(mockShareOptions);
      });

      expect(shareResult.success).toBe(true);
      expect(result.current.shareHistory).toHaveLength(1);
      expect(result.current.shareHistory[0].platform).toBe('twitter');
      expect(result.current.shareHistory[0].success).toBe(true);
      expect(result.current.error).toBeNull();
      expect(mockShareToSocial).toHaveBeenCalledWith(mockShareOptions);
      expect(mockSaveShareData).toHaveBeenCalled();
    });

    it('should handle share failure', async () => {
      const { result } = renderHook(() => useShare());
      const errorMessage = 'Share failed';
      mockShareToSocial.mockResolvedValue({ success: false, error: errorMessage });

      const shareResult = await act(async () => {
        return await result.current.shareToSocial(mockShareOptions);
      });

      expect(shareResult.success).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.shareHistory).toHaveLength(1);
      expect(result.current.shareHistory[0].success).toBe(false);
    });

    it('should handle share exception', async () => {
      const { result } = renderHook(() => useShare());
      const errorMessage = 'Network error';
      mockShareToSocial.mockRejectedValue(new Error(errorMessage));

      const shareResult = await act(async () => {
        return await result.current.shareToSocial(mockShareOptions);
      });

      expect(shareResult.success).toBe(false);
      expect(shareResult.error).toBe(errorMessage);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.shareHistory).toHaveLength(1);
      expect(result.current.shareHistory[0].success).toBe(false);
    });
  });

  describe('generateShareData', () => {
    it('should generate basic share data', () => {
      const { result } = renderHook(() => useShare());

      const shareData = result.current.generateShareData(MOCK_IMAGE_DATA_URL);

      expect(shareData.imageDataUrl).toBe(MOCK_IMAGE_DATA_URL);
      expect(shareData.title).toBe('AI Pet Buddy');
      expect(shareData.description).toBe('かわいいペットと一緒に遊んでいます！');
      expect(shareData.hashtags).toEqual(['#AIPetBuddy', '#VirtualPet', '#Gaming']);
      expect(shareData.stats).toBeUndefined();
    });

    it('should generate share data with stats', () => {
      const { result } = renderHook(() => useShare());

      const shareData = result.current.generateShareData(MOCK_IMAGE_DATA_URL, mockStatsData);

      expect(shareData.title).toBe('Test Petのペット記録');
      expect(shareData.description).toBe('レベル10のadultに成長しました！');
      expect(shareData.stats).toBeDefined();
      expect(shareData.stats?.level).toBe(10);
      expect(shareData.stats?.evolutionStage).toBe('adult');
    });

    it('should include special title in description', () => {
      const { result } = renderHook(() => useShare());
      const statsWithTitle = { ...mockStatsData, specialTitle: 'Champion' };

      const shareData = result.current.generateShareData(MOCK_IMAGE_DATA_URL, statsWithTitle);

      expect(shareData.description).toContain('称号：Champion');
    });
  });

  describe('utility functions', () => {
    it('should clear error', () => {
      const { result } = renderHook(() => useShare());

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should clear history', () => {
      const { result } = renderHook(() => useShare());

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.shareHistory).toHaveLength(0);
    });
  });
});