/**
 * シェアパネルコンポーネント
 * スクリーンショット撮影とSNSシェアボタンを提供
 */

import React, { useState } from 'react';
import { useShare } from '../hooks/useShare';
import type { StatsCardData } from '../types/Share';
import './SharePanel.css';

interface SharePanelProps {
  /** パネルの表示状態 */
  isOpen: boolean;
  /** パネルを閉じるコールバック */
  onClose: () => void;
  /** キャプチャ対象の要素参照 */
  captureTargetRef: React.RefObject<HTMLElement | null>;
  /** ペットの統計データ（オプション） */
  statsData?: StatsCardData;
}

export const SharePanel: React.FC<SharePanelProps> = ({
  isOpen,
  onClose,
  captureTargetRef,
  statsData
}) => {
  const {
    captureScreenshot,
    shareToSocial,
    downloadImage,
    generateShareData,
    generateStatsCard,
    isSharing,
    error,
    lastShareImageUrl,
    clearError
  } = useShare();
  
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [shareMode, setShareMode] = useState<'screenshot' | 'stats'>('screenshot');

  /**
   * スクリーンショット撮影
   */
  const handleCaptureScreenshot = async () => {
    if (!captureTargetRef.current) {
      return;
    }

    try {
      clearError();
      const imageUrl = await captureScreenshot(captureTargetRef.current, {
        width: 1080,
        height: 1080,
        showWatermark: true
      });
      setShareImageUrl(imageUrl);
      setShareMode('screenshot');
    } catch (error) {
      console.error('スクリーンショット撮影に失敗しました:', error);
    }
  };

  /**
   * 統計カード生成
   */
  const handleGenerateStatsCard = async () => {
    if (!statsData) {
      return;
    }

    try {
      clearError();
      const imageUrl = await generateStatsCard(statsData, {
        watermark: { text: 'AI Pet Buddy' },
        screenshot: { width: 1080, height: 1080 }
      });
      setShareImageUrl(imageUrl);
      setShareMode('stats');
    } catch (error) {
      console.error('統計カード生成に失敗しました:', error);
    }
  };

  /**
   * SNSシェア
   */
  const handleShare = async (platform: 'twitter' | 'facebook' | 'instagram' | 'line') => {
    const imageUrl = shareImageUrl || lastShareImageUrl;
    if (!imageUrl) {
      return;
    }

    try {
      clearError();
      const shareData = generateShareData(imageUrl, shareMode === 'stats' ? statsData : undefined);
      
      const result = await shareToSocial({
        platform,
        shareData,
        url: window.location.href
      });

      if (result.success) {
        console.log('シェア成功:', result.shareUrl);
      }
    } catch (error) {
      console.error('シェアに失敗しました:', error);
    }
  };

  /**
   * 画像ダウンロード
   */
  const handleDownload = () => {
    const imageUrl = shareImageUrl || lastShareImageUrl;
    if (!imageUrl) {
      return;
    }

    const filename = shareMode === 'stats' 
      ? `pet-stats-${Date.now()}.png`
      : `pet-screenshot-${Date.now()}.png`;
    
    downloadImage(imageUrl, filename);
  };

  /**
   * パネルを閉じる
   */
  const handleClose = () => {
    setShareImageUrl(null);
    clearError();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="share-panel-overlay" onClick={handleClose}>
      <div className="share-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="シェア">
        <div className="share-panel__header">
          <h2 className="share-panel__title">シェア</h2>
          <button 
            className="share-panel__close"
            onClick={handleClose}
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        <div className="share-panel__content">
          {/* キャプチャボタン */}
          <div className="share-panel__capture">
            <button
              className="share-button share-button--capture"
              onClick={handleCaptureScreenshot}
              disabled={isSharing || !captureTargetRef.current}
            >
              📷 スクリーンショット
            </button>
            
            {statsData && (
              <button
                className="share-button share-button--stats"
                onClick={handleGenerateStatsCard}
                disabled={isSharing}
              >
                📊 統計カード
              </button>
            )}
          </div>

          {/* プレビュー */}
          {(shareImageUrl || lastShareImageUrl) && (
            <div className="share-panel__preview">
              <img
                src={shareImageUrl || lastShareImageUrl!}
                alt="シェア画像プレビュー"
                className="share-preview__image"
              />
            </div>
          )}

          {/* エラー表示 */}
          {error && (
            <div className="share-panel__error">
              <p className="error-message">{error}</p>
              <button onClick={clearError} className="error-dismiss">
                ✕
              </button>
            </div>
          )}

          {/* シェアボタン群 */}
          {(shareImageUrl || lastShareImageUrl) && (
            <div className="share-panel__actions">
              <div className="share-buttons">
                <button
                  className="share-button share-button--twitter"
                  onClick={() => handleShare('twitter')}
                  disabled={isSharing}
                >
                  🐦 Twitter
                </button>
                
                <button
                  className="share-button share-button--facebook"
                  onClick={() => handleShare('facebook')}
                  disabled={isSharing}
                >
                  📘 Facebook
                </button>
                
                <button
                  className="share-button share-button--instagram"
                  onClick={() => handleShare('instagram')}
                  disabled={isSharing}
                >
                  📷 Instagram
                </button>
                
                <button
                  className="share-button share-button--line"
                  onClick={() => handleShare('line')}
                  disabled={isSharing}
                >
                  💚 LINE
                </button>
              </div>

              <button
                className="share-button share-button--download"
                onClick={handleDownload}
                disabled={isSharing}
              >
                💾 ダウンロード
              </button>
            </div>
          )}

          {/* ローディング表示 */}
          {isSharing && (
            <div className="share-panel__loading">
              <div className="loading-spinner"></div>
              <p>処理中...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};