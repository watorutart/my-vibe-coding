/**
 * @file useNotification.ts
 * @description プッシュ通知管理のReactフック
 *
 * PWAプッシュ通知の許可取得、設定管理、ペット状態通知の
 * スケジューリングを行うフックを提供します。
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  NotificationPermissionState,
  PetNotificationConfig,
  NotificationData,
} from '../types/PWA';
import {
  pushNotificationManager,
  requestNotificationPermission,
  getNotificationPermissionState,
  sendNotification,
  schedulePetNotifications,
  sendLevelUpNotification,
  sendEvolutionNotification,
  updateNotificationConfig,
  getNotificationConfig,
  addEventListener as addNotificationEventListener,
  removeEventListener as removeNotificationEventListener,
} from '../utils/pushNotification';

/**
 * ペット統計情報の型（簡易版）
 */
interface PetStats {
  hunger: number;
  energy: number;
  happiness: number;
  level: number;
}

/**
 * 通知管理フック
 */
export const useNotification = () => {
  // 通知許可状態
  const [permissionState, setPermissionState] =
    useState<NotificationPermissionState>({
      permission: 'default',
      isSupported: false,
      isServiceWorkerSupported: false,
    });

  // 通知設定
  const [config, setConfig] = useState<PetNotificationConfig>({
    enabled: false,
    hunger: { enabled: true, threshold: 30, interval: 30 },
    energy: { enabled: true, threshold: 20, interval: 60 },
    happiness: { enabled: true, threshold: 40, interval: 45 },
    levelUp: { enabled: true },
    evolution: { enabled: true },
    quietHours: { enabled: false, start: '22:00', end: '08:00' },
  });

  // 通知送信中かどうかの状態
  const [isSending, setIsSending] = useState(false);

  // 最後に送信した通知のタイムスタンプ
  const [lastNotificationTime, setLastNotificationTime] = useState<Date | null>(
    null
  );

  // ペット統計の監視用タイマー
  const petStatsTimer = useRef<number | null>(null);
  const currentPetStats = useRef<PetStats | null>(null);

  /**
   * 通知許可を要求
   */
  const requestPermission = useCallback(async () => {
    try {
      console.log('[Notification] Requesting permission...');

      const granted = await requestNotificationPermission();

      // 状態を更新
      const newState = getNotificationPermissionState();
      setPermissionState(newState);

      if (granted) {
        // 許可が得られた場合、設定を有効化
        const newConfig = { ...config, enabled: true };
        setConfig(newConfig);
        updateNotificationConfig(newConfig);

        console.log(
          '[Notification] Permission granted and notifications enabled'
        );
      }

      return granted;
    } catch (error) {
      console.error('[Notification] Permission request failed:', error);
      return false;
    }
  }, [config]);

  /**
   * 通知設定を更新
   */
  const updateConfig = useCallback(
    (updates: Partial<PetNotificationConfig>) => {
      const newConfig = { ...config, ...updates };
      setConfig(newConfig);
      updateNotificationConfig(newConfig);

      console.log('[Notification] Config updated:', updates);
    },
    [config]
  );

  /**
   * テスト通知を送信
   */
  const sendTestNotification = useCallback(async () => {
    if (
      !permissionState.isSupported ||
      permissionState.permission !== 'granted'
    ) {
      console.warn(
        '[Notification] Cannot send test notification - permission not granted'
      );
      return false;
    }

    setIsSending(true);

    try {
      const success = await sendNotification({
        title: '🐾 AI Pet Buddy',
        body: 'テスト通知です！通知が正常に動作しています。',
        tag: 'test-notification',
        data: { type: 'test' },
      });

      if (success) {
        setLastNotificationTime(new Date());
        console.log('[Notification] Test notification sent successfully');
      }

      return success;
    } catch (error) {
      console.error('[Notification] Failed to send test notification:', error);
      return false;
    } finally {
      setIsSending(false);
    }
  }, [permissionState]);

  /**
   * ペット状態通知を手動で送信
   */
  const sendPetStatusNotification = useCallback(
    async (type: 'hunger' | 'energy' | 'happiness', value: number) => {
      if (!config.enabled || !config[type].enabled) {
        return false;
      }

      setIsSending(true);

      try {
        const notifications = {
          hunger: {
            title: 'ペットがお腹を空かせています！',
            body: `空腹度: ${value}% - ご飯をあげて元気にしてあげましょう 🍖`,
            tag: 'pet-hunger',
          },
          energy: {
            title: 'ペットが疲れています！',
            body: `エネルギー: ${value}% - 休憩させてあげましょう 😴`,
            tag: 'pet-energy',
          },
          happiness: {
            title: 'ペットが寂しがっています！',
            body: `幸福度: ${value}% - 一緒に遊んであげましょう 🎮`,
            tag: 'pet-happiness',
          },
        };

        const notificationData = notifications[type];

        const success = await sendNotification({
          ...notificationData,
          data: { type, value },
        });

        if (success) {
          setLastNotificationTime(new Date());
          console.log(`[Notification] ${type} notification sent`);
        }

        return success;
      } catch (error) {
        console.error(
          `[Notification] Failed to send ${type} notification:`,
          error
        );
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [config]
  );

  /**
   * レベルアップ通知を送信
   */
  const sendLevelUp = useCallback(
    async (level: number) => {
      if (!config.levelUp.enabled) {
        return false;
      }

      setIsSending(true);

      try {
        const success = await sendLevelUpNotification(level);

        if (success) {
          setLastNotificationTime(new Date());
          console.log(
            `[Notification] Level up notification sent for level ${level}`
          );
        }

        return success;
      } catch (error) {
        console.error(
          '[Notification] Failed to send level up notification:',
          error
        );
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [config.levelUp.enabled]
  );

  /**
   * 進化通知を送信
   */
  const sendEvolution = useCallback(
    async (evolutionStage: string) => {
      if (!config.evolution.enabled) {
        return false;
      }

      setIsSending(true);

      try {
        const success = await sendEvolutionNotification(evolutionStage);

        if (success) {
          setLastNotificationTime(new Date());
          console.log(
            `[Notification] Evolution notification sent for ${evolutionStage}`
          );
        }

        return success;
      } catch (error) {
        console.error(
          '[Notification] Failed to send evolution notification:',
          error
        );
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [config.evolution.enabled]
  );

  /**
   * ペット統計を監視してスケジュールされた通知を送信
   */
  const monitorPetStats = useCallback(
    (petStats: PetStats) => {
      currentPetStats.current = petStats;

      if (config.enabled) {
        schedulePetNotifications(petStats);
        console.log('[Notification] Pet stats monitoring updated:', petStats);
      }
    },
    [config.enabled]
  );

  /**
   * 定期的なペット統計チェックを開始
   */
  const startPetStatsMonitoring = useCallback(
    (
      getStats: () => PetStats,
      interval = 60000 // 1分間隔
    ) => {
      // 既存のタイマーをクリア
      if (petStatsTimer.current) {
        clearInterval(petStatsTimer.current);
      }

      // 新しいタイマーを開始
      petStatsTimer.current = window.setInterval(() => {
        if (config.enabled) {
          const stats = getStats();
          monitorPetStats(stats);
        }
      }, interval);

      console.log('[Notification] Pet stats monitoring started');
    },
    [config.enabled, monitorPetStats]
  );

  /**
   * ペット統計の監視を停止
   */
  const stopPetStatsMonitoring = useCallback(() => {
    if (petStatsTimer.current) {
      clearInterval(petStatsTimer.current);
      petStatsTimer.current = null;
      console.log('[Notification] Pet stats monitoring stopped');
    }
  }, []);

  /**
   * 通知履歴をクリア
   */
  const clearNotificationHistory = useCallback(() => {
    try {
      localStorage.removeItem('ai-pet-buddy-notification-history');
      setLastNotificationTime(null);
      console.log('[Notification] Notification history cleared');
    } catch (error) {
      console.error(
        '[Notification] Failed to clear notification history:',
        error
      );
    }
  }, []);

  /**
   * 通知が送信可能かチェック
   */
  const canSendNotifications = useCallback(() => {
    return (
      permissionState.isSupported &&
      permissionState.permission === 'granted' &&
      config.enabled
    );
  }, [permissionState, config.enabled]);

  /**
   * 静音時間かどうかをチェック
   */
  const isQuietTime = useCallback(() => {
    if (!config.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 100 + minutes;
    };

    const startTime = parseTime(config.quietHours.start);
    const endTime = parseTime(config.quietHours.end);

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  }, [config.quietHours]);

  // 初期化
  useEffect(() => {
    // 初期状態を取得
    const initialState = getNotificationPermissionState();
    setPermissionState(initialState);

    const initialConfig = getNotificationConfig();
    setConfig(initialConfig);

    console.log('[Notification] Hook initialized');
  }, []);

  // 通知許可状態の変更を監視
  useEffect(() => {
    const handlePermissionChange = () => {
      const newState = getNotificationPermissionState();
      setPermissionState(newState);

      console.log(
        '[Notification] Permission state changed:',
        newState.permission
      );
    };

    // Notification.permission の変更を監視（可能な場合）
    if ('permissions' in navigator) {
      navigator.permissions
        .query({ name: 'notifications' })
        .then(permission => {
          permission.addEventListener('change', handlePermissionChange);
        });
    }

    return () => {
      // クリーンアップ
      if (petStatsTimer.current) {
        clearInterval(petStatsTimer.current);
      }
    };
  }, []);

  return {
    // 状態
    permissionState,
    config,
    isSending,
    lastNotificationTime,

    // アクション
    requestPermission,
    updateConfig,
    sendTestNotification,
    sendPetStatusNotification,
    sendLevelUp,
    sendEvolution,
    monitorPetStats,
    startPetStatsMonitoring,
    stopPetStatsMonitoring,
    clearNotificationHistory,

    // 便利な状態プロパティ
    isEnabled: config.enabled,
    isSupported: permissionState.isSupported,
    isGranted: permissionState.permission === 'granted',
    canSend: canSendNotifications(),
    isQuietTime: isQuietTime(),

    // 設定値へのアクセス
    hungerThreshold: config.hunger.threshold,
    energyThreshold: config.energy.threshold,
    happinessThreshold: config.happiness.threshold,

    // 現在のペット統計
    currentStats: currentPetStats.current,
  };
};
