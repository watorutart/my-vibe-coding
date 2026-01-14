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
  checkPWAAvailability,
} from './pwaUtils';

describe('PWA Utils', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Reset localStorage mock
    const mockLocalStorage = globalThis.localStorage as any;
    mockLocalStorage.getItem.mockReturnValue(null);

    // Reset sessionStorage mock
    const mockSessionStorage = globalThis.sessionStorage as any;
    mockSessionStorage.getItem.mockReturnValue(null);

    // Reset matchMedia mock
    const mockMatchMedia = globalThis.matchMedia as any;
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    // Reset navigator mocks
    Object.defineProperty(globalThis.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      writable: true,
      configurable: true,
    });

    Object.defineProperty(globalThis.navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  describe('detectPlatform', () => {
    it('should detect iOS platform', () => {
      Object.defineProperty(globalThis.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
        configurable: true,
      });
      expect(detectPlatform()).toBe('ios');
    });

    it('should detect iPad as iOS', () => {
      Object.defineProperty(globalThis.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
        writable: true,
        configurable: true,
      });
      expect(detectPlatform()).toBe('ios');
    });

    it('should detect iPod as iOS', () => {
      Object.defineProperty(globalThis.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
        configurable: true,
      });
      expect(detectPlatform()).toBe('ios');
    });

    it('should detect Android platform', () => {
      Object.defineProperty(globalThis.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F)',
        writable: true,
        configurable: true,
      });
      expect(detectPlatform()).toBe('android');
    });

    it('should detect desktop platform', () => {
      Object.defineProperty(globalThis.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true,
        configurable: true,
      });
      expect(detectPlatform()).toBe('desktop');
    });
  });

  describe('detectPWACapabilities', () => {
    it('should detect service worker support', () => {
      const capabilities = detectPWACapabilities();
      expect(capabilities.serviceWorker).toBe(true);
    });

    it('should detect push notification support', () => {
      const capabilities = detectPWACapabilities();
      expect(capabilities.pushNotifications).toBe(true);
    });

    it('should detect web share support', () => {
      const capabilities = detectPWACapabilities();
      expect(capabilities.webShare).toBe(true);
    });

    it('should return false for unsupported features', () => {
      // Create a new navigator object without serviceWorker
      const originalNavigator = globalThis.navigator;
      const mockNavigatorWithoutSW = {
        ...originalNavigator,
        userAgent: originalNavigator.userAgent,
        onLine: originalNavigator.onLine,
      };
      // Remove serviceWorker property completely
      delete (mockNavigatorWithoutSW as any).serviceWorker;

      Object.defineProperty(globalThis, 'navigator', {
        value: mockNavigatorWithoutSW,
        writable: true,
        configurable: true,
      });

      const capabilities = detectPWACapabilities();
      expect(capabilities.serviceWorker).toBe(false);

      // Restore original navigator
      Object.defineProperty(globalThis, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('canInstallPWA', () => {
    it('should return true when service worker and install prompt are supported', () => {
      const result = canInstallPWA();
      expect(result).toBe(true);
    });

    it('should return false when service worker is not supported', () => {
      // Create a new navigator object without serviceWorker
      const originalNavigator = globalThis.navigator;
      const mockNavigatorWithoutSW = {
        ...originalNavigator,
        userAgent: originalNavigator.userAgent,
        onLine: originalNavigator.onLine,
      };
      // Remove serviceWorker property completely
      delete (mockNavigatorWithoutSW as any).serviceWorker;

      Object.defineProperty(globalThis, 'navigator', {
        value: mockNavigatorWithoutSW,
        writable: true,
        configurable: true,
      });

      const result = canInstallPWA();
      expect(result).toBe(false);

      // Restore original navigator
      Object.defineProperty(globalThis, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('isPWAInstalled', () => {
    it('should return true for standalone display mode', () => {
      const mockMatchMedia = globalThis.matchMedia as any;
      mockMatchMedia.mockReturnValue({ matches: true });

      const result = isPWAInstalled();
      expect(result).toBe(true);
    });

    it('should return true for iOS standalone mode', () => {
      Object.defineProperty(globalThis.navigator, 'standalone', {
        value: true,
        writable: true,
        configurable: true,
      });

      const result = isPWAInstalled();
      expect(result).toBe(true);
    });

    it('should return false when not installed', () => {
      const mockMatchMedia = globalThis.matchMedia as any;
      mockMatchMedia.mockReturnValue({ matches: false });

      Object.defineProperty(globalThis.navigator, 'standalone', {
        value: false,
        writable: true,
        configurable: true,
      });

      const result = isPWAInstalled();
      expect(result).toBe(false);
    });
  });

  describe('getNetworkState', () => {
    it('should return online state', () => {
      const state = getNetworkState();
      expect(state.isOnline).toBe(true);
    });

    it('should return offline state', () => {
      Object.defineProperty(globalThis.navigator, 'onLine', {
        value: false,
        writable: true,
        configurable: true,
      });

      const state = getNetworkState();
      expect(state.isOnline).toBe(false);
    });

    it('should include connection info when available', () => {
      const state = getNetworkState();
      expect(state.effectiveType).toBe('4g');
      expect(state.downlink).toBe(10);
      expect(state.rtt).toBe(100);
    });
  });

  describe('getDeviceInfo', () => {
    it('should return device information', () => {
      const info = getDeviceInfo();
      expect(info.platform).toBe('desktop');
      expect(info.userAgent).toContain('Mozilla');
      expect(typeof info.viewport.width).toBe('number');
      expect(typeof info.viewport.height).toBe('number');
    });

    it('should detect touch support', () => {
      // Mock touch support
      Object.defineProperty(globalThis, 'ontouchstart', {
        value: {},
        writable: true,
        configurable: true,
      });

      const info = getDeviceInfo();
      expect(info.touchSupport).toBe(true);
    });
  });

  describe('InstallPromptManager', () => {
    it('should allow showing prompt initially', () => {
      // Mock isPWAInstalled to return false
      const mockMatchMedia = globalThis.matchMedia as any;
      mockMatchMedia.mockReturnValue({ matches: false });

      Object.defineProperty(globalThis.navigator, 'standalone', {
        value: false,
        writable: true,
        configurable: true,
      });

      const result = InstallPromptManager.shouldShowPrompt();
      expect(result).toBe(true);
    });

    it('should record prompt shown', () => {
      const mockLocalStorage = globalThis.localStorage as any;

      InstallPromptManager.recordPromptShown();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'ai-pet-buddy-install-prompt-count',
        expect.stringMatching(/\{.*\}/)
      );
    });

    it('should record prompt dismissal', () => {
      const mockLocalStorage = globalThis.localStorage as any;

      InstallPromptManager.recordPromptDismissed();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'ai-pet-buddy-install-prompt-dismissed',
        expect.stringMatching(/\{.*\}/)
      );
    });

    it('should reset prompt dismissal', () => {
      const mockLocalStorage = globalThis.localStorage as any;

      InstallPromptManager.resetPromptDismissal();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'ai-pet-buddy-install-prompt-dismissed'
      );
    });

    it('should prevent showing too many prompts per day', () => {
      const mockLocalStorage = globalThis.localStorage as any;
      const mockData = {
        [new Date().toDateString()]: 3,
        lastShown: new Date().toISOString(),
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = InstallPromptManager.shouldShowPrompt();
      expect(result).toBe(false);
    });
  });

  describe('PWAMetrics', () => {
    it('should record metrics', () => {
      const mockLocalStorage = globalThis.localStorage as any;

      PWAMetrics.record('test-event', { value: 'test' });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'ai-pet-buddy-pwa-metrics',
        expect.stringMatching(/\{.*\}/)
      );
    });

    it('should get metrics', () => {
      const mockLocalStorage = globalThis.localStorage as any;
      const mockMetrics = {
        events: [
          {
            event: 'test-event',
            data: { value: 'test' },
            timestamp: new Date().toISOString(),
            session: 'test-session',
          },
        ],
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockMetrics));

      const metrics = PWAMetrics.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].event).toBe('test-event');
    });
  });

  describe('checkPWAAvailability', () => {
    it('should return supported when service worker is available', () => {
      const availability = checkPWAAvailability();
      expect(availability.isSupported).toBe(true);
      expect(availability.missingFeatures).not.toContain('Service Worker');
    });

    it('should return missing features when not supported', () => {
      // Create new global objects without PWA features
      const originalNavigator = globalThis.navigator;
      const originalNotification = globalThis.Notification;
      const originalPushManager = globalThis.PushManager;

      const mockNavigatorWithoutSW = {
        ...originalNavigator,
        userAgent: originalNavigator.userAgent,
        onLine: originalNavigator.onLine,
      };
      // Remove serviceWorker property completely
      delete (mockNavigatorWithoutSW as any).serviceWorker;

      Object.defineProperty(globalThis, 'navigator', {
        value: mockNavigatorWithoutSW,
        writable: true,
        configurable: true,
      });

      // Delete properties instead of setting to undefined
      delete (globalThis as any).Notification;
      delete (globalThis as any).PushManager;

      const availability = checkPWAAvailability();
      expect(availability.isSupported).toBe(false);
      expect(availability.missingFeatures).toContain('Service Worker');
      expect(availability.missingFeatures).toContain('Push Notifications');

      // Restore original objects
      Object.defineProperty(globalThis, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });

      Object.defineProperty(globalThis, 'Notification', {
        value: originalNotification,
        writable: true,
        configurable: true,
      });

      Object.defineProperty(globalThis, 'PushManager', {
        value: originalPushManager,
        writable: true,
        configurable: true,
      });
    });

    it('should provide recommendations', () => {
      // Create a new navigator object without serviceWorker
      const originalNavigator = globalThis.navigator;
      const mockNavigatorWithoutSW = {
        ...originalNavigator,
        userAgent: originalNavigator.userAgent,
        onLine: originalNavigator.onLine,
      };
      // Remove serviceWorker property completely
      delete (mockNavigatorWithoutSW as any).serviceWorker;

      Object.defineProperty(globalThis, 'navigator', {
        value: mockNavigatorWithoutSW,
        writable: true,
        configurable: true,
      });

      const availability = checkPWAAvailability();
      expect(availability.recommendations).toContain(
        'ブラウザを最新版に更新してください'
      );

      // Restore original navigator
      Object.defineProperty(globalThis, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
    });
  });
});
