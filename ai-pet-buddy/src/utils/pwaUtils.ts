/**
 * @file pwaUtils.ts
 * @description PWA関連のユーティリティ関数
 * 
 * PWA機能の検出、プラットフォーム判定、インストール管理などの
 * 汎用的なユーティリティ関数を提供します。
 */

import type { PWACapabilities, InstallPromptState } from '../types/PWA';

// ローカルストレージキー
const STORAGE_KEYS = {
  INSTALL_PROMPT_DISMISSED: 'ai-pet-buddy-install-prompt-dismissed',
  INSTALL_PROMPT_COUNT: 'ai-pet-buddy-install-prompt-count',
  PWA_METRICS: 'ai-pet-buddy-pwa-metrics'
} as const;

/**
 * プラットフォーム検出
 */
export const detectPlatform = (): 'ios' | 'android' | 'desktop' => {
  const ua = navigator.userAgent;
  
  if (/iPad|iPhone|iPod/.test(ua)) {
    return 'ios';
  }
  
  if (/Android/.test(ua)) {
    return 'android';
  }
  
  return 'desktop';
};

/**
 * PWA機能サポート状況を検出
 */
export const detectPWACapabilities = (): PWACapabilities => {
  return {
    serviceWorker: 'serviceWorker' in navigator,
    pushNotifications: 'Notification' in window && 'PushManager' in window,
    installPrompt: 'BeforeInstallPromptEvent' in window,
    backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
    webShare: 'share' in navigator
  };
};

/**
 * PWAがインストール可能かチェック
 */
export const canInstallPWA = (): boolean => {
  const capabilities = detectPWACapabilities();
  return capabilities.serviceWorker && capabilities.installPrompt;
};

/**
 * PWAがすでにインストールされているかチェック
 */
export const isPWAInstalled = (): boolean => {
  // スタンドアロンモードで動作している場合
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // iOS Safari でホーム画面に追加されている場合
  if ('standalone' in window.navigator && (window.navigator as any).standalone) {
    return true;
  }
  
  // Android でインストールされている場合の検出
  if (document.referrer.startsWith('android-app://')) {
    return true;
  }
  
  return false;
};

/**
 * PWAが全画面モードで動作しているかチェック
 */
export const isPWAFullscreen = (): boolean => {
  return window.matchMedia('(display-mode: fullscreen)').matches;
};

/**
 * PWAがスタンドアロンモードで動作しているかチェック
 */
export const isPWAStandalone = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches;
};

/**
 * ネットワーク状態を取得
 */
export const getNetworkState = (): {
  isOnline: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
} => {
  const baseState = {
    isOnline: navigator.onLine
  };
  
  // Network Information API が利用可能な場合
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      ...baseState,
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt
    };
  }
  
  return baseState;
};

/**
 * デバイス情報を取得
 */
export const getDeviceInfo = (): {
  platform: string;
  userAgent: string;
  viewport: { width: number; height: number };
  pixelRatio: number;
  touchSupport: boolean;
} => {
  return {
    platform: detectPlatform(),
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    pixelRatio: window.devicePixelRatio || 1,
    touchSupport: 'ontouchstart' in window
  };
};

/**
 * Safe Area Insets を取得（iOS対応）
 */
export const getSafeAreaInsets = (): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} => {
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseFloat(style.getPropertyValue('env(safe-area-inset-top)')) || 0,
    right: parseFloat(style.getPropertyValue('env(safe-area-inset-right)')) || 0,
    bottom: parseFloat(style.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
    left: parseFloat(style.getPropertyValue('env(safe-area-inset-left)')) || 0
  };
};

/**
 * インストールプロンプトの表示履歴を管理
 */
export class InstallPromptManager {
  private static readonly MAX_PROMPTS_PER_DAY = 3;
  private static readonly PROMPT_COOLDOWN = 24 * 60 * 60 * 1000; // 24時間
  
  /**
   * インストールプロンプトを表示すべきかチェック
   */
  static shouldShowPrompt(): boolean {
    try {
      // PWAがすでにインストールされている場合はスキップ
      if (isPWAInstalled()) {
        return false;
      }
      
      // プロンプトが永続的に拒否されている場合はスキップ
      if (this.isPromptDismissed()) {
        return false;
      }
      
      // 1日の表示制限をチェック
      const todayCount = this.getTodayPromptCount();
      if (todayCount >= this.MAX_PROMPTS_PER_DAY) {
        return false;
      }
      
      // 最後の表示からのクールダウンをチェック
      const lastShown = this.getLastPromptTime();
      if (lastShown && (Date.now() - lastShown.getTime()) < this.PROMPT_COOLDOWN) {
        return false;
      }
      
      return true;
      
    } catch (error) {
      console.error('[PWA] Error checking prompt eligibility:', error);
      return false;
    }
  }
  
  /**
   * プロンプト表示回数を記録
   */
  static recordPromptShown(): void {
    try {
      const today = new Date().toDateString();
      const stored = localStorage.getItem(STORAGE_KEYS.INSTALL_PROMPT_COUNT);
      const data = stored ? JSON.parse(stored) : {};
      
      data[today] = (data[today] || 0) + 1;
      data.lastShown = new Date().toISOString();
      
      // 古いデータを削除（過去7日分のみ保持）
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      
      Object.keys(data).forEach(key => {
        if (key !== 'lastShown' && new Date(key) < cutoff) {
          delete data[key];
        }
      });
      
      localStorage.setItem(STORAGE_KEYS.INSTALL_PROMPT_COUNT, JSON.stringify(data));
      
    } catch (error) {
      console.error('[PWA] Error recording prompt:', error);
    }
  }
  
  /**
   * プロンプトが拒否されたことを記録
   */
  static recordPromptDismissed(permanent = false): void {
    try {
      const data = {
        dismissed: true,
        permanent,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEYS.INSTALL_PROMPT_DISMISSED, JSON.stringify(data));
      
    } catch (error) {
      console.error('[PWA] Error recording dismissal:', error);
    }
  }
  
  /**
   * プロンプト拒否状態をリセット
   */
  static resetPromptDismissal(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.INSTALL_PROMPT_DISMISSED);
    } catch (error) {
      console.error('[PWA] Error resetting dismissal:', error);
    }
  }
  
  /**
   * 今日のプロンプト表示回数を取得
   */
  private static getTodayPromptCount(): number {
    try {
      const today = new Date().toDateString();
      const stored = localStorage.getItem(STORAGE_KEYS.INSTALL_PROMPT_COUNT);
      const data = stored ? JSON.parse(stored) : {};
      
      return data[today] || 0;
      
    } catch (error) {
      console.error('[PWA] Error getting prompt count:', error);
      return 0;
    }
  }
  
  /**
   * 最後のプロンプト表示時刻を取得
   */
  private static getLastPromptTime(): Date | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INSTALL_PROMPT_COUNT);
      const data = stored ? JSON.parse(stored) : {};
      
      return data.lastShown ? new Date(data.lastShown) : null;
      
    } catch (error) {
      console.error('[PWA] Error getting last prompt time:', error);
      return null;
    }
  }
  
  /**
   * プロンプトが拒否されているかチェック
   */
  private static isPromptDismissed(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INSTALL_PROMPT_DISMISSED);
      if (!stored) return false;
      
      const data = JSON.parse(stored);
      
      // 永続的に拒否された場合
      if (data.permanent) {
        return true;
      }
      
      // 一時的な拒否の場合、7日経過したらリセット
      const dismissedAt = new Date(data.timestamp);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (dismissedAt < sevenDaysAgo) {
        this.resetPromptDismissal();
        return false;
      }
      
      return true;
      
    } catch (error) {
      console.error('[PWA] Error checking dismissal status:', error);
      return false;
    }
  }
}

/**
 * PWAメトリクス管理
 */
export class PWAMetrics {
  /**
   * メトリクスデータを記録
   */
  static record(event: string, data?: Record<string, unknown>): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PWA_METRICS);
      const metrics = stored ? JSON.parse(stored) : { events: [] };
      
      const eventData = {
        event,
        data,
        timestamp: new Date().toISOString(),
        session: this.getSessionId()
      };
      
      metrics.events.push(eventData);
      
      // 最大1000件まで保持
      if (metrics.events.length > 1000) {
        metrics.events = metrics.events.slice(-1000);
      }
      
      localStorage.setItem(STORAGE_KEYS.PWA_METRICS, JSON.stringify(metrics));
      
    } catch (error) {
      console.error('[PWA] Error recording metrics:', error);
    }
  }
  
  /**
   * メトリクスデータを取得
   */
  static getMetrics(): Array<{
    event: string;
    data?: Record<string, unknown>;
    timestamp: string;
    session: string;
  }> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PWA_METRICS);
      const metrics = stored ? JSON.parse(stored) : { events: [] };
      
      return metrics.events;
      
    } catch (error) {
      console.error('[PWA] Error getting metrics:', error);
      return [];
    }
  }
  
  /**
   * セッションIDを生成/取得
   */
  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('pwa-session-id');
    
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('pwa-session-id', sessionId);
    }
    
    return sessionId;
  }
}

/**
 * PWA状態の監視を開始
 */
export const startPWAMonitoring = (): void => {
  // オンライン/オフライン状態の監視
  window.addEventListener('online', () => {
    PWAMetrics.record('network-online');
    console.log('[PWA] Network online');
  });
  
  window.addEventListener('offline', () => {
    PWAMetrics.record('network-offline');
    console.log('[PWA] Network offline');
  });
  
  // 表示モード変更の監視
  window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
    PWAMetrics.record('display-mode-changed', { standalone: e.matches });
    console.log('[PWA] Display mode changed:', e.matches ? 'standalone' : 'browser');
  });
  
  // ビューポート変更の監視
  window.addEventListener('resize', () => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    PWAMetrics.record('viewport-changed', viewport);
  });
  
  // ページの表示状態変更の監視
  document.addEventListener('visibilitychange', () => {
    PWAMetrics.record('visibility-changed', { 
      hidden: document.hidden 
    });
  });
  
  console.log('[PWA] Monitoring started');
};

/**
 * PWA機能の利用可能性をチェック
 */
export const checkPWAAvailability = (): {
  isSupported: boolean;
  missingFeatures: string[];
  recommendations: string[];
} => {
  const capabilities = detectPWACapabilities();
  const missingFeatures: string[] = [];
  const recommendations: string[] = [];
  
  if (!capabilities.serviceWorker) {
    missingFeatures.push('Service Worker');
    recommendations.push('ブラウザを最新版に更新してください');
  }
  
  if (!capabilities.pushNotifications) {
    missingFeatures.push('Push Notifications');
    recommendations.push('通知機能はご利用いただけません');
  }
  
  if (!capabilities.installPrompt) {
    missingFeatures.push('Install Prompt');
    recommendations.push('ホーム画面への追加は手動で行ってください');
  }
  
  const isSupported = capabilities.serviceWorker; // 最低限の要件
  
  return {
    isSupported,
    missingFeatures,
    recommendations
  };
};

/**
 * デバッグ情報を取得
 */
export const getPWADebugInfo = (): Record<string, unknown> => {
  const capabilities = detectPWACapabilities();
  const deviceInfo = getDeviceInfo();
  const networkState = getNetworkState();
  const safeAreaInsets = getSafeAreaInsets();
  
  return {
    timestamp: new Date().toISOString(),
    capabilities,
    deviceInfo,
    networkState,
    safeAreaInsets,
    isPWAInstalled: isPWAInstalled(),
    isPWAStandalone: isPWAStandalone(),
    canInstallPWA: canInstallPWA(),
    installPromptEligible: InstallPromptManager.shouldShowPrompt()
  };
};