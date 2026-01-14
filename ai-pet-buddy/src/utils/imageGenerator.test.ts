/**
 * imageGenerator.tsのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import html2canvas from 'html2canvas';
import {
  captureElement,
  addWatermark,
  generateStatsCard,
  resizeImage,
  adjustImageQuality,
  DEFAULT_SCREENSHOT_OPTIONS,
  DEFAULT_WATERMARK_CONFIG,
} from './imageGenerator';
import type {
  StatsCardData,
  WatermarkConfig,
  ScreenshotOptions,
} from '../types/Share';

// html2canvasをモック
vi.mock('html2canvas', () => ({
  default: vi.fn(),
}));

const mockHtml2Canvas = vi.mocked(html2canvas);

// 1x1 透明PNGのbase64データ
const MOCK_IMAGE_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

// モック画像データ
const mockStatsData: StatsCardData = {
  petName: 'Test Pet',
  level: 10,
  evolutionStage: 'adult',
  totalPlayTime: 1440, // 24 hours in minutes
  gameWinRate: 0.75,
  achievementCount: 5,
  specialTitle: 'Champion',
  birthDate: new Date('2024-01-01'),
};

describe('imageGenerator', () => {
  let mockCanvas: any;
  let mockContext: any;
  let mockImage: any;

  beforeEach(() => {
    // Canvas API をモック
    mockContext = {
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      toDataURL: vi.fn(() => MOCK_IMAGE_DATA_URL),
      fillStyle: '',
      strokeStyle: '',
      font: '',
      textAlign: '',
      textBaseline: '',
      globalAlpha: 1,
      lineWidth: 1,
      shadowColor: '',
      shadowBlur: 0,
      shadowOffsetY: 0,
    };

    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
      toDataURL: vi.fn(() => MOCK_IMAGE_DATA_URL),
    };

    mockImage = {
      width: 100,
      height: 100,
      onload: null as any,
      onerror: null as any,
      src: '',
    };

    // グローバルオブジェクトをモック
    vi.stubGlobal('document', {
      createElement: vi.fn((tagName: string) => {
        if (tagName === 'canvas') {
          return mockCanvas;
        }
        return {};
      }),
    });

    vi.stubGlobal(
      'Image',
      vi.fn(() => mockImage)
    );

    // html2canvas のモック実装
    mockHtml2Canvas.mockResolvedValue(mockCanvas);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  describe('captureElement', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      mockElement = document.createElement('div') as HTMLElement;
    });

    it('should capture element with default options', async () => {
      const result = await captureElement(mockElement);

      expect(mockHtml2Canvas).toHaveBeenCalledWith(mockElement, {
        width: DEFAULT_SCREENSHOT_OPTIONS.width,
        height: DEFAULT_SCREENSHOT_OPTIONS.height,
        background: DEFAULT_SCREENSHOT_OPTIONS.backgroundColor,
        useCORS: true,
        allowTaint: true,
        removeContainer: true,
        imageTimeout: 15000,
        logging: false,
      });

      expect(result).toBe(MOCK_IMAGE_DATA_URL);
    });

    it('should capture element with custom options', async () => {
      const customOptions: ScreenshotOptions = {
        width: 500,
        height: 500,
        scale: 1,
        backgroundColor: '#ffffff',
        quality: 0.8,
      };

      const result = await captureElement(mockElement, customOptions);

      expect(mockHtml2Canvas).toHaveBeenCalledWith(mockElement, {
        width: 500,
        height: 500,
        background: '#ffffff',
        useCORS: true,
        allowTaint: true,
        removeContainer: true,
        imageTimeout: 15000,
        logging: false,
      });

      expect(result).toBe(MOCK_IMAGE_DATA_URL);
    });

    it('should handle html2canvas errors', async () => {
      const error = new Error('Canvas error');
      mockHtml2Canvas.mockRejectedValue(error);

      await expect(captureElement(mockElement)).rejects.toThrow(
        'Screenshot capture failed: Canvas error'
      );
    });

    it('should handle unknown errors', async () => {
      mockHtml2Canvas.mockRejectedValue('Unknown error');

      await expect(captureElement(mockElement)).rejects.toThrow(
        'Screenshot capture failed: Unknown error'
      );
    });
  });

  describe('addWatermark', () => {
    it('should add watermark with default config', async () => {
      const promise = addWatermark(MOCK_IMAGE_DATA_URL);

      // onload を呼び出す
      mockImage.onload();

      const result = await promise;

      expect(mockContext.drawImage).toHaveBeenCalled();
      expect(mockContext.fillText).toHaveBeenCalledWith(
        DEFAULT_WATERMARK_CONFIG.text,
        expect.any(Number),
        expect.any(Number)
      );
      expect(result).toBe(MOCK_IMAGE_DATA_URL);
    });

    it('should add watermark with custom config', async () => {
      const customConfig: WatermarkConfig = {
        text: 'Custom Watermark',
        position: 'top-left',
        opacity: 0.5,
        fontSize: '20px',
        color: '#ff0000',
      };

      const promise = addWatermark(MOCK_IMAGE_DATA_URL, customConfig);

      // onload を呼び出す
      mockImage.onload();

      const result = await promise;

      expect(mockContext.fillText).toHaveBeenCalledWith(
        'Custom Watermark',
        expect.any(Number),
        expect.any(Number)
      );
      expect(result).toBe(MOCK_IMAGE_DATA_URL);
    });

    it('should handle different watermark positions', async () => {
      const positions: Array<WatermarkConfig['position']> = [
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
      ];

      for (const position of positions) {
        const config: WatermarkConfig = {
          text: 'Test',
          position,
        };

        const promise = addWatermark(MOCK_IMAGE_DATA_URL, config);
        mockImage.onload();
        await promise;

        expect(mockContext.fillText).toHaveBeenCalled();
        vi.clearAllMocks();
      }
    });

    it('should handle canvas context creation failure', async () => {
      mockCanvas.getContext.mockReturnValue(null);

      const promise = addWatermark(MOCK_IMAGE_DATA_URL);
      mockImage.onload();

      await expect(promise).rejects.toThrow('Failed to get canvas context');
    });

    it('should handle image load error', async () => {
      const promise = addWatermark('invalid-url');
      mockImage.onerror();

      await expect(promise).rejects.toThrow(
        'Failed to load image for watermark'
      );
    });

    it('should handle drawing errors', async () => {
      mockContext.drawImage.mockImplementation(() => {
        throw new Error('Drawing error');
      });

      const promise = addWatermark(MOCK_IMAGE_DATA_URL);
      mockImage.onload();

      await expect(promise).rejects.toThrow(
        'Watermark addition failed: Drawing error'
      );
    });
  });

  describe('generateStatsCard', () => {
    it('should generate stats card with default config', async () => {
      const result = await generateStatsCard(mockStatsData);

      expect(mockCanvas.width).toBe(1080);
      expect(mockCanvas.height).toBe(1080);
      expect(mockContext.fillRect).toHaveBeenCalled();
      expect(mockContext.fillText).toHaveBeenCalledWith(
        'AI Pet Buddy',
        expect.any(Number),
        expect.any(Number)
      );
      expect(mockContext.fillText).toHaveBeenCalledWith(
        '"Test Pet"',
        expect.any(Number),
        expect.any(Number)
      );
      expect(result).toBe(MOCK_IMAGE_DATA_URL);
    });

    it('should include pet statistics in the card', async () => {
      await generateStatsCard(mockStatsData);

      expect(mockContext.fillText).toHaveBeenCalledWith(
        'レベル: 10',
        expect.any(Number),
        expect.any(Number)
      );
      expect(mockContext.fillText).toHaveBeenCalledWith(
        '進化段階: adult',
        expect.any(Number),
        expect.any(Number)
      );
      expect(mockContext.fillText).toHaveBeenCalledWith(
        'プレイ時間: 24時間',
        expect.any(Number),
        expect.any(Number)
      );
      expect(mockContext.fillText).toHaveBeenCalledWith(
        '勝率: 75%',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should include special title when provided', async () => {
      await generateStatsCard(mockStatsData);

      expect(mockContext.fillText).toHaveBeenCalledWith(
        '【Champion】',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should handle stats without special title', async () => {
      const statsWithoutTitle: StatsCardData = {
        ...mockStatsData,
        specialTitle: undefined,
      };

      await generateStatsCard(statsWithoutTitle);

      expect(mockContext.fillText).not.toHaveBeenCalledWith(
        expect.stringContaining('【'),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should handle canvas context creation failure', async () => {
      mockCanvas.getContext.mockReturnValue(null);

      await expect(generateStatsCard(mockStatsData)).rejects.toThrow(
        'Failed to get canvas context'
      );
    });

    it('should calculate days since birth correctly', async () => {
      // 固定日時を設定 (2024-02-01)
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-02-01T00:00:00Z'));

      await generateStatsCard(mockStatsData);

      // 2024-01-01 から 2024-02-01 まで = 31日
      expect(mockContext.fillText).toHaveBeenCalledWith(
        '育成日数: 31日',
        expect.any(Number),
        expect.any(Number)
      );

      vi.useRealTimers();
    });
  });

  describe('resizeImage', () => {
    it('should resize image to specified dimensions', async () => {
      const promise = resizeImage(MOCK_IMAGE_DATA_URL, 200, 200, false);

      mockImage.onload();

      const result = await promise;

      expect(mockCanvas.width).toBe(200);
      expect(mockCanvas.height).toBe(200);
      expect(mockContext.drawImage).toHaveBeenCalledWith(
        mockImage,
        0,
        0,
        200,
        200
      );
      expect(result).toBe(MOCK_IMAGE_DATA_URL);
    });

    it('should maintain aspect ratio when specified', async () => {
      // mockImage の width: 100, height: 100 (アスペクト比 1:1)
      const promise = resizeImage(MOCK_IMAGE_DATA_URL, 300, 200, true);

      mockImage.onload();

      await promise;

      // アスペクト比を維持するため、200x200になるはず
      expect(mockCanvas.width).toBe(200);
      expect(mockCanvas.height).toBe(200);
    });

    it('should handle different aspect ratios', async () => {
      mockImage.width = 200;
      mockImage.height = 100; // アスペクト比 2:1

      const promise = resizeImage(MOCK_IMAGE_DATA_URL, 300, 200, true);

      mockImage.onload();

      await promise;

      // 目標サイズ 300x200、元画像アスペクト比 2:1
      // 300/200 = 1.5, アスペクト比 2 > 1.5 なので height * aspectRatio
      // targetWidth = 200 * 2 = 400, targetHeight = 200
      // しかし、300/2 = 150 < 200 なので width / aspectRatio
      // targetWidth = 300, targetHeight = 300 / 2 = 150
      expect(mockCanvas.width).toBe(300);
      expect(mockCanvas.height).toBe(150);
    });

    it('should handle canvas context creation failure', async () => {
      mockCanvas.getContext.mockReturnValue(null);

      const promise = resizeImage(MOCK_IMAGE_DATA_URL, 200, 200);
      mockImage.onload();

      await expect(promise).rejects.toThrow('Failed to get canvas context');
    });

    it('should handle image load error', async () => {
      const promise = resizeImage('invalid-url', 200, 200);
      mockImage.onerror();

      await expect(promise).rejects.toThrow('Failed to load image for resize');
    });

    it('should handle drawing errors', async () => {
      mockContext.drawImage.mockImplementation(() => {
        throw new Error('Drawing error');
      });

      const promise = resizeImage(MOCK_IMAGE_DATA_URL, 200, 200);
      mockImage.onload();

      await expect(promise).rejects.toThrow(
        'Image resize failed: Drawing error'
      );
    });
  });

  describe('adjustImageQuality', () => {
    it('should adjust image quality with default settings', async () => {
      const promise = adjustImageQuality(MOCK_IMAGE_DATA_URL);

      mockImage.onload();

      const result = await promise;

      expect(mockContext.drawImage).toHaveBeenCalledWith(mockImage, 0, 0);
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png', 0.9);
      expect(result).toBe(MOCK_IMAGE_DATA_URL);
    });

    it('should adjust image quality with custom settings', async () => {
      const promise = adjustImageQuality(MOCK_IMAGE_DATA_URL, 0.7, 'jpeg');

      mockImage.onload();

      const result = await promise;

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.7);
      expect(result).toBe(MOCK_IMAGE_DATA_URL);
    });

    it('should handle different image formats', async () => {
      const formats: Array<'png' | 'jpeg' | 'webp'> = ['png', 'jpeg', 'webp'];

      for (const format of formats) {
        const promise = adjustImageQuality(MOCK_IMAGE_DATA_URL, 0.8, format);
        mockImage.onload();
        await promise;

        expect(mockCanvas.toDataURL).toHaveBeenCalledWith(
          `image/${format}`,
          0.8
        );
        vi.clearAllMocks();
      }
    });

    it('should handle canvas context creation failure', async () => {
      mockCanvas.getContext.mockReturnValue(null);

      const promise = adjustImageQuality(MOCK_IMAGE_DATA_URL);
      mockImage.onload();

      await expect(promise).rejects.toThrow('Failed to get canvas context');
    });

    it('should handle image load error', async () => {
      const promise = adjustImageQuality('invalid-url');
      mockImage.onerror();

      await expect(promise).rejects.toThrow(
        'Failed to load image for quality adjustment'
      );
    });

    it('should handle drawing errors', async () => {
      mockContext.drawImage.mockImplementation(() => {
        throw new Error('Drawing error');
      });

      const promise = adjustImageQuality(MOCK_IMAGE_DATA_URL);
      mockImage.onload();

      await expect(promise).rejects.toThrow(
        'Image quality adjustment failed: Drawing error'
      );
    });
  });

  describe('constants', () => {
    it('should have valid DEFAULT_SCREENSHOT_OPTIONS', () => {
      expect(DEFAULT_SCREENSHOT_OPTIONS.width).toBe(1080);
      expect(DEFAULT_SCREENSHOT_OPTIONS.height).toBe(1080);
      expect(DEFAULT_SCREENSHOT_OPTIONS.scale).toBe(2);
      expect(DEFAULT_SCREENSHOT_OPTIONS.showWatermark).toBe(true);
    });

    it('should have valid DEFAULT_WATERMARK_CONFIG', () => {
      expect(DEFAULT_WATERMARK_CONFIG.text).toBe('AI Pet Buddy');
      expect(DEFAULT_WATERMARK_CONFIG.position).toBe('bottom-right');
      expect(DEFAULT_WATERMARK_CONFIG.opacity).toBe(0.7);
      expect(DEFAULT_WATERMARK_CONFIG.color).toBe('#ffffff');
    });
  });
});
