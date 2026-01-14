/**
 * @file InstallPrompt.tsx
 * @description PWAインストールプロンプトコンポーネント
 *
 * ユーザーにPWAのインストールを促すプロンプトUIを提供します。
 * プラットフォーム別の最適化されたメッセージとアニメーションを含みます。
 */

import React, { useState, useEffect } from 'react';
import './InstallPrompt.css';

interface InstallPromptProps {
  /** プロンプトが表示されているか */
  isVisible: boolean;
  /** インストール実行関数 */
  onInstall: () => Promise<boolean>;
  /** プロンプトを拒否する関数 */
  onDismiss: (permanent?: boolean) => void;
  /** プラットフォーム */
  platform: 'ios' | 'android' | 'desktop';
  /** 追加のCSSクラス名 */
  className?: string;
}

/**
 * PWAインストールプロンプトコンポーネント
 */
export const InstallPrompt: React.FC<InstallPromptProps> = ({
  isVisible,
  onInstall,
  onDismiss,
  platform,
  className = '',
}) => {
  const [isInstalling, setIsInstalling] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  // プラットフォーム別のメッセージとアイコン
  const platformInfo = {
    ios: {
      title: 'ホーム画面に追加',
      message:
        'ペットといつでも遊べるよう、ホーム画面に AI Pet Buddy を追加しませんか？',
      instruction:
        'Safariで画面下部の共有ボタンから「ホーム画面に追加」を選択してください。',
      icon: '📱',
      buttonText: '手順を見る',
    },
    android: {
      title: 'アプリをインストール',
      message:
        'AI Pet Buddy をアプリとしてインストールして、もっと快適に遊びませんか？',
      instruction: 'ワンタップで簡単にインストールできます！',
      icon: '🐾',
      buttonText: 'インストール',
    },
    desktop: {
      title: 'アプリをインストール',
      message:
        'AI Pet Buddy をデスクトップアプリとしてインストールしませんか？',
      instruction:
        'ブラウザから独立したアプリとして、より快適にご利用いただけます。',
      icon: '💻',
      buttonText: 'インストール',
    },
  };

  const info = platformInfo[platform];

  /**
   * インストールボタンクリック処理
   */
  const handleInstall = async () => {
    setIsInstalling(true);

    try {
      const success = await onInstall();

      if (success) {
        setShowAnimation(true);
        // アニメーション後にプロンプトを閉じる
        setTimeout(() => {
          onDismiss();
        }, 2000);
      }
    } catch (error) {
      console.error('[InstallPrompt] Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  /**
   * 拒否ボタンクリック処理
   */
  const handleDismiss = (permanent = false) => {
    onDismiss(permanent);
  };

  // 表示アニメーション
  useEffect(() => {
    if (isVisible) {
      // 少し遅延させてアニメーションを開始
      const timer = setTimeout(() => {
        setShowAnimation(true);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`install-prompt ${showAnimation ? 'install-prompt--visible' : ''} ${className}`}
    >
      <div
        className="install-prompt__backdrop"
        onClick={() => handleDismiss()}
      />

      <div className="install-prompt__content">
        {/* ヘッダー */}
        <div className="install-prompt__header">
          <div className="install-prompt__icon">{info.icon}</div>
          <h3 className="install-prompt__title">{info.title}</h3>
        </div>

        {/* メッセージ */}
        <div className="install-prompt__body">
          <p className="install-prompt__message">{info.message}</p>
          <p className="install-prompt__instruction">{info.instruction}</p>

          {/* 利点リスト */}
          <ul className="install-prompt__benefits">
            <li>
              <span className="install-prompt__benefit-icon">⚡</span>
              高速な起動とスムーズな動作
            </li>
            <li>
              <span className="install-prompt__benefit-icon">📱</span>
              ホーム画面から直接アクセス
            </li>
            <li>
              <span className="install-prompt__benefit-icon">🔔</span>
              ペットの状態をプッシュ通知でお知らせ
            </li>
            {platform !== 'ios' && (
              <li>
                <span className="install-prompt__benefit-icon">📶</span>
                オフラインでも一部機能が利用可能
              </li>
            )}
          </ul>
        </div>

        {/* ボタン */}
        <div className="install-prompt__actions">
          {platform === 'ios' ? (
            // iOSの場合は手順を説明するだけ
            <button
              className="install-prompt__button install-prompt__button--primary"
              onClick={() => handleDismiss()}
            >
              わかりました
            </button>
          ) : (
            // Android/Desktopの場合はインストールボタンを表示
            <>
              <button
                className="install-prompt__button install-prompt__button--primary"
                onClick={handleInstall}
                disabled={isInstalling}
              >
                {isInstalling ? (
                  <>
                    <span className="install-prompt__loading-spinner" />
                    インストール中...
                  </>
                ) : (
                  info.buttonText
                )}
              </button>

              <button
                className="install-prompt__button install-prompt__button--secondary"
                onClick={() => handleDismiss()}
              >
                後で
              </button>
            </>
          )}

          <button
            className="install-prompt__button install-prompt__button--text"
            onClick={() => handleDismiss(true)}
          >
            今後表示しない
          </button>
        </div>

        {/* 閉じるボタン */}
        <button
          className="install-prompt__close"
          onClick={() => handleDismiss()}
          aria-label="プロンプトを閉じる"
        >
          ×
        </button>
      </div>

      {/* 成功アニメーション */}
      {showAnimation && isInstalling === false && (
        <div className="install-prompt__success">
          <div className="install-prompt__success-icon">🎉</div>
          <p className="install-prompt__success-message">
            インストールが完了しました！
          </p>
        </div>
      )}
    </div>
  );
};

export default InstallPrompt;
