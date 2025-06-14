/**
 * @file PWAProvider.tsx
 * @description PWA機能統合プロバイダーコンポーネント
 * 
 * アプリ全体のPWA機能を統合管理し、必要なUIコンポーネントを
 * 適切なタイミングで表示します。
 */

import React, { useEffect, useState } from 'react';
import { usePWA } from '../hooks/usePWA';
import { useNotification } from '../hooks/useNotification';
import InstallPrompt from './InstallPrompt';
import OfflineIndicator from './OfflineIndicator';
import UpdateNotification from './UpdateNotification';
import type { Pet } from '../types/Pet';

interface PWAProviderProps {
  /** 子コンポーネント */
  children: React.ReactNode;
  /** 現在のペット状態（通知用） */
  pet?: Pet;
}

/**
 * PWA機能統合プロバイダー
 */
export const PWAProvider: React.FC<PWAProviderProps> = ({
  children,
  pet
}) => {
  // PWA状態管理
  const {
    pwaState,
    updatePWA,
    showInstallPrompt,
    dismissInstallPrompt,
    shouldShowInstallPrompt,
    isOffline,
    hasUpdate,
    platform
  } = usePWA();

  // 通知管理
  const {
    config: notificationConfig,
    permissionState,
    requestPermission,
    updateConfig: updateNotificationConfig,
    sendTestNotification,
    monitorPetStats,
    sendLevelUp,
    sendEvolution
  } = useNotification();

  // UIの表示状態
  const [showInstallUI, setShowInstallUI] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [installPromptDismissed, setInstallPromptDismissed] = useState(false);

  // ペット状態の監視と通知
  useEffect(() => {
    if (pet && notificationConfig.enabled) {
      const petStats = {
        hunger: pet.stats.hunger,
        energy: pet.stats.energy,
        happiness: pet.stats.happiness,
        level: pet.stats.level
      };
      
      monitorPetStats(petStats);
    }
  }, [pet, notificationConfig.enabled, monitorPetStats]);

  // インストールプロンプトの自動表示
  useEffect(() => {
    if (shouldShowInstallPrompt && !installPromptDismissed) {
      // 5秒後にプロンプトを表示（ページ読み込み直後を避ける）
      const timer = setTimeout(() => {
        setShowInstallUI(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [shouldShowInstallPrompt, installPromptDismissed]);

  // レベルアップ通知
  useEffect(() => {
    if (pet) {
      const currentLevel = pet.stats.level;
      const savedLevel = parseInt(localStorage.getItem('ai-pet-buddy-last-level') || '1');
      
      if (currentLevel > savedLevel) {
        sendLevelUp(currentLevel);
        localStorage.setItem('ai-pet-buddy-last-level', currentLevel.toString());
      }
    }
  }, [pet?.stats.level, sendLevelUp]);

  /**
   * インストールプロンプトの処理
   */
  const handleInstallPrompt = async () => {
    try {
      const success = await showInstallPrompt();
      setShowInstallUI(false);
      return success;
    } catch (error) {
      console.error('[PWAProvider] Install prompt failed:', error);
      return false;
    }
  };

  /**
   * インストールプロンプトの拒否処理
   */
  const handleDismissInstallPrompt = (permanent = false) => {
    dismissInstallPrompt(permanent);
    setShowInstallUI(false);
    
    if (permanent) {
      setInstallPromptDismissed(true);
    }
  };

  /**
   * オフライン時の再接続試行
   */
  const handleRetryConnection = async () => {
    // ネットワーク状態を再チェック
    if (navigator.onLine) {
      // オンラインの場合、Service Workerに再接続を通知
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'RETRY_CONNECTION'
        });
      }
    } else {
      // まだオフラインの場合は何もしない
      console.log('[PWAProvider] Still offline, cannot retry connection');
    }
  };

  /**
   * PWA更新の処理
   */
  const handlePWAUpdate = async () => {
    try {
      const success = await updatePWA();
      return success;
    } catch (error) {
      console.error('[PWAProvider] PWA update failed:', error);
      return false;
    }
  };

  return (
    <>
      {children}
      
      {/* オフライン状態インジケーター */}
      <OfflineIndicator
        isOffline={isOffline}
        offlineDuration={pwaState.offline.offlineDuration}
        lastOnline={pwaState.offline.lastOnline}
        hasPendingSync={pwaState.offline.hasPendingSync}
        onRetry={handleRetryConnection}
      />
      
      {/* インストールプロンプト */}
      <InstallPrompt
        isVisible={showInstallUI}
        onInstall={handleInstallPrompt}
        onDismiss={handleDismissInstallPrompt}
        platform={platform}
      />
      
      {/* 更新通知 */}
      <UpdateNotification
        hasUpdate={hasUpdate}
        updateInfo={null} // 更新情報は今回は簡易実装
        onUpdate={handlePWAUpdate}
        onDefer={() => console.log('[PWAProvider] Update deferred')}
        onIgnore={() => console.log('[PWAProvider] Update ignored')}
      />
    </>
  );
};

export default PWAProvider;