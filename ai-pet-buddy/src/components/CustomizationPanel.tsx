/**
 * @file CustomizationPanel.tsx
 * @description ペットカスタマイズパネルのメインコンポーネント
 *
 * タブ形式のUIでペットの名前、色、アクセサリーをカスタマイズできる機能を提供します。
 */

import React, { useState, useEffect } from 'react';
import type { UseCustomizationReturn } from '../hooks/useCustomization';
import './CustomizationPanel.css';

interface CustomizationPanelProps {
  customizationApi: UseCustomizationReturn; // Appから渡されるAPI
  onClose: () => void;
  onApply: () => void; // 適用ボタン用のコールバック
}

type TabType = 'name' | 'color' | 'accessories';

export default function CustomizationPanel({
  customizationApi,
  onClose,
  onApply,
}: CustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('name');
  // tempName と tempColor は customizationApi.previewCustomization から取得するため、ローカルステートは不要になるか、初期化方法を変更
  const [tempName, setTempName] = useState('');
  const [tempColor, setTempColor] = useState('');

  // customizationApi から必要な関数と状態を取得
  const {
    customizationState,
    previewCustomization,
    isPreviewMode,
    isLoading,
    error,
    updateName,
    updateColor,
    addAccessory,
    removeAccessory,
    startPreview,
    // applyPreview, // App側で処理するため、ここでは直接使わない
    cancelPreview,
    resetToDefault,
  } = customizationApi;

  // パネルが開かれたときやプレビューモードが変更されたときに tempName と tempColor を更新
  useEffect(() => {
    if (isPreviewMode) {
      setTempName(previewCustomization.name);
      setTempColor(previewCustomization.color);
    } else {
      // customizationState.current が存在する場合のみ値を設定
      if (customizationState && customizationState.current) {
        setTempName(customizationState.current.name);
        setTempColor(customizationState.current.color);
      }
    }
  }, [isPreviewMode, previewCustomization, customizationState]);

  // タブ変更時の処理
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // プレビュー開始
  const handleStartPreview = () => {
    startPreview();
    // useEffect で tempName, tempColor が更新される
  };

  // 名前変更
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setTempName(newName); // UI即時反映のためローカルも更新
    updateName(newName); // プレビュー状態を更新 (フック側で isPreviewMode を考慮)
  };

  // 色変更
  const handleColorChange = (colorValue: string) => {
    setTempColor(colorValue); // UI即時反映のためローカルも更新
    updateColor(colorValue); // プレビュー状態を更新 (フック側で isPreviewMode を考慮)
  };

  // アクセサリー装着/解除
  const handleAccessoryToggle = (accessoryId: string) => {
    const isWearing = previewCustomization.accessories.some(
      acc => acc.id === accessoryId
    );

    if (isWearing) {
      removeAccessory(accessoryId);
    } else {
      addAccessory(accessoryId);
    }
  };

  // 適用ボタンの処理 (props経由でApp.tsxの関数を呼び出す)
  const handleApply = () => {
    onApply();
  };

  // キャンセル
  const handleCancel = () => {
    cancelPreview(); // プレビューモードだった場合はキャンセル
    onClose();
  };

  // リセット
  const handleReset = () => {
    resetToDefault();
    // useEffect で tempName, tempColor が更新される
  };

  // カラーパレット
  const colorPalette = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FECA57',
    '#FF9FF3',
    '#A55EEA',
    '#FD79A8',
  ];

  const renderNameTab = () => (
    <div className="tab-content">
      <h3>ペット名の変更</h3>
      <div className="name-editor">
        <label htmlFor="pet-name">ペット名:</label>
        <input
          id="pet-name"
          type="text"
          value={isPreviewMode ? previewCustomization.name : tempName} // プレビュー中はフックの値を、それ以外はローカルの値を表示
          onChange={handleNameChange}
          maxLength={20}
          placeholder="ペットの名前を入力..."
          className={error && error.includes('名前') ? 'error' : ''}
        />
        <div className="character-count">{tempName.length}/20文字</div>
        {error && error.includes('名前') && (
          <div className="error-message">{error}</div>
        )}
      </div>
    </div>
  );

  const renderColorTab = () => (
    <div className="tab-content">
      <h3>色の変更</h3>
      <div className="color-editor">
        <div className="color-preview">
          <div
            className="color-circle"
            style={{
              backgroundColor: isPreviewMode
                ? previewCustomization.color
                : tempColor,
            }} // プレビュー中はフックの値を表示
          />
          <span>現在の色</span>
        </div>

        <div className="color-palette">
          <h4>カラーパレット</h4>
          <div className="palette-grid">
            {colorPalette.map(color => (
              <button
                key={color}
                className={`color-option ${tempColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(color)}
                aria-label={`色を${color}に変更`}
              />
            ))}
          </div>
        </div>

        <div className="custom-color">
          <label htmlFor="custom-color">カスタム色:</label>
          <input
            id="custom-color"
            type="color"
            value={isPreviewMode ? previewCustomization.color : tempColor} // プレビュー中はフックの値を表示
            onChange={e => handleColorChange(e.target.value)}
          />
          <input
            type="text"
            value={isPreviewMode ? previewCustomization.color : tempColor} // プレビュー中はフックの値を表示
            onChange={e => handleColorChange(e.target.value)}
            placeholder="#FF6B6B"
            pattern="#[0-9A-Fa-f]{6}"
            className={error && error.includes('色') ? 'error' : ''}
          />
        </div>

        {error && error.includes('色') && (
          <div className="error-message">{error}</div>
        )}
      </div>
    </div>
  );

  const renderAccessoriesTab = () => {
    // Determine which accessories list to use based on isPreviewMode
    const currentPetAccessories = isPreviewMode
      ? previewCustomization.accessories
      : customizationState.current.accessories;

    return (
      <div className="tab-content">
        <h3>アクセサリー</h3>
        <div className="accessories-grid">
          {customizationState.available.map(accessory => {
            // Use currentPetAccessories to determine if an accessory is being worn
            const isWearing = currentPetAccessories.some(
              acc => acc.id === accessory.id
            );
            const isUnlocked = accessory.unlocked;

            return (
              <div
                key={accessory.id}
                className={`accessory-item ${isWearing ? 'wearing' : ''} ${!isUnlocked ? 'locked' : ''}`}
              >
                <div className="accessory-icon">
                  {getAccessoryIcon(accessory.type)}
                </div>
                <div className="accessory-info">
                  <h4>{accessory.name}</h4>
                  <p className="accessory-type">
                    {getAccessoryTypeText(accessory.type)}
                  </p>
                </div>
                <button
                  className={`accessory-button ${isWearing ? 'remove' : 'add'}`}
                  onClick={() => handleAccessoryToggle(accessory.id)}
                  disabled={!isUnlocked}
                  aria-label={
                    isWearing
                      ? `${accessory.name}を外す`
                      : `${accessory.name}を装着`
                  }
                >
                  {!isUnlocked ? '🔒' : isWearing ? '外す' : '装着'}
                </button>
              </div>
            );
          })}
        </div>

        {error && error.includes('アクセサリー') && (
          <div className="error-message">{error}</div>
        )}
      </div>
    );
  };

  // アクセサリーアイコンを取得
  const getAccessoryIcon = (type: string) => {
    switch (type) {
      case 'hat':
        return '🎩';
      case 'ribbon':
        return '🎀';
      case 'glasses':
        return '👓';
      case 'necklace':
        return '📿';
      default:
        return '✨';
    }
  };

  // アクセサリータイプのテキストを取得
  const getAccessoryTypeText = (type: string) => {
    switch (type) {
      case 'hat':
        return '帽子';
      case 'ribbon':
        return 'リボン';
      case 'glasses':
        return 'メガネ';
      case 'necklace':
        return 'ネックレス';
      default:
        return 'アクセサリー';
    }
  };

  if (isLoading) {
    return (
      <div className="customization-overlay">
        <div className="customization-panel loading">
          <div className="loading-spinner">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="customization-overlay">
      <div className="customization-panel">
        <div className="panel-header">
          <h2>🎨 ペットカスタマイズ</h2>
          <button
            className="close-button"
            onClick={handleCancel}
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        <div className="preview-section">
          <div className="preview-pet">
            <div
              className="pet-preview"
              style={{
                backgroundColor: isPreviewMode
                  ? previewCustomization.color
                  : tempColor,
              }} // プレビュー中はフックの値を表示
            >
              🐾
              {(isPreviewMode
                ? previewCustomization.accessories
                : customizationState.current.accessories
              ).map(accessory => (
                <span key={accessory.id} className="accessory-on-pet">
                  {getAccessoryIcon(accessory.type)}
                </span>
              ))}
            </div>
            <div className="preview-name">
              {isPreviewMode ? previewCustomization.name : tempName}{' '}
              {/* プレビュー中はフックの値を表示 */}
            </div>
          </div>

          {!isPreviewMode && (
            <button className="preview-button" onClick={handleStartPreview}>
              プレビュー開始
            </button>
          )}
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'name' ? 'active' : ''}`}
            onClick={() => handleTabChange('name')}
          >
            名前
          </button>
          <button
            className={`tab ${activeTab === 'color' ? 'active' : ''}`}
            onClick={() => handleTabChange('color')}
          >
            色
          </button>
          <button
            className={`tab ${activeTab === 'accessories' ? 'active' : ''}`}
            onClick={() => handleTabChange('accessories')}
          >
            アクセサリー
          </button>
        </div>

        <div className="tab-content-container">
          {activeTab === 'name' && renderNameTab()}
          {activeTab === 'color' && renderColorTab()}
          {activeTab === 'accessories' && renderAccessoriesTab()}
        </div>

        <div className="panel-footer">
          <div className="button-group">
            <button className="reset-button" onClick={handleReset}>
              リセット
            </button>
            <button className="cancel-button" onClick={handleCancel}>
              キャンセル
            </button>
            <button className="apply-button" onClick={handleApply}>
              適用
            </button>
          </div>
        </div>

        {error &&
          !error.includes('名前') &&
          !error.includes('色') &&
          !error.includes('アクセサリー') && (
            <div className="global-error-message">{error}</div>
          )}
      </div>
    </div>
  );
}
