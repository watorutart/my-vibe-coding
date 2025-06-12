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
  /** アクセサリー名 */
  name: string;
  /** アクセサリーの色 (オプション) */
  color?: string;
  /** 解除済みかどうか */
  unlocked: boolean;
}

export interface CustomizationState {
  /** 現在適用されているカスタマイズ */
  current: PetCustomization;
  /** 利用可能なアクセサリー一覧 */
  available: Accessory[];
  /** プリセット設定一覧 */
  presets: PetCustomization[];
}

export interface CustomizationAction {
  type: 'UPDATE_NAME' | 'UPDATE_COLOR' | 'ADD_ACCESSORY' | 'REMOVE_ACCESSORY' | 'LOAD_PRESET' | 'RESET';
  payload?: any;
}

/**
 * ペット名のバリデーション結果
 */
export interface NameValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * カラーコードのバリデーション結果
 */
export interface ColorValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * デフォルトのカスタマイズ設定
 */
export const DEFAULT_CUSTOMIZATION: PetCustomization = {
  name: 'Buddy',
  color: '#FF6B6B',
  accessories: [],
  unlocked: true,
  lastModified: new Date()
};

/**
 * デフォルトのアクセサリー一覧
 */
export const DEFAULT_ACCESSORIES: Accessory[] = [
  {
    id: 'hat-1',
    type: 'hat',
    name: '麦わら帽子',
    color: '#D4AF37',
    unlocked: true
  },
  {
    id: 'ribbon-1',
    type: 'ribbon',
    name: '赤いリボン',
    color: '#FF0000',
    unlocked: true
  },
  {
    id: 'glasses-1',
    type: 'glasses',
    name: 'サングラス',
    color: '#000000',
    unlocked: false
  },
  {
    id: 'necklace-1',
    type: 'necklace',
    name: '金のネックレス',
    color: '#FFD700',
    unlocked: false
  }
];

/**
 * ペット名バリデーション
 * @param name 検証する名前
 * @returns バリデーション結果
 */
export const validatePetName = (name: string): NameValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: '名前を入力してください' };
  }
  
  if (name.length > 20) {
    return { isValid: false, error: '名前は20文字以内で入力してください' };
  }
  
  // 特殊文字チェック（基本的な記号のみ許可）
  const invalidChars = /[<>"/\\|?*]/;
  if (invalidChars.test(name)) {
    return { isValid: false, error: '使用できない文字が含まれています' };
  }
  
  return { isValid: true };
};

/**
 * カラーコードバリデーション
 * @param color 検証するカラーコード
 * @returns バリデーション結果
 */
export const validateColor = (color: string): ColorValidationResult => {
  if (!color) {
    return { isValid: false, error: 'カラーコードを入力してください' };
  }
  
  // HEXカラーコードの形式チェック
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hexPattern.test(color)) {
    return { isValid: false, error: '有効なHEXカラーコード（例: #FF6B6B）を入力してください' };
  }
  
  return { isValid: true };
};