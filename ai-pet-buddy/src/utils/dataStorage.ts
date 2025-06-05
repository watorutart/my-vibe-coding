/**
 * @file dataStorage.ts
 * @description ローカルストレージデータ管理ユーティリティ
 * 
 * ペットデータ、会話履歴、アプリ設定の保存・読み込み・管理機能を提供します。
 * エラーハンドリングとデータ検証を含みます。
 */

import type { Pet } from '../types/Pet';
import type { ConversationMessage } from '../types/Conversation';

// ストレージキー
const STORAGE_KEYS = {
  PET_DATA: 'ai-pet-buddy-pet-data',
  CONVERSATION_HISTORY: 'ai-pet-buddy-conversation-history',
  APP_SETTINGS: 'ai-pet-buddy-settings'  // テストと一致させる
} as const;

// デフォルト設定
export const DEFAULT_SETTINGS = {
  soundEnabled: true,
  autoSaveInterval: 30000,
  maxConversationHistory: 100
} as const;

// アプリ設定の型定義
export interface AppSettings {
  soundEnabled?: boolean;
  autoSaveInterval?: number;
  maxConversationHistory?: number;
}

/**
 * ペットデータを保存
 * @param pet 保存するペットデータ
 */
export async function savePetData(pet: Pet): Promise<void> {
  try {
    const serializedData = JSON.stringify(pet);
    localStorage.setItem(STORAGE_KEYS.PET_DATA, serializedData);
  } catch (error) {
    console.error('ペットデータの保存に失敗:', error);
    throw error;
  }
}

/**
 * ペットデータを読み込み
 * @returns 読み込んだペットデータまたはnull
 */
export function loadPetData(): Pet | null {
  try {
    const serializedData = localStorage.getItem(STORAGE_KEYS.PET_DATA);
    if (!serializedData) {
      return null;
    }

    const pet = JSON.parse(serializedData);
    
    // データ検証
    if (!isValidPetData(pet)) {
      console.warn('無効なペットデータが検出されました。デフォルト値を使用します。');
      return null;
    }

    return pet;
  } catch (error) {
    console.error('ペットデータの読み込みに失敗:', error);
    return null;
  }
}

/**
 * 会話履歴を保存（最大数制限付き）
 * @param conversationHistory 保存する会話履歴
 */
export async function saveConversationHistory(conversationHistory: ConversationMessage[]): Promise<void> {
  try {
    // 設定から最大履歴数を取得
    const settings = loadAppSettings();
    const maxHistory = settings?.maxConversationHistory || DEFAULT_SETTINGS.maxConversationHistory;
    
    // 有効なメッセージのみフィルタリング
    const validMessages = conversationHistory.filter(isValidConversationMessage);
    
    // 最大数を超える場合は古いものから削除
    const limitedHistory = validMessages.slice(-maxHistory);
    
    const serializedData = JSON.stringify(limitedHistory);
    localStorage.setItem(STORAGE_KEYS.CONVERSATION_HISTORY, serializedData);
  } catch (error) {
    console.error('会話履歴の保存に失敗:', error);
    throw error;
  }
}

/**
 * 会話履歴を読み込み
 * @returns 読み込んだ会話履歴
 */
export function loadConversationHistory(): ConversationMessage[] {
  try {
    const serializedData = localStorage.getItem(STORAGE_KEYS.CONVERSATION_HISTORY);
    if (!serializedData) {
      return [];
    }

    const history = JSON.parse(serializedData);
    
    // データ検証
    if (!Array.isArray(history)) {
      console.warn('無効な会話履歴データが検出されました。');
      return [];
    }

    // 有効なメッセージのみフィルタリング
    return history.filter(isValidConversationMessage);
  } catch (error) {
    console.error('会話履歴の読み込みに失敗:', error);
    return [];
  }
}

/**
 * アプリ設定を保存
 * @param settings 保存する設定
 */
export async function saveAppSettings(settings: AppSettings): Promise<void> {
  try {
    const serializedData = JSON.stringify(settings);
    localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, serializedData);
  } catch (error) {
    console.error('設定の保存に失敗:', error);
    throw error;
  }
}

/**
 * アプリ設定を読み込み
 * @returns 読み込んだ設定
 */
export function loadAppSettings(): AppSettings {
  try {
    const serializedData = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    if (!serializedData) {
      return DEFAULT_SETTINGS;
    }

    const settings = JSON.parse(serializedData);
    
    // デフォルト設定とマージ
    return { ...DEFAULT_SETTINGS, ...settings };
  } catch (error) {
    console.error('設定の読み込みに失敗:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * 全データを削除
 */
export function clearAllData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('データのクリアに失敗:', error);
  }
}

/**
 * データをエクスポート
 * @returns エクスポートされたデータ
 */
export function exportData(): string {
  try {
    const data = {
      pet: loadPetData(),
      conversationHistory: loadConversationHistory(),
      settings: loadAppSettings()
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('データのエクスポートに失敗:', error);
    throw error;
  }
}

/**
 * データをインポート
 * @param dataString インポートするデータ文字列
 * @returns インポートが成功したかどうか
 */
export function importData(dataString: string): boolean {
  try {
    const data = JSON.parse(dataString);
    
    if (data.pet && isValidPetData(data.pet)) {
      savePetData(data.pet);
    }
    
    if (Array.isArray(data.conversationHistory)) {
      saveConversationHistory(data.conversationHistory);
    }
    
    if (data.settings && typeof data.settings === 'object') {
      saveAppSettings(data.settings);
    }
    
    return true;
  } catch (error) {
    console.error('データのインポートに失敗:', error);
    return false;
  }
}

/**
 * ペットデータの妥当性を検証
 * @param data 検証するデータ
 * @returns データが有効かどうか
 */
function isValidPetData(data: unknown): data is Pet {
  return Boolean(
    data &&
    typeof data === 'object' &&
    data !== null &&
    'id' in data && typeof data.id === 'string' &&
    'name' in data && typeof data.name === 'string' &&
    'type' in data && typeof data.type === 'string' &&
    'stats' in data &&
    data.stats &&
    typeof data.stats === 'object' &&
    data.stats !== null &&
    'happiness' in data.stats && typeof data.stats.happiness === 'number' &&
    'hunger' in data.stats && typeof data.stats.hunger === 'number' &&
    'energy' in data.stats && typeof data.stats.energy === 'number' &&
    'level' in data.stats && typeof data.stats.level === 'number' &&
    'lastUpdate' in data && typeof data.lastUpdate === 'number' &&
    'expression' in data && typeof data.expression === 'string'
  );
}

/**
 * 会話メッセージの妥当性を検証
 * @param message 検証するメッセージ
 * @returns メッセージが有効かどうか
 */
function isValidConversationMessage(message: unknown): message is ConversationMessage {
  return Boolean(
    message &&
    typeof message === 'object' &&
    message !== null &&
    'id' in message && typeof message.id === 'string' &&
    'sender' in message && (message.sender === 'user' || message.sender === 'pet') &&
    'content' in message && typeof message.content === 'string' &&
    'timestamp' in message && typeof message.timestamp === 'number'
  );
}