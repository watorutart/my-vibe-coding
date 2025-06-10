/**
 * @file customizationUtils.ts
 * @description カスタマイズシステム関連のユーティリティ関数
 * 
 * カスタマイズデータの保存・読み込み、バリデーション、プリセット管理機能を提供します。
 */

import type { 
  PetCustomization, 
  CustomizationState, 
  Accessory,
  NameValidationResult,
  ColorValidationResult
} from '../types/Customization';
import { 
  DEFAULT_CUSTOMIZATION, 
  DEFAULT_ACCESSORIES,
  validatePetName as validateName,
  validateColor as validateColorCode
} from '../types/Customization';

// ストレージキー
const STORAGE_KEYS = {
  CUSTOMIZATION_DATA: 'ai-pet-buddy-customization-data',
  AVAILABLE_ACCESSORIES: 'ai-pet-buddy-available-accessories',
  CUSTOMIZATION_PRESETS: 'ai-pet-buddy-customization-presets'
} as const;

/**
 * カスタマイズデータを保存
 * @param data 保存するカスタマイズ状態
 * @returns 保存成功可否
 */
export const saveCustomizationData = (data: CustomizationState): boolean => {
  try {
    // 現在のカスタマイズを保存
    const currentData = JSON.stringify(data.current);
    localStorage.setItem(STORAGE_KEYS.CUSTOMIZATION_DATA, currentData);
    
    // 利用可能アクセサリーを保存
    const availableData = JSON.stringify(data.available);
    localStorage.setItem(STORAGE_KEYS.AVAILABLE_ACCESSORIES, availableData);
    
    // プリセットを保存
    const presetsData = JSON.stringify(data.presets);
    localStorage.setItem(STORAGE_KEYS.CUSTOMIZATION_PRESETS, presetsData);
    
    console.log('カスタマイズデータを保存しました');
    return true;
  } catch (error) {
    console.error('カスタマイズデータの保存に失敗:', error);
    return false;
  }
};

/**
 * カスタマイズデータを読み込み
 * @returns 読み込んだカスタマイズ状態
 */
export const loadCustomizationData = (): CustomizationState => {
  try {
    // 現在のカスタマイズを読み込み
    const currentData = localStorage.getItem(STORAGE_KEYS.CUSTOMIZATION_DATA);
    let current: PetCustomization = DEFAULT_CUSTOMIZATION;
    
    if (currentData) {
      const parsed = JSON.parse(currentData);
      if (isValidCustomization(parsed)) {
        // Date オブジェクトを復元
        current = {
          ...parsed,
          lastModified: new Date(parsed.lastModified)
        };
      }
    }
    
    // 利用可能アクセサリーを読み込み
    const availableData = localStorage.getItem(STORAGE_KEYS.AVAILABLE_ACCESSORIES);
    let available: Accessory[] = DEFAULT_ACCESSORIES;
    
    if (availableData) {
      const parsed = JSON.parse(availableData);
      if (Array.isArray(parsed) && parsed.every(isValidAccessory)) {
        available = parsed;
      }
    }
    
    // プリセットを読み込み
    const presetsData = localStorage.getItem(STORAGE_KEYS.CUSTOMIZATION_PRESETS);
    let presets: PetCustomization[] = [];
    
    if (presetsData) {
      const parsed = JSON.parse(presetsData);
      if (Array.isArray(parsed)) {
        presets = parsed
          .filter(isValidCustomization)
          .map(preset => ({
            ...preset,
            lastModified: new Date(preset.lastModified)
          }));
      }
    }
    
    console.log('カスタマイズデータを読み込みました');
    return { current, available, presets };
  } catch (error) {
    console.error('カスタマイズデータの読み込みに失敗:', error);
    return {
      current: DEFAULT_CUSTOMIZATION,
      available: DEFAULT_ACCESSORIES,
      presets: []
    };
  }
};

/**
 * ペット名のバリデーション (ラッパー関数)
 * @param name 検証する名前
 * @returns バリデーション結果
 */
export const validatePetName = (name: string): NameValidationResult => {
  return validateName(name);
};

/**
 * カラーコードのバリデーション (ラッパー関数)
 * @param color 検証するカラーコード
 * @returns バリデーション結果
 */
export const validateColor = (color: string): ColorValidationResult => {
  return validateColorCode(color);
};

/**
 * アクセサリーIDのバリデーション
 * @param id 検証するアクセサリーID
 * @param availableAccessories 利用可能なアクセサリー一覧
 * @returns バリデーション結果
 */
export const validateAccessoryId = (
  id: string, 
  availableAccessories: Accessory[]
): { isValid: boolean; error?: string } => {
  if (!id || id.trim().length === 0) {
    return { isValid: false, error: 'アクセサリーIDが指定されていません' };
  }
  
  const accessory = availableAccessories.find(acc => acc.id === id);
  if (!accessory) {
    return { isValid: false, error: '指定されたアクセサリーは存在しません' };
  }
  
  if (!accessory.unlocked) {
    return { isValid: false, error: 'このアクセサリーはまだ解除されていません' };
  }
  
  return { isValid: true };
};

/**
 * アクセサリーをカスタマイズに追加
 * @param customization 現在のカスタマイズ
 * @param accessory 追加するアクセサリー
 * @returns 更新されたカスタマイズ
 */
export const addAccessoryToCustomization = (
  customization: PetCustomization,
  accessory: Accessory
): PetCustomization => {
  // 同じタイプのアクセサリーを削除（上書き）
  const filteredAccessories = customization.accessories.filter(
    acc => acc.type !== accessory.type
  );
  
  return {
    ...customization,
    accessories: [...filteredAccessories, accessory],
    lastModified: new Date()
  };
};

/**
 * アクセサリーをカスタマイズから削除
 * @param customization 現在のカスタマイズ
 * @param accessoryId 削除するアクセサリーID
 * @returns 更新されたカスタマイズ
 */
export const removeAccessoryFromCustomization = (
  customization: PetCustomization,
  accessoryId: string
): PetCustomization => {
  return {
    ...customization,
    accessories: customization.accessories.filter(acc => acc.id !== accessoryId),
    lastModified: new Date()
  };
};

/**
 * プリセットを作成
 * @param customization 現在のカスタマイズ
 * @param presetName プリセット名
 * @returns プリセット化されたカスタマイズ
 */
export const createPreset = (
  customization: PetCustomization,
  presetName: string
): PetCustomization => {
  return {
    ...customization,
    name: presetName,
    lastModified: new Date()
  };
};

/**
 * カスタマイズをリセット
 * @returns デフォルトカスタマイズ
 */
export const resetCustomization = (): PetCustomization => {
  return {
    ...DEFAULT_CUSTOMIZATION,
    lastModified: new Date()
  };
};

/**
 * カスタマイズデータが有効かチェック
 * @param data チェックするデータ
 * @returns 有効性
 */
function isValidCustomization(data: any): data is PetCustomization {
  return data &&
    typeof data.name === 'string' &&
    typeof data.color === 'string' &&
    Array.isArray(data.accessories) &&
    typeof data.unlocked === 'boolean' &&
    data.lastModified;
}

/**
 * アクセサリーデータが有効かチェック
 * @param data チェックするデータ
 * @returns 有効性
 */
function isValidAccessory(data: any): data is Accessory {
  const validTypes = ['hat', 'ribbon', 'glasses', 'necklace'];
  return data &&
    typeof data.id === 'string' &&
    validTypes.includes(data.type) &&
    typeof data.name === 'string' &&
    typeof data.unlocked === 'boolean';
}

/**
 * 利用可能な色パレットを取得
 * @returns 色パレット配列
 */
export const getColorPalette = (): string[] => {
  return [
    '#FF6B6B', // レッド
    '#4ECDC4', // ティール  
    '#45B7D1', // ブルー
    '#96CEB4', // グリーン
    '#FECA57', // イエロー
    '#FF9FF3', // ピンク
    '#A55EEA', // パープル
    '#FD79A8'  // ローズ
  ];
};

/**
 * アクセサリーを解除
 * @param accessoryId 解除するアクセサリーID
 * @param availableAccessories 現在利用可能なアクセサリー一覧
 * @returns 更新されたアクセサリー一覧
 */
export const unlockAccessory = (
  accessoryId: string,
  availableAccessories: Accessory[]
): Accessory[] => {
  return availableAccessories.map(accessory =>
    accessory.id === accessoryId
      ? { ...accessory, unlocked: true }
      : accessory
  );
};