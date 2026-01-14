/**
 * @file pushNotification.ts
 * @description プッシュ通知管理ユーティリティ
 *
 * PWAプッシュ通知の許可取得、送信、スケジューリング機能を提供します。
 */

import type {
  NotificationPermissionState,
  NotificationData,
  PetNotificationConfig,
  PWAEvent,
} from '../types/PWA';

// ローカルストレージキー
const STORAGE_KEYS = {
  NOTIFICATION_CONFIG: 'ai-pet-buddy-notification-config',
  NOTIFICATION_HISTORY: 'ai-pet-buddy-notification-history',
  LAST_PERMISSION_REQUEST: 'ai-pet-buddy-last-permission-request',
} as const;

// 通知スケジューリング用のタイマー管理
const notificationTimers = new Map<string, number>();

// イベントリスナー管理
type EventListener = (event: PWAEvent) => void;
const eventListeners: EventListener[] = [];

/**
 * プッシュ通知マネージャークラス
 */
export class PushNotificationManager {
  private config: PetNotificationConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  /**
   * 通知許可を要求
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isNotificationSupported()) {
      console.warn('[Notification] Notifications not supported');
      return false;
    }

    try {
      // すでに許可されている場合
      if (Notification.permission === 'granted') {
        return true;
      }

      // 拒否されている場合は要求しない
      if (Notification.permission === 'denied') {
        console.warn('[Notification] Notifications denied');
        return false;
      }

      // 最後の要求から時間が経っていない場合はスキップ
      const lastRequest = this.getLastPermissionRequest();
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      if (lastRequest && now - lastRequest.getTime() < oneHour) {
        console.log('[Notification] Permission recently requested, skipping');
        return false;
      }

      // 許可を要求
      console.log('[Notification] Requesting notification permission...');
      const permission = await Notification.requestPermission();

      // 要求時刻を保存
      this.saveLastPermissionRequest(new Date());

      const granted = permission === 'granted';

      // イベントを発火
      this.emitEvent({
        type: granted ? 'notification-granted' : 'notification-denied',
        data: { permission },
        timestamp: new Date(),
      });

      if (granted) {
        console.log('[Notification] Permission granted');
        // 設定を有効化
        this.updateConfig({ enabled: true });
      } else {
        console.log('[Notification] Permission denied');
      }

      return granted;
    } catch (error) {
      console.error('[Notification] Permission request failed:', error);
      return false;
    }
  }

  /**
   * 通知許可状態を取得
   */
  getPermissionState(): NotificationPermissionState {
    const isSupported = this.isNotificationSupported();
    const isServiceWorkerSupported = 'serviceWorker' in navigator;

    return {
      permission: isSupported ? Notification.permission : 'denied',
      isSupported,
      isServiceWorkerSupported,
      lastRequested: this.getLastPermissionRequest(),
    };
  }

  /**
   * 通知を送信
   */
  async sendNotification(data: NotificationData): Promise<boolean> {
    if (!this.canSendNotification()) {
      return false;
    }

    try {
      // 通知履歴をチェック（重複防止）
      if (data.tag && this.isRecentNotification(data.tag, 5 * 60 * 1000)) {
        console.log(
          `[Notification] Skipping duplicate notification: ${data.tag}`
        );
        return false;
      }

      // 静音時間をチェック
      if (this.isQuietTime()) {
        console.log('[Notification] Quiet time, skipping notification');
        return false;
      }

      const options: NotificationOptions = {
        body: data.body,
        icon: data.icon || '/icons/icon-192x192.png',
        badge: data.badge || '/icons/icon-192x192.png',
        tag: data.tag,
        vibrate: data.vibrate || [200, 100, 200],
        data: data.data,
        actions: data.actions,
        requireInteraction: false,
        silent: false,
      };

      // Service Workerが利用可能な場合
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Service Worker経由で通知を表示
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title: data.title,
          options,
        });
      } else {
        // 直接通知を表示
        new Notification(data.title, options);
      }

      // 通知履歴に追加
      this.addNotificationHistory(data);

      console.log(`[Notification] Sent: ${data.title}`);
      return true;
    } catch (error) {
      console.error('[Notification] Failed to send notification:', error);
      return false;
    }
  }

  /**
   * ペット状態に基づいた通知をスケジュール
   */
  schedulePetNotifications(petStats: {
    hunger: number;
    energy: number;
    happiness: number;
    level: number;
  }): void {
    if (!this.config?.enabled) {
      return;
    }

    const { hunger, energy, happiness } = this.config;

    // 空腹通知
    if (hunger.enabled && petStats.hunger < hunger.threshold) {
      this.scheduleNotification(
        'pet-hunger',
        {
          title: 'ペットがお腹を空かせています！',
          body: `空腹度: ${petStats.hunger}% - ご飯をあげて元気にしてあげましょう 🍖`,
          tag: 'pet-hunger',
          data: { type: 'hunger', value: petStats.hunger },
        },
        hunger.interval * 60 * 1000
      );
    }

    // エネルギー通知
    if (energy.enabled && petStats.energy < energy.threshold) {
      this.scheduleNotification(
        'pet-energy',
        {
          title: 'ペットが疲れています！',
          body: `エネルギー: ${petStats.energy}% - 休憩させてあげましょう 😴`,
          tag: 'pet-energy',
          data: { type: 'energy', value: petStats.energy },
        },
        energy.interval * 60 * 1000
      );
    }

    // 幸福度通知
    if (happiness.enabled && petStats.happiness < happiness.threshold) {
      this.scheduleNotification(
        'pet-happiness',
        {
          title: 'ペットが寂しがっています！',
          body: `幸福度: ${petStats.happiness}% - 一緒に遊んであげましょう 🎮`,
          tag: 'pet-happiness',
          data: { type: 'happiness', value: petStats.happiness },
        },
        happiness.interval * 60 * 1000
      );
    }
  }

  /**
   * レベルアップ通知を送信
   */
  async sendLevelUpNotification(level: number): Promise<boolean> {
    if (!this.config?.levelUp.enabled) {
      return false;
    }

    return this.sendNotification({
      title: '🎉 レベルアップ！',
      body: `ペットがレベル ${level} に成長しました！おめでとうございます！`,
      tag: 'pet-levelup',
      data: { type: 'levelup', level },
      actions: [
        {
          action: 'celebrate',
          title: 'お祝いする',
          icon: '/icons/shortcut-play.png',
        },
      ],
    });
  }

  /**
   * 進化通知を送信
   */
  async sendEvolutionNotification(evolutionStage: string): Promise<boolean> {
    if (!this.config?.evolution.enabled) {
      return false;
    }

    return this.sendNotification({
      title: '✨ 進化しました！',
      body: `ペットが ${evolutionStage} に進化しました！新しい姿を見に行きましょう！`,
      tag: 'pet-evolution',
      data: { type: 'evolution', stage: evolutionStage },
      actions: [
        {
          action: 'view',
          title: '見に行く',
          icon: '/icons/shortcut-play.png',
        },
      ],
    });
  }

  /**
   * 通知をスケジュール
   */
  private scheduleNotification(
    id: string,
    notification: NotificationData,
    delay: number
  ): void {
    // 既存のタイマーをクリア
    if (notificationTimers.has(id)) {
      clearTimeout(notificationTimers.get(id)!);
    }

    // 新しいタイマーを設定
    const timerId = window.setTimeout(async () => {
      await this.sendNotification(notification);
      notificationTimers.delete(id);
    }, delay);

    notificationTimers.set(id, timerId);
  }

  /**
   * スケジュールされた通知をキャンセル
   */
  cancelScheduledNotification(id: string): void {
    if (notificationTimers.has(id)) {
      clearTimeout(notificationTimers.get(id)!);
      notificationTimers.delete(id);
    }
  }

  /**
   * すべてのスケジュールされた通知をキャンセル
   */
  cancelAllScheduledNotifications(): void {
    notificationTimers.forEach(timerId => clearTimeout(timerId));
    notificationTimers.clear();
  }

  /**
   * 通知設定を更新
   */
  updateConfig(updates: Partial<PetNotificationConfig>): void {
    this.config = { ...this.config!, ...updates };
    this.saveConfig();

    console.log('[Notification] Config updated:', updates);
  }

  /**
   * 通知設定を取得
   */
  getConfig(): PetNotificationConfig {
    if (!this.config) {
      this.loadConfig();
    }
    return this.config!;
  }

  /**
   * 通知が送信可能かチェック
   */
  private canSendNotification(): boolean {
    return (
      this.isNotificationSupported() &&
      Notification.permission === 'granted' &&
      this.config?.enabled === true
    );
  }

  /**
   * 通知がサポートされているかチェック
   */
  private isNotificationSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * 静音時間かチェック
   */
  private isQuietTime(): boolean {
    if (!this.config?.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    const startTime = this.parseTime(this.config.quietHours.start);
    const endTime = this.parseTime(this.config.quietHours.end);

    if (startTime <= endTime) {
      // 同じ日の範囲内
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // 日をまたぐ範囲
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * 時刻文字列を数値に変換
   */
  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 100 + minutes;
  }

  /**
   * 最近の重複通知をチェック
   */
  private isRecentNotification(tag: string, withinMs: number): boolean {
    const history = this.getNotificationHistory();
    const cutoff = Date.now() - withinMs;

    return history.some(entry => entry.tag === tag && entry.timestamp > cutoff);
  }

  /**
   * 通知履歴に追加
   */
  private addNotificationHistory(notification: NotificationData): void {
    const history = this.getNotificationHistory();
    const entry = {
      title: notification.title,
      tag: notification.tag,
      timestamp: Date.now(),
    };

    history.unshift(entry);

    // 最大100件まで保持
    if (history.length > 100) {
      history.splice(100);
    }

    try {
      localStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_HISTORY,
        JSON.stringify(history)
      );
    } catch (error) {
      console.error('[Notification] Failed to save history:', error);
    }
  }

  /**
   * 通知履歴を取得
   */
  private getNotificationHistory(): Array<{
    title: string;
    tag?: string;
    timestamp: number;
  }> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[Notification] Failed to load history:', error);
      return [];
    }
  }

  /**
   * 最後の許可要求時刻を保存
   */
  private saveLastPermissionRequest(date: Date): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.LAST_PERMISSION_REQUEST,
        date.toISOString()
      );
    } catch (error) {
      console.error('[Notification] Failed to save last request time:', error);
    }
  }

  /**
   * 最後の許可要求時刻を取得
   */
  private getLastPermissionRequest(): Date | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LAST_PERMISSION_REQUEST);
      return stored ? new Date(stored) : null;
    } catch (error) {
      console.error('[Notification] Failed to load last request time:', error);
      return null;
    }
  }

  /**
   * 設定を保存
   */
  private saveConfig(): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_CONFIG,
        JSON.stringify(this.config)
      );
    } catch (error) {
      console.error('[Notification] Failed to save config:', error);
    }
  }

  /**
   * 設定を読み込み
   */
  private loadConfig(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_CONFIG);
      if (stored) {
        this.config = JSON.parse(stored);
      } else {
        // デフォルト設定
        this.config = {
          enabled: false,
          hunger: { enabled: true, threshold: 30, interval: 30 },
          energy: { enabled: true, threshold: 20, interval: 60 },
          happiness: { enabled: true, threshold: 40, interval: 45 },
          levelUp: { enabled: true },
          evolution: { enabled: true },
          quietHours: { enabled: false, start: '22:00', end: '08:00' },
        };
        this.saveConfig();
      }
    } catch (error) {
      console.error('[Notification] Failed to load config:', error);
      // フォールバック設定
      this.config = {
        enabled: false,
        hunger: { enabled: true, threshold: 30, interval: 30 },
        energy: { enabled: true, threshold: 20, interval: 60 },
        happiness: { enabled: true, threshold: 40, interval: 45 },
        levelUp: { enabled: true },
        evolution: { enabled: true },
        quietHours: { enabled: false, start: '22:00', end: '08:00' },
      };
    }
  }

  /**
   * イベントを発火
   */
  private emitEvent(event: PWAEvent): void {
    eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[Notification] Event listener error:', error);
      }
    });
  }
}

// シングルトンインスタンス
export const pushNotificationManager = new PushNotificationManager();

// 便利関数をエクスポート
export const requestNotificationPermission = () =>
  pushNotificationManager.requestPermission();

export const getNotificationPermissionState = () =>
  pushNotificationManager.getPermissionState();

export const sendNotification = (data: NotificationData) =>
  pushNotificationManager.sendNotification(data);

export const schedulePetNotifications = (petStats: {
  hunger: number;
  energy: number;
  happiness: number;
  level: number;
}) => pushNotificationManager.schedulePetNotifications(petStats);

export const sendLevelUpNotification = (level: number) =>
  pushNotificationManager.sendLevelUpNotification(level);

export const sendEvolutionNotification = (stage: string) =>
  pushNotificationManager.sendEvolutionNotification(stage);

export const updateNotificationConfig = (
  updates: Partial<PetNotificationConfig>
) => pushNotificationManager.updateConfig(updates);

export const getNotificationConfig = () => pushNotificationManager.getConfig();

/**
 * イベントリスナーを追加
 */
export const addEventListener = (listener: EventListener): void => {
  eventListeners.push(listener);
};

/**
 * イベントリスナーを削除
 */
export const removeEventListener = (listener: EventListener): void => {
  const index = eventListeners.indexOf(listener);
  if (index > -1) {
    eventListeners.splice(index, 1);
  }
};
