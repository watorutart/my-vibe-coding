/**
 * データ永続化ユーティリティのテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  savePetData, 
  loadPetData, 
  saveConversationHistory, 
  loadConversationHistory,
  saveAppSettings,
  loadAppSettings,
  clearAllData,
  exportData,
  importData,
  DEFAULT_SETTINGS,
  type AppSettings
} from './dataStorage';
import type { Pet } from '../types/Pet';
import type { ConversationMessage } from '../types/Conversation';

// モックデータ
const mockPet: Pet = {
  id: 'test-pet',
  name: 'テストペット',
  type: 'dragon',
  stats: {
    happiness: 80,
    hunger: 20,
    energy: 90,
    level: 3
  },
  expression: 'happy',
  lastUpdate: Date.now(),
  experience: 250
};

const mockConversationHistory: ConversationMessage[] = [
  {
    id: '1',
    sender: 'user',
    content: 'こんにちは',
    timestamp: Date.now() - 1000
  },
  {
    id: '2',
    sender: 'pet',
    content: 'こんにちは！元気だよ！',
    timestamp: Date.now()
  }
];

const mockSettings: AppSettings = {
  soundEnabled: false,
  autoSaveInterval: 60000,
  maxConversationHistory: 50
};

// localStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

// グローバルのlocalStorageをモックで置換
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('dataStorage', () => {
  beforeEach(() => {
    // 各テスト前にlocalStorageをクリア
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('ペットデータの保存・読み込み', () => {
    it('ペットデータを正常に保存できる', async () => {
      await savePetData(mockPet);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ai-pet-buddy-pet-data',
        expect.stringContaining(mockPet.name)
      );
    });

    it('ペットデータを正常に読み込める', async () => {
      // データを保存
      await savePetData(mockPet);
      
      // データを読み込み
      const loadedPet = loadPetData();
      
      expect(loadedPet).toBeTruthy();
      expect(loadedPet?.name).toBe(mockPet.name);
      expect(loadedPet?.stats.happiness).toBe(mockPet.stats.happiness);
      expect(loadedPet?.stats.level).toBe(mockPet.stats.level);
    });

    it('データが存在しない場合はnullを返す', () => {
      const loadedPet = loadPetData();
      expect(loadedPet).toBeNull();
    });

    it('無効なデータの場合はnullを返す', () => {
      // 無効なデータを設定
      localStorageMock.getItem.mockReturnValueOnce('{"invalid": "data"}');
      
      const loadedPet = loadPetData();
      expect(loadedPet).toBeNull();
    });

    it('JSON.parseエラーの場合はnullを返す', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid json');
      
      const loadedPet = loadPetData();
      expect(loadedPet).toBeNull();
    });
  });

  describe('会話履歴の保存・読み込み', () => {
    it('会話履歴を正常に保存できる', async () => {
      await saveConversationHistory(mockConversationHistory);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ai-pet-buddy-conversation-history',
        expect.stringContaining(mockConversationHistory[0].content)
      );
    });

    it('会話履歴を正常に読み込める', async () => {
      // データを保存
      await saveConversationHistory(mockConversationHistory);
      
      // データを読み込み
      const loadedHistory = loadConversationHistory();
      
      expect(loadedHistory).toHaveLength(2);
      expect(loadedHistory[0].content).toBe(mockConversationHistory[0].content);
      expect(loadedHistory[1].sender).toBe(mockConversationHistory[1].sender);
    });

    it('データが存在しない場合は空配列を返す', () => {
      const loadedHistory = loadConversationHistory();
      expect(loadedHistory).toEqual([]);
    });

    it('無効なデータの場合は空配列を返す', () => {
      localStorageMock.getItem.mockReturnValueOnce('{"not": "array"}');
      
      const loadedHistory = loadConversationHistory();
      expect(loadedHistory).toEqual([]);
    });

    it('最大履歴数を超える場合は制限される', async () => {
      // 100件の履歴を作成
      const longHistory: ConversationMessage[] = Array.from({ length: 150 }, (_, i) => ({
        id: `${i}`,
        sender: i % 2 === 0 ? 'user' : 'pet',
        content: `メッセージ ${i}`,
        timestamp: Date.now() + i
      }));

      await saveConversationHistory(longHistory);
      const loadedHistory = loadConversationHistory();
      
      // デフォルト設定の最大数（100）で制限されることを確認
      expect(loadedHistory.length).toBeLessThanOrEqual(100);
    });

    it('無効なメッセージ構造をフィルタリングする', () => {
      const invalidHistory = [
        mockConversationHistory[0], // 有効
        { id: '3', sender: 'user' }, // contentが欠如
        mockConversationHistory[1], // 有効
        { content: 'test' } // idとsenderが欠如
      ];
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(invalidHistory));
      
      const loadedHistory = loadConversationHistory();
      expect(loadedHistory).toHaveLength(2); // 有効な2件のみ
    });
  });

  describe('アプリケーション設定の保存・読み込み', () => {
    it('設定を正常に保存できる', async () => {
      await saveAppSettings(mockSettings);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ai-pet-buddy-settings',
        JSON.stringify(mockSettings)
      );
    });

    it('設定を正常に読み込める', async () => {
      await saveAppSettings(mockSettings);
      const loadedSettings = loadAppSettings();
      
      expect(loadedSettings.soundEnabled).toBe(mockSettings.soundEnabled);
      expect(loadedSettings.autoSaveInterval).toBe(mockSettings.autoSaveInterval);
      expect(loadedSettings.maxConversationHistory).toBe(mockSettings.maxConversationHistory);
    });

    it('データが存在しない場合はデフォルト設定を返す', () => {
      const loadedSettings = loadAppSettings();
      expect(loadedSettings).toEqual(DEFAULT_SETTINGS);
    });

    it('部分的な設定でもデフォルト値とマージされる', () => {
      const partialSettings = { soundEnabled: false };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(partialSettings));
      
      const loadedSettings = loadAppSettings();
      expect(loadedSettings.soundEnabled).toBe(false);
      expect(loadedSettings.autoSaveInterval).toBe(DEFAULT_SETTINGS.autoSaveInterval);
      expect(loadedSettings.maxConversationHistory).toBe(DEFAULT_SETTINGS.maxConversationHistory);
    });
  });

  describe('データ管理機能', () => {
    it('すべてのデータをクリアできる', async () => {
      // データを保存
      await savePetData(mockPet);
      await saveConversationHistory(mockConversationHistory);
      await saveAppSettings(mockSettings);
      
      // クリア実行
      clearAllData();
      
      // removeItemが3回呼ばれることを確認
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(3);
    });

    it('データをエクスポートできる', async () => {
      // データを保存
      await savePetData(mockPet);
      await saveConversationHistory(mockConversationHistory);
      await saveAppSettings(mockSettings);
      
      const exportedData = exportData();
      expect(exportedData).toBeTruthy();
      
      const parsedData = JSON.parse(exportedData);
      expect(parsedData.pet).toBeTruthy();
      expect(parsedData.conversationHistory).toBeTruthy();
      expect(parsedData.settings).toBeTruthy();
    });

    it('データをインポートできる', () => {
      const exportedData = JSON.stringify({
        pet: mockPet,
        conversationHistory: mockConversationHistory,
        settings: mockSettings
      });
      
      const result = importData(exportedData);
      expect(result).toBe(true);
      
      // データが正常にインポートされたことを確認
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(3);
    });

    it('無効なJSONのインポートは失敗する', () => {
      const result = importData('invalid json');
      expect(result).toBe(false);
    });
  });

  describe('エラーハンドリング', () => {
    it('localStorage.setItemがエラーの場合も例外を投げない', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      expect(() => savePetData(mockPet)).not.toThrow();
      expect(() => saveConversationHistory(mockConversationHistory)).not.toThrow();
      expect(() => saveAppSettings(mockSettings)).not.toThrow();
    });

    it('localStorage.getItemがエラーの場合も適切なデフォルト値を返す', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });
      
      expect(loadPetData()).toBeNull();
      expect(loadConversationHistory()).toEqual([]);
      expect(loadAppSettings()).toEqual(DEFAULT_SETTINGS);
    });
  });
});
