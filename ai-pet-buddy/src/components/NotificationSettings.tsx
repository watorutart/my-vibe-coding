/**
 * @file NotificationSettings.tsx
 * @description プッシュ通知設定コンポーネント
 *
 * ユーザーがプッシュ通知の設定を管理できるUIを提供します。
 * 通知の有効/無効、閾値、間隔、静音時間などの設定が可能です。
 */

import React, { useState, useEffect } from 'react';
import type { PetNotificationConfig } from '../types/PWA';
import './NotificationSettings.css';

interface NotificationSettingsProps {
  /** 現在の通知設定 */
  config: PetNotificationConfig;
  /** 通知許可状態 */
  permissionGranted: boolean;
  /** 通知がサポートされているか */
  isSupported: boolean;
  /** 設定更新のコールバック */
  onConfigUpdate: (updates: Partial<PetNotificationConfig>) => void;
  /** 許可要求のコールバック */
  onRequestPermission: () => Promise<boolean>;
  /** テスト通知送信のコールバック */
  onSendTest?: () => Promise<boolean>;
  /** パネルを閉じるコールバック */
  onClose?: () => void;
  /** 追加のCSSクラス名 */
  className?: string;
}

/**
 * プッシュ通知設定コンポーネント
 */
export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  config,
  permissionGranted,
  isSupported,
  onConfigUpdate,
  onRequestPermission,
  onSendTest,
  onClose,
  className = '',
}) => {
  const [localConfig, setLocalConfig] = useState<PetNotificationConfig>(config);
  const [isTestSending, setIsTestSending] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'failure' | null>(
    null
  );

  // 設定が外部から変更された場合に同期
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  /**
   * 設定値を更新
   */
  const updateSetting = <K extends keyof PetNotificationConfig>(
    key: K,
    value: PetNotificationConfig[K]
  ) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    onConfigUpdate({ [key]: value });
  };

  /**
   * ネストした設定値を更新
   */
  const updateNestedSetting = <
    K extends keyof PetNotificationConfig,
    NK extends keyof PetNotificationConfig[K],
  >(
    key: K,
    nestedKey: NK,
    value: PetNotificationConfig[K][NK]
  ) => {
    const newNestedValue = { ...localConfig[key], [nestedKey]: value };
    const newConfig = { ...localConfig, [key]: newNestedValue };
    setLocalConfig(newConfig);
    onConfigUpdate({ [key]: newNestedValue });
  };

  /**
   * 通知許可を要求
   */
  const handleRequestPermission = async () => {
    const granted = await onRequestPermission();
    if (granted) {
      updateSetting('enabled', true);
    }
  };

  /**
   * テスト通知を送信
   */
  const handleSendTest = async () => {
    if (!onSendTest) return;

    setIsTestSending(true);
    setTestResult(null);

    try {
      const success = await onSendTest();
      setTestResult(success ? 'success' : 'failure');

      // 3秒後に結果をクリア
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      console.error('[NotificationSettings] Test notification failed:', error);
      setTestResult('failure');
      setTimeout(() => setTestResult(null), 3000);
    } finally {
      setIsTestSending(false);
    }
  };

  /**
   * 時刻文字列を検証
   */
  const isValidTime = (time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  return (
    <div className={`notification-settings ${className}`}>
      {/* ヘッダー */}
      <div className="notification-settings__header">
        <h3 className="notification-settings__title">🔔 通知設定</h3>
        {onClose && (
          <button
            className="notification-settings__close"
            onClick={onClose}
            aria-label="設定を閉じる"
          >
            ×
          </button>
        )}
      </div>

      <div className="notification-settings__content">
        {!isSupported ? (
          /* 通知非対応 */
          <div className="notification-settings__unsupported">
            <div className="notification-settings__icon">❌</div>
            <h4>通知機能がサポートされていません</h4>
            <p>
              お使いのブラウザまたはデバイスでは、プッシュ通知機能がサポートされていません。
            </p>
          </div>
        ) : !permissionGranted ? (
          /* 許可要求 */
          <div className="notification-settings__permission">
            <div className="notification-settings__icon">🔔</div>
            <h4>通知を有効にしますか？</h4>
            <p>ペットの状態やイベントをタイムリーにお知らせします。</p>

            <div className="notification-settings__benefits">
              <div className="notification-settings__benefit">
                <span className="notification-settings__benefit-icon">🍖</span>
                <span>ペットがお腹を空かせた時</span>
              </div>
              <div className="notification-settings__benefit">
                <span className="notification-settings__benefit-icon">😴</span>
                <span>エネルギーが不足した時</span>
              </div>
              <div className="notification-settings__benefit">
                <span className="notification-settings__benefit-icon">🎉</span>
                <span>レベルアップや進化の時</span>
              </div>
            </div>

            <button
              className="notification-settings__enable-button"
              onClick={handleRequestPermission}
            >
              通知を許可する
            </button>
          </div>
        ) : (
          /* 設定パネル */
          <div className="notification-settings__panel">
            {/* 全体の有効/無効 */}
            <div className="notification-settings__section">
              <div className="notification-settings__toggle">
                <label className="notification-settings__toggle-label">
                  <input
                    type="checkbox"
                    checked={localConfig.enabled}
                    onChange={e => updateSetting('enabled', e.target.checked)}
                    className="notification-settings__toggle-input"
                  />
                  <span className="notification-settings__toggle-slider" />
                  <span className="notification-settings__toggle-text">
                    通知を有効にする
                  </span>
                </label>
              </div>
            </div>

            {localConfig.enabled && (
              <>
                {/* ペット状態通知設定 */}
                <div className="notification-settings__section">
                  <h4 className="notification-settings__section-title">
                    ペット状態通知
                  </h4>

                  {/* 空腹度通知 */}
                  <div className="notification-settings__item">
                    <div className="notification-settings__item-header">
                      <label className="notification-settings__toggle">
                        <input
                          type="checkbox"
                          checked={localConfig.hunger.enabled}
                          onChange={e =>
                            updateNestedSetting(
                              'hunger',
                              'enabled',
                              e.target.checked
                            )
                          }
                          className="notification-settings__toggle-input"
                        />
                        <span className="notification-settings__toggle-slider notification-settings__toggle-slider--small" />
                        <span className="notification-settings__toggle-text">
                          🍖 空腹度通知
                        </span>
                      </label>
                    </div>

                    {localConfig.hunger.enabled && (
                      <div className="notification-settings__item-controls">
                        <div className="notification-settings__control">
                          <label className="notification-settings__label">
                            通知する閾値: {localConfig.hunger.threshold}%
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="80"
                            step="5"
                            value={localConfig.hunger.threshold}
                            onChange={e =>
                              updateNestedSetting(
                                'hunger',
                                'threshold',
                                Number(e.target.value)
                              )
                            }
                            className="notification-settings__slider"
                          />
                        </div>

                        <div className="notification-settings__control">
                          <label className="notification-settings__label">
                            通知間隔: {localConfig.hunger.interval}分
                          </label>
                          <select
                            value={localConfig.hunger.interval}
                            onChange={e =>
                              updateNestedSetting(
                                'hunger',
                                'interval',
                                Number(e.target.value)
                              )
                            }
                            className="notification-settings__select"
                          >
                            <option value={15}>15分</option>
                            <option value={30}>30分</option>
                            <option value={60}>1時間</option>
                            <option value={120}>2時間</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* エネルギー通知 */}
                  <div className="notification-settings__item">
                    <div className="notification-settings__item-header">
                      <label className="notification-settings__toggle">
                        <input
                          type="checkbox"
                          checked={localConfig.energy.enabled}
                          onChange={e =>
                            updateNestedSetting(
                              'energy',
                              'enabled',
                              e.target.checked
                            )
                          }
                          className="notification-settings__toggle-input"
                        />
                        <span className="notification-settings__toggle-slider notification-settings__toggle-slider--small" />
                        <span className="notification-settings__toggle-text">
                          ⚡ エネルギー通知
                        </span>
                      </label>
                    </div>

                    {localConfig.energy.enabled && (
                      <div className="notification-settings__item-controls">
                        <div className="notification-settings__control">
                          <label className="notification-settings__label">
                            通知する閾値: {localConfig.energy.threshold}%
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="50"
                            step="5"
                            value={localConfig.energy.threshold}
                            onChange={e =>
                              updateNestedSetting(
                                'energy',
                                'threshold',
                                Number(e.target.value)
                              )
                            }
                            className="notification-settings__slider"
                          />
                        </div>

                        <div className="notification-settings__control">
                          <label className="notification-settings__label">
                            通知間隔: {localConfig.energy.interval}分
                          </label>
                          <select
                            value={localConfig.energy.interval}
                            onChange={e =>
                              updateNestedSetting(
                                'energy',
                                'interval',
                                Number(e.target.value)
                              )
                            }
                            className="notification-settings__select"
                          >
                            <option value={30}>30分</option>
                            <option value={60}>1時間</option>
                            <option value={120}>2時間</option>
                            <option value={240}>4時間</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 幸福度通知 */}
                  <div className="notification-settings__item">
                    <div className="notification-settings__item-header">
                      <label className="notification-settings__toggle">
                        <input
                          type="checkbox"
                          checked={localConfig.happiness.enabled}
                          onChange={e =>
                            updateNestedSetting(
                              'happiness',
                              'enabled',
                              e.target.checked
                            )
                          }
                          className="notification-settings__toggle-input"
                        />
                        <span className="notification-settings__toggle-slider notification-settings__toggle-slider--small" />
                        <span className="notification-settings__toggle-text">
                          😊 幸福度通知
                        </span>
                      </label>
                    </div>

                    {localConfig.happiness.enabled && (
                      <div className="notification-settings__item-controls">
                        <div className="notification-settings__control">
                          <label className="notification-settings__label">
                            通知する閾値: {localConfig.happiness.threshold}%
                          </label>
                          <input
                            type="range"
                            min="20"
                            max="70"
                            step="5"
                            value={localConfig.happiness.threshold}
                            onChange={e =>
                              updateNestedSetting(
                                'happiness',
                                'threshold',
                                Number(e.target.value)
                              )
                            }
                            className="notification-settings__slider"
                          />
                        </div>

                        <div className="notification-settings__control">
                          <label className="notification-settings__label">
                            通知間隔: {localConfig.happiness.interval}分
                          </label>
                          <select
                            value={localConfig.happiness.interval}
                            onChange={e =>
                              updateNestedSetting(
                                'happiness',
                                'interval',
                                Number(e.target.value)
                              )
                            }
                            className="notification-settings__select"
                          >
                            <option value={30}>30分</option>
                            <option value={45}>45分</option>
                            <option value={60}>1時間</option>
                            <option value={120}>2時間</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* イベント通知設定 */}
                <div className="notification-settings__section">
                  <h4 className="notification-settings__section-title">
                    イベント通知
                  </h4>

                  <div className="notification-settings__item">
                    <label className="notification-settings__toggle">
                      <input
                        type="checkbox"
                        checked={localConfig.levelUp.enabled}
                        onChange={e =>
                          updateNestedSetting(
                            'levelUp',
                            'enabled',
                            e.target.checked
                          )
                        }
                        className="notification-settings__toggle-input"
                      />
                      <span className="notification-settings__toggle-slider notification-settings__toggle-slider--small" />
                      <span className="notification-settings__toggle-text">
                        🎉 レベルアップ通知
                      </span>
                    </label>
                  </div>

                  <div className="notification-settings__item">
                    <label className="notification-settings__toggle">
                      <input
                        type="checkbox"
                        checked={localConfig.evolution.enabled}
                        onChange={e =>
                          updateNestedSetting(
                            'evolution',
                            'enabled',
                            e.target.checked
                          )
                        }
                        className="notification-settings__toggle-input"
                      />
                      <span className="notification-settings__toggle-slider notification-settings__toggle-slider--small" />
                      <span className="notification-settings__toggle-text">
                        ✨ 進化通知
                      </span>
                    </label>
                  </div>
                </div>

                {/* 静音時間設定 */}
                <div className="notification-settings__section">
                  <h4 className="notification-settings__section-title">
                    静音時間
                  </h4>

                  <div className="notification-settings__item">
                    <div className="notification-settings__item-header">
                      <label className="notification-settings__toggle">
                        <input
                          type="checkbox"
                          checked={localConfig.quietHours.enabled}
                          onChange={e =>
                            updateNestedSetting(
                              'quietHours',
                              'enabled',
                              e.target.checked
                            )
                          }
                          className="notification-settings__toggle-input"
                        />
                        <span className="notification-settings__toggle-slider notification-settings__toggle-slider--small" />
                        <span className="notification-settings__toggle-text">
                          🌙 静音時間を設定
                        </span>
                      </label>
                    </div>

                    {localConfig.quietHours.enabled && (
                      <div className="notification-settings__item-controls">
                        <div className="notification-settings__time-range">
                          <div className="notification-settings__control">
                            <label className="notification-settings__label">
                              開始時刻
                            </label>
                            <input
                              type="time"
                              value={localConfig.quietHours.start}
                              onChange={e => {
                                if (isValidTime(e.target.value)) {
                                  updateNestedSetting(
                                    'quietHours',
                                    'start',
                                    e.target.value
                                  );
                                }
                              }}
                              className="notification-settings__time-input"
                            />
                          </div>

                          <div className="notification-settings__control">
                            <label className="notification-settings__label">
                              終了時刻
                            </label>
                            <input
                              type="time"
                              value={localConfig.quietHours.end}
                              onChange={e => {
                                if (isValidTime(e.target.value)) {
                                  updateNestedSetting(
                                    'quietHours',
                                    'end',
                                    e.target.value
                                  );
                                }
                              }}
                              className="notification-settings__time-input"
                            />
                          </div>
                        </div>

                        <p className="notification-settings__time-note">
                          この時間帯は通知が送信されません
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* テスト通知 */}
                {onSendTest && (
                  <div className="notification-settings__section">
                    <h4 className="notification-settings__section-title">
                      テスト
                    </h4>

                    <div className="notification-settings__test">
                      <button
                        className="notification-settings__test-button"
                        onClick={handleSendTest}
                        disabled={isTestSending}
                      >
                        {isTestSending ? (
                          <>
                            <span className="notification-settings__spinner" />
                            送信中...
                          </>
                        ) : (
                          'テスト通知を送信'
                        )}
                      </button>

                      {testResult && (
                        <div
                          className={`notification-settings__test-result notification-settings__test-result--${testResult}`}
                        >
                          {testResult === 'success' ? (
                            <>
                              <span className="notification-settings__test-icon">
                                ✅
                              </span>
                              テスト通知を送信しました
                            </>
                          ) : (
                            <>
                              <span className="notification-settings__test-icon">
                                ❌
                              </span>
                              送信に失敗しました
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;
