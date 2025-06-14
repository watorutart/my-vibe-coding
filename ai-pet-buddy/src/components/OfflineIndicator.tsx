/**
 * @file OfflineIndicator.tsx
 * @description オフライン状態表示コンポーネント
 * 
 * ネットワーク切断時にユーザーに状況を知らせるインジケーターを提供します。
 * オフライン継続時間の表示と再接続の試行機能を含みます。
 */

import React, { useState, useEffect } from 'react';
import './OfflineIndicator.css';

interface OfflineIndicatorProps {
  /** オフライン状態か */
  isOffline: boolean;
  /** オフライン継続時間（ミリ秒） */
  offlineDuration: number;
  /** 最後にオンラインだった時刻 */
  lastOnline: Date | null;
  /** 同期待ちのデータがあるか */
  hasPendingSync?: boolean;
  /** 再接続試行のコールバック */
  onRetry?: () => void;
  /** 追加のCSSクラス名 */
  className?: string;
}

/**
 * オフライン状態インジケーターコンポーネント
 */
export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOffline,
  offlineDuration,
  lastOnline,
  hasPendingSync = false,
  onRetry,
  className = ''
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  /**
   * オフライン継続時間を人間が読みやすい形式に変換
   */
  const formatDuration = (duration: number): string => {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}時間${minutes % 60}分`;
    } else if (minutes > 0) {
      return `${minutes}分${seconds % 60}秒`;
    } else {
      return `${seconds}秒`;
    }
  };

  /**
   * 最後のオンライン時刻を人間が読みやすい形式に変換
   */
  const formatLastOnline = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}日前`;
    } else if (diffHours > 0) {
      return `${diffHours}時間前`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}分前`;
    } else {
      return 'たった今';
    }
  };

  /**
   * 再接続を試行
   */
  const handleRetry = async () => {
    if (isRetrying) return;

    setIsRetrying(true);
    
    try {
      // ネットワーク状態をチェック
      if (navigator.onLine) {
        // オンラインになっている場合、ページをリロード
        window.location.reload();
      } else {
        // まだオフラインの場合、コールバックを実行
        if (onRetry) {
          await onRetry();
        }
      }
    } catch (error) {
      console.error('[OfflineIndicator] Retry failed:', error);
    } finally {
      // 3秒後にリトライ状態を解除
      setTimeout(() => setIsRetrying(false), 3000);
    }
  };

  /**
   * 詳細表示の切り替え
   */
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  // オフラインでない場合は何も表示しない
  if (!isOffline) {
    return null;
  }

  return (
    <div className={`offline-indicator ${className}`}>
      {/* メインインジケーター */}
      <div className="offline-indicator__main">
        <div className="offline-indicator__icon">📶</div>
        <div className="offline-indicator__content">
          <div className="offline-indicator__title">
            オフライン
            {hasPendingSync && (
              <span className="offline-indicator__sync-badge">同期待ち</span>
            )}
          </div>
          <div className="offline-indicator__subtitle">
            インターネット接続を確認してください
          </div>
        </div>
        
        <div className="offline-indicator__actions">
          <button
            className="offline-indicator__retry-button"
            onClick={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <span className="offline-indicator__spinner" />
                確認中...
              </>
            ) : (
              '再接続'
            )}
          </button>
          
          <button
            className="offline-indicator__details-button"
            onClick={toggleDetails}
            aria-label="詳細を表示"
          >
            <span className={`offline-indicator__chevron ${showDetails ? 'offline-indicator__chevron--up' : ''}`}>
              ▼
            </span>
          </button>
        </div>
      </div>

      {/* 詳細情報 */}
      {showDetails && (
        <div className="offline-indicator__details">
          <div className="offline-indicator__detail-item">
            <strong>オフライン時間:</strong>
            <span>{formatDuration(offlineDuration)}</span>
          </div>
          
          {lastOnline && (
            <div className="offline-indicator__detail-item">
              <strong>最後の接続:</strong>
              <span>{formatLastOnline(lastOnline)}</span>
            </div>
          )}
          
          <div className="offline-indicator__detail-item">
            <strong>状態:</strong>
            <span className={`offline-indicator__status ${hasPendingSync ? 'offline-indicator__status--warning' : 'offline-indicator__status--offline'}`}>
              {hasPendingSync ? '同期待ちのデータがあります' : 'ローカルモードで動作中'}
            </span>
          </div>
          
          {/* オフライン機能の説明 */}
          <div className="offline-indicator__offline-features">
            <div className="offline-indicator__feature-title">オフラインでも利用可能:</div>
            <ul className="offline-indicator__feature-list">
              <li>ペットとの基本的な交流</li>
              <li>ローカルデータの閲覧</li>
              <li>設定の変更</li>
              <li>ゲームの一部機能</li>
            </ul>
          </div>
          
          {hasPendingSync && (
            <div className="offline-indicator__sync-info">
              <div className="offline-indicator__sync-title">
                <span className="offline-indicator__sync-icon">🔄</span>
                同期について
              </div>
              <p className="offline-indicator__sync-description">
                接続が復旧すると、オフライン中に行った変更が自動的に同期されます。
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* プログレスバー（オフライン時間の視覚化） */}
      <div className="offline-indicator__progress">
        <div 
          className="offline-indicator__progress-bar"
          style={{
            width: `${Math.min(100, (offlineDuration / (5 * 60 * 1000)) * 100)}%`
          }}
        />
      </div>
    </div>
  );
};

export default OfflineIndicator;