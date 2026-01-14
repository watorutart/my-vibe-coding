/**
 * @file useDataPersistence.test.ts
 * @description データ永続化フックのテストスイート
 *
 * 自動保存、手動保存、初期データロード、ストレージ管理の
 * 包括的なテストを実装します。
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDataPersistence } from './useDataPersistence';
import * as dataStorage from '../utils/dataStorage';
import type { Pet } from '../types/Pet';
import type { ConversationMessage } from '../types/Conversation';

// データストレージモジュールをモック
vi.mock('../utils/dataStorage');

describe('useDataPersistence', () => {
  let mockPet: Pet;
  let mockConversationHistory: ConversationMessage[];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    mockPet = {
      id: 'test-pet',
      name: 'テストペット',
      type: 'dragon',
      stats: {
        happiness: 80,
        hunger: 60,
        energy: 70,
        level: 1,
      },
      lastUpdate: Date.now(),
      expression: 'happy',
    };

    mockConversationHistory = [
      {
        id: '1',
        sender: 'user',
        content: 'こんにちは',
        timestamp: Date.now(),
      },
    ];

    // データストレージ関数のモック設定
    vi.mocked(dataStorage.savePetData).mockResolvedValue(undefined);
    vi.mocked(dataStorage.saveConversationHistory).mockResolvedValue(undefined);
    vi.mocked(dataStorage.saveAppSettings).mockResolvedValue(undefined);
    vi.mocked(dataStorage.loadPetData).mockReturnValue(mockPet);
    vi.mocked(dataStorage.loadConversationHistory).mockReturnValue(
      mockConversationHistory
    );
    vi.mocked(dataStorage.loadAppSettings).mockReturnValue({
      autoSaveInterval: 30000,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('基本機能', () => {
    it('初期データを正常に読み込める', () => {
      const { result } = renderHook(() => useDataPersistence());

      const { pet, conversationHistory } = result.current.loadInitialData();

      expect(dataStorage.loadPetData).toHaveBeenCalled();
      expect(dataStorage.loadConversationHistory).toHaveBeenCalled();
      expect(pet).toEqual(mockPet);
      expect(conversationHistory).toEqual(mockConversationHistory);
    });

    it('データが存在しない場合の初期データ読み込み', () => {
      vi.mocked(dataStorage.loadPetData).mockReturnValue(null);
      vi.mocked(dataStorage.loadConversationHistory).mockReturnValue([]);

      const { result } = renderHook(() => useDataPersistence());

      const { pet, conversationHistory } = result.current.loadInitialData();

      expect(pet).toBeNull();
      expect(conversationHistory).toEqual([]);
    });

    it('エラー発生時は適切なデフォルト値を返す', () => {
      vi.mocked(dataStorage.loadPetData).mockImplementation(() => {
        throw new Error('読み込みエラー');
      });

      const { result } = renderHook(() => useDataPersistence());

      const { pet, conversationHistory } = result.current.loadInitialData();

      expect(pet).toBeNull();
      expect(conversationHistory).toEqual([]);
    });
  });

  describe('手動保存機能', () => {
    it('データを正常に保存できる', async () => {
      const { result } = renderHook(() => useDataPersistence());

      await act(async () => {
        result.current.saveData(mockPet, mockConversationHistory);
      });

      expect(dataStorage.savePetData).toHaveBeenCalledWith(mockPet);
      expect(dataStorage.saveConversationHistory).toHaveBeenCalledWith(
        mockConversationHistory
      );
    });

    it('1秒以内の連続保存は無視される', async () => {
      const { result } = renderHook(() => useDataPersistence());

      // 最初の保存
      await act(async () => {
        result.current.saveData(mockPet, mockConversationHistory);
      });

      // 同じタイミングで2回目の保存（スロットリングされる）
      await act(async () => {
        result.current.saveData(mockPet, mockConversationHistory);
      });

      expect(dataStorage.savePetData).toHaveBeenCalledTimes(1);
      expect(dataStorage.saveConversationHistory).toHaveBeenCalledTimes(1);
    });

    it('保存エラーが発生しても例外を投げない', () => {
      vi.mocked(dataStorage.savePetData).mockImplementation(() => {
        throw new Error('保存エラー');
      });

      const { result } = renderHook(() => useDataPersistence());

      expect(async () => {
        await act(async () => {
          result.current.saveData(mockPet, mockConversationHistory);
        });
      }).not.toThrow();
    });
  });

  describe('自動保存機能', () => {
    it('自動保存が正常に動作する', async () => {
      const { result } = renderHook(() =>
        useDataPersistence({
          autoSaveInterval: 1000,
          enableAutoSave: true,
        })
      );

      act(() => {
        result.current.setupAutoSave(mockPet, mockConversationHistory);
      });

      // タイマーを進める
      await act(async () => {
        vi.advanceTimersByTime(1100);
      });

      expect(dataStorage.savePetData).toHaveBeenCalledWith(mockPet);
      expect(dataStorage.saveConversationHistory).toHaveBeenCalledWith(
        mockConversationHistory
      );

      act(() => {
        result.current.clearAutoSave();
      });
    });

    it('autoSaveが無効の場合は自動保存されない', async () => {
      const { result } = renderHook(() =>
        useDataPersistence({
          autoSaveInterval: 1000,
          enableAutoSave: false,
        })
      );

      act(() => {
        result.current.setupAutoSave(mockPet, mockConversationHistory);
      });

      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(dataStorage.savePetData).not.toHaveBeenCalled();

      act(() => {
        result.current.clearAutoSave();
      });
    });

    it('自動保存をクリアできる', async () => {
      const { result } = renderHook(() =>
        useDataPersistence({
          autoSaveInterval: 1000,
          enableAutoSave: true,
        })
      );

      act(() => {
        result.current.setupAutoSave(mockPet, mockConversationHistory);
        result.current.clearAutoSave();
      });

      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(dataStorage.savePetData).not.toHaveBeenCalled();
    });

    it('複数回setupAutoSaveを呼んでも古いタイマーはクリアされる', async () => {
      const { result } = renderHook(() =>
        useDataPersistence({
          autoSaveInterval: 1000,
          enableAutoSave: true,
        })
      );

      act(() => {
        result.current.setupAutoSave(mockPet, mockConversationHistory);
        result.current.setupAutoSave(mockPet, mockConversationHistory);
      });

      await act(async () => {
        vi.advanceTimersByTime(1100);
      });

      // 1回のみ実行される（重複タイマーがないことを確認）
      expect(dataStorage.savePetData).toHaveBeenCalledTimes(1);
    });
  });

  describe('設定からの間隔取得', () => {
    it('設定ファイルから自動保存間隔を取得する', () => {
      vi.mocked(dataStorage.loadAppSettings).mockReturnValue({
        autoSaveInterval: 15000,
      });
      vi.mocked(dataStorage.savePetData).mockImplementation(() => {
        throw new Error('保存エラー');
      });

      const { result } = renderHook(() =>
        useDataPersistence({
          enableAutoSave: true,
        })
      );

      act(() => {
        result.current.setupAutoSave(mockPet, mockConversationHistory);
      });

      // 設定ファイルの間隔（15秒）で自動保存される
      act(() => {
        vi.advanceTimersByTime(15100);
      });

      expect(dataStorage.savePetData).toHaveBeenCalled();

      act(() => {
        result.current.clearAutoSave();
      });
    });
  });
});

describe('useBeforeUnloadSave', () => {
  let testMockPet: Pet;
  let testMockConversationHistory: ConversationMessage[];

  beforeEach(() => {
    // 前のテストからのエラーモックをクリア
    vi.clearAllMocks();
    testMockPet = {
      id: 'test-pet',
      name: 'テストペット',
      type: 'dragon',
      stats: {
        happiness: 80,
        hunger: 60,
        energy: 70,
        level: 1,
      },
      lastUpdate: Date.now(),
      expression: 'happy',
    };

    testMockConversationHistory = [
      {
        id: '1',
        sender: 'user',
        content: 'こんにちは',
        timestamp: Date.now(),
      },
    ];
  });

  it('beforeunloadイベントでデータが保存される', () => {
    const { result } = renderHook(() => useDataPersistence());

    act(() => {
      result.current.setupBeforeUnloadSave(
        testMockPet,
        testMockConversationHistory
      );
    });

    // beforeunloadイベントを発火
    const beforeUnloadEvent = new Event('beforeunload');
    window.dispatchEvent(beforeUnloadEvent);

    expect(dataStorage.savePetData).toHaveBeenCalledWith(testMockPet);
    expect(dataStorage.saveConversationHistory).toHaveBeenCalledWith(
      testMockConversationHistory
    );
  });

  it('visibilitychangeイベントでデータが保存される', () => {
    const { result } = renderHook(() => useDataPersistence());

    act(() => {
      result.current.setupBeforeUnloadSave(
        testMockPet,
        testMockConversationHistory
      );
    });

    // documentを非表示にしてvisibilitychangeイベントを発火
    Object.defineProperty(document, 'hidden', {
      value: true,
      configurable: true,
    });
    const visibilityChangeEvent = new Event('visibilitychange');
    document.dispatchEvent(visibilityChangeEvent);

    expect(dataStorage.savePetData).toHaveBeenCalledWith(testMockPet);
    expect(dataStorage.saveConversationHistory).toHaveBeenCalledWith(
      testMockConversationHistory
    );
  });

  it('visibleな状態では保存されない', () => {
    // 各テスト前にmockをクリア
    vi.clearAllMocks();

    const { result } = renderHook(() => useDataPersistence());

    act(() => {
      result.current.setupBeforeUnloadSave(
        testMockPet,
        testMockConversationHistory
      );
    });

    // documentを表示状態にしてvisibilitychangeイベントを発火
    Object.defineProperty(document, 'hidden', {
      value: false,
      configurable: true,
    });
    const visibilityChangeEvent = new Event('visibilitychange');
    document.dispatchEvent(visibilityChangeEvent);

    expect(dataStorage.savePetData).not.toHaveBeenCalled();
    expect(dataStorage.saveConversationHistory).not.toHaveBeenCalled();
  });
});
