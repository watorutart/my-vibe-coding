/**
 * @file UpdateNotification.tsx
 * @description PWA更新通知コンポーネント
 * 
 * 新しいバージョンのPWAが利用可能になった際に
 * ユーザーに更新を促すUIを提供します。
 */

import React, { useState, useEffect } from 'react';
import type { ServiceWorkerUpdateInfo } from '../types/PWA';
import './UpdateNotification.css';

interface UpdateNotificationProps {
  /** 更新が利用可能か */
  hasUpdate: boolean;
  /** 更新情報 */
  updateInfo?: ServiceWorkerUpdateInfo | null;
  /** 更新実行のコールバック */
  onUpdate: () => Promise<boolean>;
  /** 更新を延期するコールバック */
  onDefer?: () => void;
  /** 更新を無視するコールバック */
  onIgnore?: () => void;
  /** 追加のCSSクラス名 */
  className?: string;
}

/**
 * PWA更新通知コンポーネント
 */
export const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  hasUpdate,
  updateInfo,
  onUpdate,
  onDefer,
  onIgnore,
  className = ''
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  /**
   * 更新サイズを人間が読みやすい形式に変換
   */
  const formatSize = (sizeKB: number): string => {
    if (sizeKB < 1024) {
      return `${sizeKB} KB`;
    } else {
      return `${(sizeKB / 1024).toFixed(1)} MB`;
    }
  };

  /**
   * 更新を実行
   */
  const handleUpdate = async () => {
    setIsUpdating(true);
    setUpdateProgress(0);
    
    try {
      // プログレスアニメーション
      const progressTimer = setInterval(() => {
        setUpdateProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressTimer);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      const success = await onUpdate();
      
      clearInterval(progressTimer);
      setUpdateProgress(100);
      
      if (success) {
        // 成功時は少し待ってからリロード
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setIsUpdating(false);
        setUpdateProgress(0);
      }
      
    } catch (error) {
      console.error('[UpdateNotification] Update failed:', error);
      setIsUpdating(false);
      setUpdateProgress(0);
    }
  };

  /**
   * 更新を延期
   */
  const handleDefer = () => {
    if (onDefer) {
      onDefer();
    }
  };

  /**
   * 更新を無視
   */
  const handleIgnore = () => {
    if (onIgnore) {
      onIgnore();
    }
  };

  /**
   * 詳細表示の切り替え
   */
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  // 表示アニメーション
  useEffect(() => {
    if (hasUpdate) {
      const timer = setTimeout(() => {
        setShowAnimation(true);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
    }
  }, [hasUpdate]);

  // 更新がない場合は何も表示しない
  if (!hasUpdate) {
    return null;
  }

  return (
    <div className={`update-notification ${showAnimation ? 'update-notification--visible' : ''} ${className}`}>
      <div className="update-notification__content">
        {/* メインコンテンツ */}
        <div className="update-notification__main">
          <div className="update-notification__icon">
            {isUpdating ? '🔄' : '🚀'}
          </div>
          
          <div className="update-notification__text">
            <div className="update-notification__title">
              {isUpdating ? 'アップデート中...' : '新しいバージョンが利用可能です'}
            </div>
            <div className="update-notification__subtitle">
              {isUpdating 
                ? `更新を適用しています (${updateProgress}%)`
                : 'より良い体験のために最新版に更新しませんか？'
              }
            </div>
          </div>
          
          <div className="update-notification__actions">
            {!isUpdating ? (
              <>
                <button
                  className="update-notification__button update-notification__button--primary"
                  onClick={handleUpdate}
                >
                  今すぐ更新
                </button>
                
                {(onDefer || onIgnore) && (
                  <button
                    className="update-notification__details-toggle"
                    onClick={toggleDetails}
                    aria-label="詳細を表示"
                  >
                    <span className={`update-notification__chevron ${showDetails ? 'update-notification__chevron--up' : ''}`}>
                      ⋯
                    </span>
                  </button>
                )}
              </>
            ) : (
              <div className="update-notification__progress">
                <div 
                  className="update-notification__progress-bar"
                  style={{ width: `${updateProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* 詳細情報 */}
        {showDetails && !isUpdating && (
          <div className="update-notification__details">
            {updateInfo && (
              <div className="update-notification__update-info">
                <div className="update-notification__info-item">
                  <strong>現在のバージョン:</strong>
                  <span>{updateInfo.currentVersion}</span>
                </div>
                
                <div className="update-notification__info-item">
                  <strong>新しいバージョン:</strong>
                  <span>{updateInfo.newVersion}</span>
                </div>
                
                {updateInfo.updateSize > 0 && (
                  <div className="update-notification__info-item">
                    <strong>更新サイズ:</strong>
                    <span>{formatSize(updateInfo.updateSize)}</span>
                  </div>
                )}
                
                {updateInfo.description && (
                  <div className="update-notification__description">
                    <strong>更新内容:</strong>
                    <p>{updateInfo.description}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* 更新の利点 */}
            <div className="update-notification__benefits">
              <div className="update-notification__benefits-title">
                更新の利点:
              </div>
              <ul className="update-notification__benefits-list">
                <li>🐛 バグ修正とパフォーマンス向上</li>
                <li>✨ 新機能と改善された体験</li>
                <li>🔒 セキュリティの強化</li>
                <li>🎮 新しいゲーム要素</li>
              </ul>
            </div>
            
            {/* アクションボタン */}
            <div className="update-notification__detail-actions">
              <button
                className="update-notification__button update-notification__button--primary"
                onClick={handleUpdate}
              >
                今すぐ更新
              </button>
              
              {onDefer && (
                <button
                  className="update-notification__button update-notification__button--secondary"
                  onClick={handleDefer}
                >
                  後で更新
                </button>
              )}
              
              {onIgnore && (
                <button
                  className="update-notification__button update-notification__button--text"
                  onClick={handleIgnore}
                >
                  この更新を無視
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* 更新中のオーバーレイ */}
      {isUpdating && (
        <div className="update-notification__overlay">
          <div className="update-notification__loading">
            <div className="update-notification__loading-icon">🔄</div>
            <div className="update-notification__loading-text">
              アプリを最新バージョンに更新中...
            </div>
            <div className="update-notification__loading-subtext">
              このプロセスには少し時間がかかる場合があります
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateNotification;