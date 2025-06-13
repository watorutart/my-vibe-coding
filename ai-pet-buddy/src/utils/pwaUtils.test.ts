/**
 * @file pwaUtils.test.ts
 * @description PWAユーティリティ関数のテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  detectPlatform,
  detectPWACapabilities,
  canInstallPWA,
  isPWAInstalled,
  isPWAStandalone,
  getNetworkState,
  getDeviceInfo,
  InstallPromptManager,
  PWAMetrics,
  checkPWAAvailability
} from '../pwaUtils';

// モックの設定
const mockNavigator = {
  userAgent: '',
  onLine: true,
  share: undefined
};

const mockWindow = {
  matchMedia: vi.fn(),
  ServiceWorkerRegistration: {
    prototype: {
      sync: true
    }
  }
};

// グローバルオブジェクトのモック
Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true
});

Object.defineProperty(window, 'matchMedia', {
  value: mockWindow.matchMedia,
  writable: true
});

// LocalStorageのモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('PWA Utils', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockWindow.matchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    });
  });

  describe('detectPlatform', () => {
    it('should detect iOS platform', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      expect(detectPlatform()).toBe('ios');
    });

    it('should detect iPad as iOS', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)';
      expect(detectPlatform()).toBe('ios');
    });

    it('should detect iPod as iOS', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_0 like Mac OS X)';
      expect(detectPlatform()).toBe('ios');
    });

    it('should detect Android platform', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Linux; Android 10; SM-G975F)';
      expect(detectPlatform()).toBe('android');
    });

    it('should detect desktop platform', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      expect(detectPlatform()).toBe('desktop');
    });
  });

  describe('detectPWACapabilities', () => {
    it('should detect service worker support', () => {
      Object.defineProperty(window.navigator, 'serviceWorker', {
        value: {},
        writable: true
      });

      const capabilities = detectPWACapabilities();
      expect(capabilities.serviceWorker).toBe(true);
    });

    it('should detect push notification support', () => {
      Object.defineProperty(window, 'Notification', {
        value: {},
        writable: true
      });
      Object.defineProperty(window, 'PushManager', {
        value: {},
        writable: true
      });

      const capabilities = detectPWACapabilities();
      expect(capabilities.pushNotifications).toBe(true);
    });

    it('should detect web share support', () => {
      Object.defineProperty(window.navigator, 'share', {
        value: vi.fn(),
        writable: true
      });

      const capabilities = detectPWACapabilities();
      expect(capabilities.webShare).toBe(true);
    });

    it('should return false for unsupported features', () => {
      // serviceWorkerを削除
      delete (window.navigator as any).serviceWorker;
      delete (window as any).Notification;
      delete (window as any).PushManager;
      delete (window.navigator as any).share;

      const capabilities = detectPWACapabilities();
      expect(capabilities.serviceWorker).toBe(false);
      expect(capabilities.pushNotifications).toBe(false);
      expect(capabilities.webShare).toBe(false);
    });
  });

  describe('canInstallPWA', () => {
    it('should return true when service worker and install prompt are supported', () => {
      Object.defineProperty(window.navigator, 'serviceWorker', {
        value: {},
        writable: true
      });
      Object.defineProperty(window, 'BeforeInstallPromptEvent', {
        value: {},
        writable: true
      });

      expect(canInstallPWA()).toBe(true);
    });

    it('should return false when service worker is not supported', () => {
      delete (window.navigator as any).serviceWorker;
      
      expect(canInstallPWA()).toBe(false);
    });
  });

  describe('isPWAInstalled', () => {
    it('should return true for standalone display mode', () => {
      mockWindow.matchMedia.mockImplementation((query: string) => {
        if (query === '(display-mode: standalone)') {
          return { matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() };
        }
        return { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
      });

      expect(isPWAInstalled()).toBe(true);
    });

    it('should return true for iOS standalone mode', () => {
      Object.defineProperty(window.navigator, 'standalone', {
        value: true,
        writable: true
      });

      expect(isPWAInstalled()).toBe(true);
    });

    it('should return false when not installed', () => {
      mockWindow.matchMedia.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      });
      
      delete (window.navigator as any).standalone;

      expect(isPWAInstalled()).toBe(false);
    });
  });

  describe('getNetworkState', () => {
    it('should return online state', () => {
      mockNavigator.onLine = true;
      
      const state = getNetworkState();
      expect(state.isOnline).toBe(true);
    });

    it('should return offline state', () => {
      mockNavigator.onLine = false;
      
      const state = getNetworkState();
      expect(state.isOnline).toBe(false);
    });

    it('should include connection info when available', () => {
      Object.defineProperty(window.navigator, 'connection', {
        value: {
          effectiveType: '4g',
          downlink: 10,
          rtt: 50
        },
        writable: true
      });

      const state = getNetworkState();
      expect(state.effectiveType).toBe('4g');
      expect(state.downlink).toBe(10);
      expect(state.rtt).toBe(50);
    });
  });

  describe('getDeviceInfo', () => {
    it('should return device information', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        writable: true
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 812,
        writable: true
      });
      Object.defineProperty(window, 'devicePixelRatio', {
        value: 3,
        writable: true
      });

      const info = getDeviceInfo();
      expect(info.platform).toBe('ios');
      expect(info.userAgent).toBe(mockNavigator.userAgent);
      expect(info.viewport.width).toBe(375);
      expect(info.viewport.height).toBe(812);
      expect(info.pixelRatio).toBe(3);
    });

    it('should detect touch support', () => {
      Object.defineProperty(window, 'ontouchstart', {
        value: true,
        writable: true
      });

      const info = getDeviceInfo();
      expect(info.touchSupport).toBe(true);
    });
  });

  describe('InstallPromptManager', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue(null);
    });

    it('should allow showing prompt initially', () => {
      expect(InstallPromptManager.shouldShowPrompt()).toBe(true);
    });

    it('should record prompt shown', () => {
      InstallPromptManager.recordPromptShown();
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ai-pet-buddy-install-prompt-count',
        expect.stringMatching(/\{.*\}/)
      );
    });

    it('should record prompt dismissal', () => {
      InstallPromptManager.recordPromptDismissed(false);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ai-pet-buddy-install-prompt-dismissed',
        expect.stringMatching(/\{.*\}/)
      );
    });

    it('should reset prompt dismissal', () => {
      InstallPromptManager.resetPromptDismissal();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'ai-pet-buddy-install-prompt-dismissed'
      );
    });

    it('should prevent showing too many prompts per day', () => {
      // 今日の日付で3回記録
      const today = new Date().toDateString();
      const data = { [today]: 3 };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(data));

      expect(InstallPromptManager.shouldShowPrompt()).toBe(false);
    });
  });

  describe('PWAMetrics', () => {
    it('should record metrics', () => {
      PWAMetrics.record('test-event', { value: 'test' });
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ai-pet-buddy-pwa-metrics',
        expect.stringMatching(/\{.*\}/)
      );
    });

    it('should get metrics', () => {
      const mockMetrics = {
        events: [
          {
            event: 'test-event',
            data: { value: 'test' },
            timestamp: new Date().toISOString(),
            session: 'test-session'
          }
        ]
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockMetrics));

      const metrics = PWAMetrics.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].event).toBe('test-event');
    });
  });

  describe('checkPWAAvailability', () => {
    it('should return supported when service worker is available', () => {
      Object.defineProperty(window.navigator, 'serviceWorker', {
        value: {},
        writable: true
      });

      const availability = checkPWAAvailability();
      expect(availability.isSupported).toBe(true);
      expect(availability.missingFeatures).not.toContain('Service Worker');
    });

    it('should return missing features when not supported', () => {
      delete (window.navigator as any).serviceWorker;
      delete (window as any).Notification;

      const availability = checkPWAAvailability();
      expect(availability.isSupported).toBe(false);
      expect(availability.missingFeatures).toContain('Service Worker');
      expect(availability.missingFeatures).toContain('Push Notifications');
    });

    it('should provide recommendations', () => {
      delete (window.navigator as any).serviceWorker;

      const availability = checkPWAAvailability();
      expect(availability.recommendations).toContain('ブラウザを最新版に更新してください');
    });
  });
});