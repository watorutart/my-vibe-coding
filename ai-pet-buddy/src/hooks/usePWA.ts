/**
 * @file usePWA.ts
 * @description PWA機能管理のReactフック
 * 
 * Service Worker、インストールプロンプト、オフライン状態などの
 * PWA機能を統合的に管理するフックを提供します。
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  PWAState, 
  InstallPromptState, 
  ServiceWorkerRegistrationState,
  OfflineState,
  PWAEvent
} from '../types/PWA';
import { 
  registerServiceWorker,
  updateServiceWorker,
  getServiceWorkerState,
  addEventListener as addSWEventListener,
  removeEventListener as removeSWEventListener
} from '../utils/serviceWorker';
import { 
  detectPlatform,
  isPWAInstalled,
  canInstallPWA,
  InstallPromptManager,
  PWAMetrics,
  startPWAMonitoring
} from '../utils/pwaUtils';

/**
 * PWA機能管理フック
 */
export const usePWA = () => {
  // PWA状態
  const [pwaState, setPWAState] = useState<PWAState>({
    serviceWorker: {
      isRegistered: false,
      isControlling: false,
      hasUpdate: false,
      error: null
    },
    install: {
      canInstall: false,
      isInstalled: false,
      isPromptShowing: false,
      platform: 'desktop',
      deferredPrompt: null
    },
    notification: {
      permission: 'default',
      isSupported: false,
      isServiceWorkerSupported: false
    },
    offline: {
      isOffline: false,
      lastOnline: null,
      offlineDuration: 0,
      hasPendingSync: false
    },
    cache: {
      size: 0,
      resourceCount: 0,
      lastUpdated: new Date(),
      caches: {
        static: { name: '', size: 0, count: 0 },
        dynamic: { name: '', size: 0, count: 0 },
        data: { name: '', size: 0, count: 0 }
      }
    },
    isSupported: false,
    isActive: false
  });

  // 遅延インストールプロンプト
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  
  // オフライン時間追跡
  const offlineStartTime = useRef<number | null>(null);
  const offlineTimer = useRef<number | null>(null);

  /**
   * PWA状態を初期化
   */
  const initializePWA = useCallback(async () => {
    try {
      console.log('[PWA] Initializing PWA...');
      
      // プラットフォーム検出
      const platform = detectPlatform();
      
      // Service Worker登録
      const swState = await registerServiceWorker();
      
      // インストール状態確認
      const isInstalled = isPWAInstalled();
      const canInstall = canInstallPWA();
      
      // 通知サポート確認
      const notificationSupported = 'Notification' in window;
      const swNotificationSupported = 'serviceWorker' in navigator;
      
      // 初期状態を設定
      setPWAState(prev => ({
        ...prev,
        serviceWorker: swState,
        install: {
          ...prev.install,
          canInstall,
          isInstalled,
          platform
        },
        notification: {
          permission: notificationSupported ? Notification.permission : 'denied',
          isSupported: notificationSupported,
          isServiceWorkerSupported: swNotificationSupported
        },
        isSupported: swState.isRegistered,
        isActive: swState.isRegistered && swState.isControlling
      }));
      
      // PWA監視を開始
      startPWAMonitoring();
      
      // メトリクス記録
      PWAMetrics.record('pwa-initialized', {
        platform,
        isInstalled,
        canInstall,
        serviceWorkerRegistered: swState.isRegistered
      });
      
      console.log('[PWA] PWA initialized successfully');
      
    } catch (error) {
      console.error('[PWA] PWA initialization failed:', error);
      
      setPWAState(prev => ({
        ...prev,
        serviceWorker: {
          ...prev.serviceWorker,
          error: error instanceof Error ? error.message : String(error)
        }
      }));
    }
  }, []);

  /**
   * Service Workerを更新
   */
  const updatePWA = useCallback(async () => {
    try {
      console.log('[PWA] Updating PWA...');
      
      const success = await updateServiceWorker();
      
      if (success) {
        PWAMetrics.record('pwa-updated');
        console.log('[PWA] PWA updated successfully');
      }
      
      return success;
      
    } catch (error) {
      console.error('[PWA] PWA update failed:', error);
      return false;
    }
  }, []);

  /**
   * インストールプロンプトを表示
   */
  const showInstallPrompt = useCallback(async () => {
    if (!deferredPrompt) {
      console.warn('[PWA] No install prompt available');
      return false;
    }

    try {
      console.log('[PWA] Showing install prompt...');
      
      // プロンプト表示を記録
      InstallPromptManager.recordPromptShown();
      
      setPWAState(prev => ({
        ...prev,
        install: { ...prev.install, isPromptShowing: true }
      }));
      
      // プロンプトを表示
      await deferredPrompt.prompt();
      
      // ユーザーの選択を待機
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('[PWA] Install prompt result:', outcome);
      
      // メトリクス記録
      PWAMetrics.record('install-prompt-result', { outcome });
      
      // プロンプトをクリア
      setDeferredPrompt(null);
      
      setPWAState(prev => ({
        ...prev,
        install: { 
          ...prev.install, 
          isPromptShowing: false,
          deferredPrompt: null
        }
      }));
      
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
        return true;
      } else {
        console.log('[PWA] User dismissed the install prompt');
        InstallPromptManager.recordPromptDismissed();
        return false;
      }
      
    } catch (error) {
      console.error('[PWA] Install prompt failed:', error);
      
      setPWAState(prev => ({
        ...prev,
        install: { ...prev.install, isPromptShowing: false }
      }));
      
      return false;
    }
  }, [deferredPrompt]);

  /**
   * インストールプロンプトを拒否
   */
  const dismissInstallPrompt = useCallback((permanent = false) => {
    console.log('[PWA] Install prompt dismissed:', permanent ? 'permanently' : 'temporarily');
    
    InstallPromptManager.recordPromptDismissed(permanent);
    setDeferredPrompt(null);
    
    setPWAState(prev => ({
      ...prev,
      install: { 
        ...prev.install, 
        deferredPrompt: null
      }
    }));
    
    PWAMetrics.record('install-prompt-dismissed', { permanent });
  }, []);

  /**
   * オフライン時間を更新
   */
  const updateOfflineDuration = useCallback(() => {
    if (offlineStartTime.current) {
      const duration = Date.now() - offlineStartTime.current;
      
      setPWAState(prev => ({
        ...prev,
        offline: {
          ...prev.offline,
          offlineDuration: duration
        }
      }));
    }
  }, []);

  /**
   * ネットワーク状態の変更を処理
   */
  const handleNetworkChange = useCallback(() => {
    const isOnline = navigator.onLine;
    
    if (isOnline) {
      // オンラインになった
      if (offlineStartTime.current) {
        const offlineDuration = Date.now() - offlineStartTime.current;
        console.log(`[PWA] Back online after ${offlineDuration}ms`);
        
        PWAMetrics.record('network-restored', { offlineDuration });
        
        // オフライン時間をクリア
        offlineStartTime.current = null;
        if (offlineTimer.current) {
          clearInterval(offlineTimer.current);
          offlineTimer.current = null;
        }
      }
      
      setPWAState(prev => ({
        ...prev,
        offline: {
          ...prev.offline,
          isOffline: false,
          lastOnline: new Date(),
          offlineDuration: 0
        }
      }));
      
    } else {
      // オフラインになった
      console.log('[PWA] Network offline');
      
      offlineStartTime.current = Date.now();
      
      // オフライン時間を定期的に更新
      offlineTimer.current = window.setInterval(updateOfflineDuration, 1000);
      
      setPWAState(prev => ({
        ...prev,
        offline: {
          ...prev.offline,
          isOffline: true
        }
      }));
      
      PWAMetrics.record('network-lost');
    }
  }, [updateOfflineDuration]);

  /**
   * Service Workerイベントを処理
   */
  const handleServiceWorkerEvent = useCallback((event: PWAEvent) => {
    console.log('[PWA] Service Worker event:', event);
    
    switch (event.type) {
      case 'sw-updated':
        setPWAState(prev => ({
          ...prev,
          serviceWorker: {
            ...prev.serviceWorker,
            hasUpdate: true
          }
        }));
        break;
        
      case 'sw-error':
        setPWAState(prev => ({
          ...prev,
          serviceWorker: {
            ...prev.serviceWorker,
            error: event.data?.error as string || 'Unknown error'
          }
        }));
        break;
        
      case 'cache-updated':
        setPWAState(prev => ({
          ...prev,
          cache: {
            ...prev.cache,
            lastUpdated: new Date()
          }
        }));
        break;
    }
  }, []);

  /**
   * インストールプロンプトイベントを処理
   */
  const handleBeforeInstallPrompt = useCallback((e: BeforeInstallPromptEvent) => {
    console.log('[PWA] Install prompt event received');
    
    // デフォルトのプロンプトを防ぐ
    e.preventDefault();
    
    // プロンプトを後で使用するために保存
    setDeferredPrompt(e);
    
    setPWAState(prev => ({
      ...prev,
      install: {
        ...prev.install,
        canInstall: true,
        deferredPrompt: e
      }
    }));
    
    PWAMetrics.record('install-prompt-available');
  }, []);

  /**
   * アプリインストールイベントを処理
   */
  const handleAppInstalled = useCallback(() => {
    console.log('[PWA] App installed');
    
    setDeferredPrompt(null);
    
    setPWAState(prev => ({
      ...prev,
      install: {
        ...prev.install,
        isInstalled: true,
        canInstall: false,
        deferredPrompt: null
      }
    }));
    
    PWAMetrics.record('app-installed');
  }, []);

  // 初期化
  useEffect(() => {
    initializePWA();
  }, [initializePWA]);

  // イベントリスナーの設定
  useEffect(() => {
    // ネットワーク状態監視
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    
    // インストールプロンプト監視
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Service Workerイベント監視
    addSWEventListener(handleServiceWorkerEvent);
    
    // 初期ネットワーク状態をチェック
    handleNetworkChange();
    
    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      removeSWEventListener(handleServiceWorkerEvent);
      
      // オフライン時間タイマーをクリア
      if (offlineTimer.current) {
        clearInterval(offlineTimer.current);
      }
    };
  }, [
    handleNetworkChange,
    handleBeforeInstallPrompt,
    handleAppInstalled,
    handleServiceWorkerEvent
  ]);

  return {
    // 状態
    pwaState,
    
    // アクション
    updatePWA,
    showInstallPrompt,
    dismissInstallPrompt,
    
    // 便利な状態プロパティ
    isOffline: pwaState.offline.isOffline,
    isInstalled: pwaState.install.isInstalled,
    canInstall: pwaState.install.canInstall && !!deferredPrompt,
    hasUpdate: pwaState.serviceWorker.hasUpdate,
    isSupported: pwaState.isSupported,
    
    // インストールプロンプト関連
    shouldShowInstallPrompt: InstallPromptManager.shouldShowPrompt() && !!deferredPrompt,
    platform: pwaState.install.platform
  };
};