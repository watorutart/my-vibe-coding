/**
 * @file serviceWorker.ts
 * @description Service Worker登録・管理ユーティリティ
 * 
 * PWA Service Workerの登録、更新、状態管理機能を提供します。
 */

import type { 
  ServiceWorkerRegistrationState, 
  ServiceWorkerUpdateInfo,
  PWAEvent
} from '../types/PWA';

// Service Worker関連の定数
const SW_URL = '/sw.js';
const SW_SCOPE = '/';
const UPDATE_CHECK_INTERVAL = 60000; // 1分

// Service Worker状態管理
let swRegistration: ServiceWorkerRegistration | null = null;
let updateCheckTimer: number | null = null;

// イベントリスナー管理
type EventListener = (event: PWAEvent) => void;
const eventListeners: EventListener[] = [];

/**
 * Service Workerの登録
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistrationState> => {
  // Service Workerサポートチェック
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW] Service Worker is not supported');
    return {
      isRegistered: false,
      isControlling: false,
      hasUpdate: false,
      error: 'Service Worker is not supported'
    };
  }

  try {
    console.log('[SW] Registering service worker...');
    
    // Service Workerを登録
    const registration = await navigator.serviceWorker.register(SW_URL, {
      scope: SW_SCOPE,
      updateViaCache: 'none' // 常に最新版をチェック
    });

    swRegistration = registration;
    
    // 登録成功イベント
    emitEvent({
      type: 'sw-registered',
      data: { scope: registration.scope },
      timestamp: new Date()
    });

    // イベントリスナーを設定
    setupServiceWorkerListeners(registration);
    
    // 定期的な更新チェックを開始
    startUpdateCheck();
    
    console.log('[SW] Service Worker registered successfully');
    
    return getServiceWorkerState(registration);
    
  } catch (error) {
    console.error('[SW] Service Worker registration failed:', error);
    
    emitEvent({
      type: 'sw-error',
      data: { error: error instanceof Error ? error.message : String(error) },
      timestamp: new Date()
    });
    
    return {
      isRegistered: false,
      isControlling: false,
      hasUpdate: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Service Workerの登録解除
 */
export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (!swRegistration) {
    return true;
  }

  try {
    // 更新チェックタイマーを停止
    stopUpdateCheck();
    
    // Service Workerを登録解除
    const success = await swRegistration.unregister();
    console.log('[SW] Service Worker unregistered:', success);
    
    swRegistration = null;
    return success;
    
  } catch (error) {
    console.error('[SW] Service Worker unregistration failed:', error);
    return false;
  }
};

/**
 * Service Workerの更新
 */
export const updateServiceWorker = async (): Promise<boolean> => {
  if (!swRegistration) {
    console.warn('[SW] No service worker registration found');
    return false;
  }

  try {
    console.log('[SW] Checking for service worker updates...');
    
    // 更新をチェック
    const registration = await swRegistration.update();
    
    // 新しいService Workerがある場合
    if (registration.waiting) {
      console.log('[SW] New service worker is waiting');
      
      // 新しいService Workerをアクティブ化
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      emitEvent({
        type: 'sw-updated',
        data: { hasWaiting: true },
        timestamp: new Date()
      });
      
      return true;
    }
    
    console.log('[SW] No service worker updates available');
    return false;
    
  } catch (error) {
    console.error('[SW] Service Worker update failed:', error);
    
    emitEvent({
      type: 'sw-error',
      data: { error: error instanceof Error ? error.message : String(error) },
      timestamp: new Date()
    });
    
    return false;
  }
};

/**
 * Service Workerの状態を取得
 */
export const getServiceWorkerState = (
  registration?: ServiceWorkerRegistration
): ServiceWorkerRegistrationState => {
  const reg = registration || swRegistration;
  
  if (!reg) {
    return {
      isRegistered: false,
      isControlling: false,
      hasUpdate: false,
      error: null
    };
  }

  return {
    isRegistered: true,
    isControlling: !!navigator.serviceWorker.controller,
    hasUpdate: !!reg.waiting,
    error: null
  };
};

/**
 * Service Workerの更新情報を取得
 */
export const getServiceWorkerUpdateInfo = async (): Promise<ServiceWorkerUpdateInfo | null> => {
  if (!swRegistration || !swRegistration.waiting) {
    return null;
  }

  try {
    // Service Workerからバージョン情報を取得
    const currentVersion = await getServiceWorkerVersion(swRegistration.active);
    const newVersion = await getServiceWorkerVersion(swRegistration.waiting);
    
    return {
      currentVersion: currentVersion || 'unknown',
      newVersion: newVersion || 'unknown',
      updateSize: 0, // 実際のサイズ計算は複雑なので0で代用
      description: 'アプリの新しいバージョンが利用可能です'
    };
    
  } catch (error) {
    console.error('[SW] Failed to get update info:', error);
    return null;
  }
};

/**
 * Service Workerからバージョン情報を取得
 */
const getServiceWorkerVersion = async (
  serviceWorker: ServiceWorker | null
): Promise<string | null> => {
  if (!serviceWorker) {
    return null;
  }

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data?.version || null);
    };
    
    try {
      serviceWorker.postMessage({ type: 'GET_VERSION' }, [messageChannel.port2]);
      
      // タイムアウト処理
      setTimeout(() => resolve(null), 1000);
      
    } catch (error) {
      console.error('[SW] Failed to get version:', error);
      resolve(null);
    }
  });
};

/**
 * Service Workerイベントリスナーの設定
 */
const setupServiceWorkerListeners = (registration: ServiceWorkerRegistration): void => {
  // Service Worker状態変更の監視
  registration.addEventListener('updatefound', () => {
    console.log('[SW] New service worker found');
    
    const newWorker = registration.installing;
    if (!newWorker) return;
    
    newWorker.addEventListener('statechange', () => {
      console.log('[SW] Service worker state changed:', newWorker.state);
      
      if (newWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // 既存のService Workerがある場合は更新
          console.log('[SW] New service worker installed, update available');
          
          emitEvent({
            type: 'sw-updated',
            data: { hasUpdate: true },
            timestamp: new Date()
          });
        } else {
          // 初回インストール
          console.log('[SW] Service worker installed for the first time');
        }
      }
    });
  });
  
  // Controller変更の監視
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[SW] Controller changed, reloading page...');
    window.location.reload();
  });
  
  // メッセージ受信の監視
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('[SW] Message from service worker:', event.data);
    
    if (event.data?.type === 'CACHE_UPDATED') {
      emitEvent({
        type: 'cache-updated',
        data: event.data,
        timestamp: new Date()
      });
    }
  });
};

/**
 * 定期的な更新チェックを開始
 */
const startUpdateCheck = (): void => {
  if (updateCheckTimer) {
    clearInterval(updateCheckTimer);
  }
  
  updateCheckTimer = window.setInterval(async () => {
    try {
      await updateServiceWorker();
    } catch (error) {
      console.error('[SW] Periodic update check failed:', error);
    }
  }, UPDATE_CHECK_INTERVAL);
};

/**
 * 定期的な更新チェックを停止
 */
const stopUpdateCheck = (): void => {
  if (updateCheckTimer) {
    clearInterval(updateCheckTimer);
    updateCheckTimer = null;
  }
};

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

/**
 * イベントを発火
 */
const emitEvent = (event: PWAEvent): void => {
  eventListeners.forEach(listener => {
    try {
      listener(event);
    } catch (error) {
      console.error('[SW] Event listener error:', error);
    }
  });
};

/**
 * Service Workerが利用可能かチェック
 */
export const isServiceWorkerSupported = (): boolean => {
  return 'serviceWorker' in navigator;
};

/**
 * Service Workerが制御中かチェック
 */
export const isServiceWorkerControlling = (): boolean => {
  return !!navigator.serviceWorker.controller;
};

/**
 * Service Workerのキャッシュをクリア
 */
export const clearServiceWorkerCache = async (): Promise<boolean> => {
  if (!swRegistration) {
    return false;
  }

  try {
    // Service Workerにキャッシュクリアを要求
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_CACHE'
      });
    }
    
    // ページをリロードしてキャッシュをクリア
    window.location.reload();
    return true;
    
  } catch (error) {
    console.error('[SW] Failed to clear cache:', error);
    return false;
  }
};

/**
 * 現在のService Worker登録情報を取得
 */
export const getCurrentRegistration = (): ServiceWorkerRegistration | null => {
  return swRegistration;
};

/**
 * Service Workerの統計情報を取得
 */
export const getServiceWorkerStats = async (): Promise<{
  cacheSize: number;
  cacheCount: number;
  registrationTime: number | null;
}> => {
  const stats = {
    cacheSize: 0,
    cacheCount: 0,
    registrationTime: swRegistration?.installing?.scriptURL ? Date.now() : null
  };

  try {
    // キャッシュサイズを取得（利用可能な場合）
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      stats.cacheSize = estimate.usage || 0;
    }
    
    // キャッシュ数を取得
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      stats.cacheCount = cacheNames.length;
    }
    
  } catch (error) {
    console.error('[SW] Failed to get stats:', error);
  }

  return stats;
};