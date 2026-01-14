/**
 * @file PWA.test.ts
 * @description PWA型定義のテスト
 */

import { describe, it, expect } from 'vitest';
import type {
  PWAState,
  NotificationData,
  PetNotificationConfig,
  PWACapabilities,
  PWAEvent,
} from './PWA';
import { DEFAULT_PWA_CONFIG } from './PWA';

describe('PWA Types', () => {
  describe('DEFAULT_PWA_CONFIG', () => {
    it('should have valid default configuration', () => {
      expect(DEFAULT_PWA_CONFIG).toBeDefined();
      expect(DEFAULT_PWA_CONFIG.serviceWorker.enabled).toBe(true);
      expect(DEFAULT_PWA_CONFIG.notifications.enabled).toBe(false);
      expect(DEFAULT_PWA_CONFIG.install.showPrompt).toBe(true);
      expect(DEFAULT_PWA_CONFIG.offline.showIndicator).toBe(true);
    });

    it('should have valid notification settings', () => {
      const notifications = DEFAULT_PWA_CONFIG.notifications;

      expect(notifications.hunger.enabled).toBe(true);
      expect(notifications.hunger.threshold).toBeGreaterThan(0);
      expect(notifications.hunger.threshold).toBeLessThanOrEqual(100);
      expect(notifications.hunger.interval).toBeGreaterThan(0);

      expect(notifications.energy.enabled).toBe(true);
      expect(notifications.energy.threshold).toBeGreaterThan(0);
      expect(notifications.energy.threshold).toBeLessThanOrEqual(100);
      expect(notifications.energy.interval).toBeGreaterThan(0);

      expect(notifications.happiness.enabled).toBe(true);
      expect(notifications.happiness.threshold).toBeGreaterThan(0);
      expect(notifications.happiness.threshold).toBeLessThanOrEqual(100);
      expect(notifications.happiness.interval).toBeGreaterThan(0);
    });

    it('should have valid quiet hours format', () => {
      const quietHours = DEFAULT_PWA_CONFIG.notifications.quietHours;

      expect(quietHours.start).toMatch(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/);
      expect(quietHours.end).toMatch(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/);
    });
  });

  describe('Type Validation', () => {
    it('should accept valid PWAState object', () => {
      const pwaState: PWAState = {
        serviceWorker: {
          isRegistered: true,
          isControlling: true,
          hasUpdate: false,
          error: null,
        },
        install: {
          canInstall: true,
          isInstalled: false,
          isPromptShowing: false,
          platform: 'android',
          deferredPrompt: null,
        },
        notification: {
          permission: 'granted',
          isSupported: true,
          isServiceWorkerSupported: true,
        },
        offline: {
          isOffline: false,
          lastOnline: new Date(),
          offlineDuration: 0,
          hasPendingSync: false,
        },
        cache: {
          size: 1024,
          resourceCount: 50,
          lastUpdated: new Date(),
          caches: {
            static: { name: 'static-v1', size: 512, count: 25 },
            dynamic: { name: 'dynamic-v1', size: 256, count: 15 },
            data: { name: 'data-v1', size: 256, count: 10 },
          },
        },
        isSupported: true,
        isActive: true,
      };

      expect(pwaState.serviceWorker.isRegistered).toBe(true);
      expect(pwaState.install.platform).toBe('android');
      expect(pwaState.notification.permission).toBe('granted');
      expect(pwaState.isSupported).toBe(true);
    });

    it('should accept valid NotificationData object', () => {
      const notificationData: NotificationData = {
        title: 'Test Notification',
        body: 'This is a test notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge.png',
        tag: 'test-notification',
        vibrate: [200, 100, 200],
        data: { type: 'test', value: 'test-data' },
        actions: [
          {
            action: 'test-action',
            title: 'Test Action',
            icon: '/icons/action.png',
          },
        ],
      };

      expect(notificationData.title).toBe('Test Notification');
      expect(notificationData.body).toBe('This is a test notification');
      expect(notificationData.actions).toHaveLength(1);
      expect(notificationData.actions![0].action).toBe('test-action');
    });

    it('should accept valid PetNotificationConfig object', () => {
      const config: PetNotificationConfig = {
        enabled: true,
        hunger: { enabled: true, threshold: 30, interval: 30 },
        energy: { enabled: true, threshold: 20, interval: 60 },
        happiness: { enabled: true, threshold: 40, interval: 45 },
        levelUp: { enabled: true },
        evolution: { enabled: true },
        quietHours: { enabled: false, start: '22:00', end: '08:00' },
      };

      expect(config.enabled).toBe(true);
      expect(config.hunger.threshold).toBe(30);
      expect(config.energy.interval).toBe(60);
      expect(config.quietHours.start).toBe('22:00');
    });

    it('should accept valid PWACapabilities object', () => {
      const capabilities: PWACapabilities = {
        serviceWorker: true,
        pushNotifications: true,
        installPrompt: false,
        backgroundSync: true,
        webShare: false,
      };

      expect(capabilities.serviceWorker).toBe(true);
      expect(capabilities.pushNotifications).toBe(true);
      expect(capabilities.installPrompt).toBe(false);
    });

    it('should accept valid PWAEvent object', () => {
      const event: PWAEvent = {
        type: 'sw-registered',
        data: { scope: '/' },
        timestamp: new Date(),
      };

      expect(event.type).toBe('sw-registered');
      expect(event.data).toEqual({ scope: '/' });
      expect(event.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Platform Types', () => {
    it('should accept valid platform values', () => {
      const platforms: Array<'ios' | 'android' | 'desktop'> = [
        'ios',
        'android',
        'desktop',
      ];

      platforms.forEach(platform => {
        expect(['ios', 'android', 'desktop']).toContain(platform);
      });
    });
  });

  describe('Notification Permission Types', () => {
    it('should accept valid notification permission values', () => {
      const permissions: NotificationPermission[] = [
        'default',
        'granted',
        'denied',
      ];

      permissions.forEach(permission => {
        expect(['default', 'granted', 'denied']).toContain(permission);
      });
    });
  });

  describe('PWA Event Types', () => {
    it('should accept valid PWA event types', () => {
      const eventTypes = [
        'sw-registered',
        'sw-updated',
        'sw-error',
        'install-available',
        'install-completed',
        'install-failed',
        'notification-granted',
        'notification-denied',
        'offline',
        'online',
        'cache-updated',
      ];

      eventTypes.forEach(eventType => {
        const event: PWAEvent = {
          type: eventType as any,
          timestamp: new Date(),
        };

        expect(event.type).toBe(eventType);
      });
    });
  });
});
