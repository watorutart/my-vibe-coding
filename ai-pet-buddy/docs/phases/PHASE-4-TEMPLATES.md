# 📝 Phase 4 ファイルテンプレート集

## 🎯 GitHub Copilot Coding Agent用テンプレート

このファイルにはPhase 4実装で使用するファイルテンプレートを記載しています。
これらのテンプレートを基に効率的な実装を進めてください。

---

## 🔧 Template 1: Customization.ts

```typescript
/**
 * ペットカスタマイズ関連の型定義
 * 名前変更、色変更、アクセサリー管理の型を提供
 */

export interface PetCustomization {
  /** ペットの名前 (最大20文字) */
  name: string;
  /** ペットの基本色 (HEXコード) */
  color: string;
  /** 装着中のアクセサリーリスト */
  accessories: Accessory[];
  /** カスタマイズの解除状態 */
  unlocked: boolean;
  /** 最終更新日時 */
  lastModified: Date;
}

export interface Accessory {
  /** アクセサリーの一意ID */
  id: string;
  /** アクセサリーの種類 */
  type: 'hat' | 'ribbon' | 'glasses' | 'necklace';
  /** 表示名 */
  name: string;
  /** アクセサリーの色 (オプション) */
  color?: string;
  /** 解除状態 */
  unlocked: boolean;
  /** 取得条件 */
  unlockCondition?: {
    level?: number;
    achievement?: string;
    gameWins?: number;
  };
}

export interface CustomizationState {
  /** 現在適用中のカスタマイズ */
  current: PetCustomization;
  /** 利用可能なアクセサリー */
  availableAccessories: Accessory[];
  /** プリセットテーマ */
  presets: PetCustomization[];
  /** カスタマイズ履歴 */
  history: PetCustomization[];
}

export interface CustomizationPreset {
  /** プリセットID */
  id: string;
  /** プリセット名 */
  name: string;
  /** プリセット説明 */
  description: string;
  /** プリセット設定 */
  customization: PetCustomization;
  /** プリセット画像URL */
  previewImage?: string;
}

// カスタマイズ更新用のアクション型
export type CustomizationAction = 
  | { type: 'UPDATE_NAME'; payload: string }
  | { type: 'UPDATE_COLOR'; payload: string }
  | { type: 'ADD_ACCESSORY'; payload: Accessory }
  | { type: 'REMOVE_ACCESSORY'; payload: string }
  | { type: 'APPLY_PRESET'; payload: string }
  | { type: 'RESET_TO_DEFAULT' };

// カラーパレット定義
export const COLOR_PALETTE = {
  primary: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
  secondary: ['#DDA0DD', '#FFB6C1', '#F0E68C', '#98FB98', '#F4A460'],
  special: ['#FF1493', '#00CED1', '#32CD32', '#FF4500', '#9370DB']
} as const;

export type ColorPalette = typeof COLOR_PALETTE;
```

---

## 🔧 Template 2: useCustomization.ts

```typescript
/**
 * ペットカスタマイズ管理Hook
 * 名前、色、アクセサリーの管理とプレビュー機能を提供
 */

import { useState, useCallback, useEffect } from 'react';
import { PetCustomization, Accessory, CustomizationState, CustomizationAction } from '../types/Customization';
import { loadCustomizationData, saveCustomizationData } from '../utils/customizationUtils';

interface UseCustomizationOptions {
  /** 自動保存を有効にするか */
  autoSave?: boolean;
  /** 自動保存の間隔（ミリ秒） */
  saveInterval?: number;
}

export interface UseCustomizationReturn {
  /** 現在のカスタマイズ状態 */
  customization: CustomizationState;
  /** カスタマイズの更新 */
  updateCustomization: (action: CustomizationAction) => void;
  /** 名前の更新 */
  updateName: (name: string) => void;
  /** 色の更新 */
  updateColor: (color: string) => void;
  /** アクセサリーの追加 */
  addAccessory: (accessory: Accessory) => void;
  /** アクセサリーの削除 */
  removeAccessory: (accessoryId: string) => void;
  /** プリセットの適用 */
  applyPreset: (presetId: string) => void;
  /** デフォルト設定にリセット */
  resetToDefault: () => void;
  /** プレビューモード */
  isPreviewMode: boolean;
  /** プレビューの開始 */
  startPreview: (customization: PetCustomization) => void;
  /** プレビューの終了 */
  endPreview: () => void;
  /** カスタマイズの保存 */
  saveCustomization: () => Promise<void>;
  /** 読み込み状態 */
  isLoading: boolean;
  /** エラー状態 */
  error: string | null;
}

export function useCustomization(options: UseCustomizationOptions = {}): UseCustomizationReturn {
  const { autoSave = true, saveInterval = 5000 } = options;

  // TODO: 実装内容をここに記述
  // 1. 状態管理
  // 2. カスタマイズ更新ロジック
  // 3. プレビュー機能
  // 4. データ永続化
  // 5. エラーハンドリング

  return {
    // TODO: 返り値を実装
  } as UseCustomizationReturn;
}
```

---

## 🔧 Template 3: CustomizationPanel.tsx

```typescript
/**
 * ペットカスタマイズパネルコンポーネント
 * タブ形式でカスタマイズオプションを提供
 */

import React, { useState } from 'react';
import { useCustomization } from '../hooks/useCustomization';
import { Accessory, COLOR_PALETTE } from '../types/Customization';
import './CustomizationPanel.css';

interface CustomizationPanelProps {
  /** パネルの表示状態 */
  isOpen: boolean;
  /** パネルを閉じるコールバック */
  onClose: () => void;
  /** カスタマイズ完了時のコールバック */
  onComplete?: (customization: any) => void;
}

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [activeTab, setActiveTab] = useState<'name' | 'color' | 'accessories'>('name');
  const {
    customization,
    updateName,
    updateColor,
    addAccessory,
    removeAccessory,
    applyPreset,
    resetToDefault,
    startPreview,
    endPreview,
    saveCustomization,
    isLoading,
    error
  } = useCustomization();

  // TODO: 実装内容
  // 1. タブナビゲーション
  // 2. 名前変更UI
  // 3. 色選択UI
  // 4. アクセサリー選択UI
  // 5. プレビュー機能
  // 6. 保存・キャンセル処理

  if (!isOpen) return null;

  return (
    <div className="customization-panel" role="dialog" aria-label="ペットカスタマイズ">
      {/* TODO: コンポーネント実装 */}
    </div>
  );
};
```

---

## 🔧 Template 4: customizationUtils.ts

```typescript
/**
 * カスタマイズ関連のユーティリティ関数
 * データ保存、検証、変換などの処理を提供
 */

import { PetCustomization, Accessory, CustomizationState } from '../types/Customization';

/**
 * カスタマイズデータをlocalStorageから読み込み
 */
export const loadCustomizationData = (): CustomizationState | null => {
  try {
    // TODO: 実装
    return null;
  } catch (error) {
    console.error('カスタマイズデータの読み込みに失敗:', error);
    return null;
  }
};

/**
 * カスタマイズデータをlocalStorageに保存
 */
export const saveCustomizationData = (data: CustomizationState): boolean => {
  try {
    // TODO: 実装
    return true;
  } catch (error) {
    console.error('カスタマイズデータの保存に失敗:', error);
    return false;
  }
};

/**
 * ペット名のバリデーション
 */
export const validatePetName = (name: string): { isValid: boolean; error?: string } => {
  // TODO: 実装
  // - 文字数制限（1-20文字）
  // - 不適切な文字列のチェック
  // - 特殊文字の制限
  return { isValid: true };
};

/**
 * カラーコードのバリデーション
 */
export const validateColor = (color: string): boolean => {
  // TODO: 実装
  return true;
};

/**
 * アクセサリーの装着可能チェック
 */
export const canEquipAccessory = (
  currentAccessories: Accessory[],
  newAccessory: Accessory
): boolean => {
  // TODO: 実装
  return true;
};

/**
 * デフォルトカスタマイズの生成
 */
export const createDefaultCustomization = (): PetCustomization => {
  // TODO: 実装
  return {
    name: 'マイペット',
    color: '#FF6B6B',
    accessories: [],
    unlocked: true,
    lastModified: new Date()
  };
};
```

---

## 🔧 Template 5: Share.ts

```typescript
/**
 * シェア機能関連の型定義
 * スクリーンショット、SNSシェア、統計表示の型を提供
 */

export interface ShareData {
  /** シェアする画像のData URL */
  imageDataUrl: string;
  /** シェアタイトル */
  title: string;
  /** シェア説明文 */
  description: string;
  /** シェア用URL */
  shareUrl?: string;
  /** ハッシュタグ */
  hashtags: string[];
  /** 統計データ */
  stats?: PetStats;
}

export interface PetStats {
  /** ペットレベル */
  level: number;
  /** 総プレイ時間（分） */
  totalPlayTime: number;
  /** ゲーム勝利数 */
  gameWins: number;
  /** 進化回数 */
  evolutionCount: number;
  /** 現在の進化段階 */
  currentStage: string;
}

export interface ScreenshotOptions {
  /** 画像の幅 */
  width?: number;
  /** 画像の高さ */
  height?: number;
  /** 画質（0-1） */
  quality?: number;
  /** 背景色 */
  backgroundColor?: string;
  /** ウォーターマーク表示 */
  showWatermark?: boolean;
}

export interface SocialShareOptions {
  /** シェア先プラットフォーム */
  platform: 'twitter' | 'facebook' | 'instagram' | 'line';
  /** シェアデータ */
  shareData: ShareData;
  /** 追加のシェア設定 */
  additionalOptions?: Record<string, any>;
}

export type ShareResult = {
  success: boolean;
  platform: string;
  shareUrl?: string;
  error?: string;
};
```

---

## 🔧 Template 6: useShare.ts

```typescript
/**
 * シェア機能管理Hook
 * スクリーンショット撮影とSNSシェア機能を提供
 */

import { useState, useCallback } from 'react';
import { ShareData, ScreenshotOptions, SocialShareOptions, ShareResult } from '../types/Share';

export interface UseShareReturn {
  /** スクリーンショット撮影 */
  captureScreenshot: (element: HTMLElement, options?: ScreenshotOptions) => Promise<string>;
  /** SNSシェア */
  shareToSocial: (options: SocialShareOptions) => Promise<ShareResult>;
  /** 画像ダウンロード */
  downloadImage: (dataUrl: string, filename: string) => void;
  /** シェアデータ生成 */
  generateShareData: () => ShareData;
  /** シェア中フラグ */
  isSharing: boolean;
  /** エラー状態 */
  error: string | null;
}

export function useShare(): UseShareReturn {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const captureScreenshot = useCallback(async (
    element: HTMLElement,
    options: ScreenshotOptions = {}
  ): Promise<string> => {
    // TODO: html2canvas または Canvas API を使用した実装
    return '';
  }, []);

  const shareToSocial = useCallback(async (
    options: SocialShareOptions
  ): Promise<ShareResult> => {
    // TODO: 各プラットフォーム向けのシェア実装
    return { success: false, platform: options.platform };
  }, []);

  // TODO: その他の関数実装

  return {
    captureScreenshot,
    shareToSocial,
    downloadImage: () => {},
    generateShareData: () => ({} as ShareData),
    isSharing,
    error
  };
}
```

---

## 🔧 Template 7: SharePanel.tsx

```typescript
/**
 * シェアパネルコンポーネント
 * スクリーンショット撮影とSNSシェアボタンを提供
 */

import React, { useRef } from 'react';
import { useShare } from '../hooks/useShare';
import './SharePanel.css';

interface SharePanelProps {
  /** パネルの表示状態 */
  isOpen: boolean;
  /** パネルを閉じるコールバック */
  onClose: () => void;
  /** キャプチャ対象の要素参照 */
  captureTargetRef: React.RefObject<HTMLElement>;
}

export const SharePanel: React.FC<SharePanelProps> = ({
  isOpen,
  onClose,
  captureTargetRef
}) => {
  const {
    captureScreenshot,
    shareToSocial,
    downloadImage,
    generateShareData,
    isSharing,
    error
  } = useShare();

  // TODO: 実装内容
  // 1. スクリーンショット撮影UI
  // 2. SNSシェアボタン
  // 3. ダウンロードボタン
  // 4. プレビュー表示
  // 5. エラーハンドリング

  if (!isOpen) return null;

  return (
    <div className="share-panel" role="dialog" aria-label="シェア">
      {/* TODO: コンポーネント実装 */}
    </div>
  );
};
```

---

## 🎨 CSS Template: CustomizationPanel.css

```css
/**
 * カスタマイズパネルのスタイリング
 * モバイルファースト、レスポンシブデザイン
 */

.customization-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.customization-panel__container {
  background: var(--bg-primary);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 90vw;
  max-width: 480px;
  max-height: 80vh;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

.customization-panel__header {
  background: var(--accent-gradient);
  color: white;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.customization-panel__tabs {
  display: flex;
  background: var(--bg-secondary);
  padding: 0.5rem;
}

.customization-panel__tab {
  flex: 1;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
}

.customization-panel__tab--active {
  background: var(--accent-primary);
  color: white;
  transform: translateY(-2px);
}

.customization-panel__content {
  padding: 1.5rem;
  max-height: 50vh;
  overflow-y: auto;
}

/* アニメーション */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* レスポンシブ対応 */
@media (min-width: 768px) {
  .customization-panel__container {
    max-width: 600px;
    max-height: 70vh;
  }
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
  .customization-panel {
    background: rgba(0, 0, 0, 0.7);
  }
}
```

---

## 📋 テストテンプレート例

```typescript
/**
 * Customization.test.ts - 型定義テストの例
 */

import { describe, it, expect } from 'vitest';
import { PetCustomization, Accessory, validatePetName } from '../Customization';

describe('Customization Types', () => {
  describe('PetCustomization', () => {
    it('should create valid pet customization object', () => {
      const customization: PetCustomization = {
        name: 'テストペット',
        color: '#FF6B6B',
        accessories: [],
        unlocked: true,
        lastModified: new Date()
      };

      expect(customization.name).toBe('テストペット');
      expect(customization.color).toBe('#FF6B6B');
      expect(customization.accessories).toEqual([]);
    });
  });

  describe('validatePetName', () => {
    it('should validate valid pet names', () => {
      expect(validatePetName('マイペット').isValid).toBe(true);
      expect(validatePetName('A').isValid).toBe(true);
      expect(validatePetName('二十文字以内のペット名前').isValid).toBe(true);
    });

    it('should reject invalid pet names', () => {
      expect(validatePetName('').isValid).toBe(false);
      expect(validatePetName('二十一文字を超える非常に長いペット名前です').isValid).toBe(false);
    });
  });
});
```

---

## 🚀 実装開始の手順

1. **PHASE-4-ISSUES.md** を確認
2. **Issue #1** から順番に実装
3. 上記テンプレートを参考に効率的な開発
4. テストファースト開発の徹底
5. 各実装完了時に動作確認

**準備完了です！実装を開始してください！** 🎯
