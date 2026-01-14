/**
 * @file useDataPersistence.ts
 * @description データ永続化フック
 *
 * ペットデータと会話履歴の自動保存、手動保存、ロード機能を提供します。
 * セッション終了時の自動保存やストレージ容量管理機能も含まれます。
 */

import { useRef, useCallback } from 'react';
import type { Pet } from '../types/Pet';
import type { ConversationMessage } from '../types/Conversation';
import * as dataStorage from '../utils/dataStorage';

interface UseDataPersistenceOptions {
  autoSaveInterval?: number;
  enableAutoSave?: boolean;
}

interface UseDataPersistenceReturn {
  loadInitialData: () => {
    pet: Pet | null;
    conversationHistory: ConversationMessage[];
  };
  saveData: (
    pet: Pet,
    conversationHistory: ConversationMessage[]
  ) => Promise<void>;
  setupAutoSave: (pet: Pet, conversationHistory: ConversationMessage[]) => void;
  clearAutoSave: () => void;
  setupBeforeUnloadSave: (
    pet: Pet,
    conversationHistory: ConversationMessage[]
  ) => void;
}

/**
 * データ永続化フック
 * @param options 設定オプション
 * @returns データ永続化関数群
 */
export function useDataPersistence(
  options: UseDataPersistenceOptions = {}
): UseDataPersistenceReturn {
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const beforeUnloadListenersRef = useRef<(() => void)[]>([]);

  // 初期データ読み込み
  const loadInitialData = useCallback(() => {
    try {
      console.log('初期データを読み込み中...');
      const pet = dataStorage.loadPetData();
      const conversationHistory = dataStorage.loadConversationHistory();

      return {
        pet,
        conversationHistory,
      };
    } catch (error) {
      console.error('初期データの読み込みに失敗:', error);
      return {
        pet: null,
        conversationHistory: [],
      };
    }
  }, []);

  // データ保存（スロットリング付き）
  const saveData = useCallback(
    async (pet: Pet, conversationHistory: ConversationMessage[]) => {
      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimeRef.current;
      const throttleTime = 1000; // 1秒のスロットリング

      // スロットリング: 十分時間が経過していない場合はスキップ
      if (timeSinceLastSave < throttleTime) {
        return; // スロットリングにより保存をスキップ
      }

      try {
        await Promise.all([
          dataStorage.savePetData(pet),
          dataStorage.saveConversationHistory(conversationHistory),
        ]);

        lastSaveTimeRef.current = now;
        console.log(`データを保存しました: ${new Date().toLocaleTimeString()}`);
      } catch (error) {
        console.error('データの保存に失敗:', error);
        // エラーが発生しても例外を投げない
      }
    },
    []
  );

  // 自動保存設定
  const setupAutoSave = useCallback(
    (pet: Pet, conversationHistory: ConversationMessage[]) => {
      // 既存のタイマーをクリア
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        console.log('自動保存を停止しました');
      }

      const settings = dataStorage.loadAppSettings();
      const interval =
        options.autoSaveInterval || settings?.autoSaveInterval || 30000;
      const enabled = options.enableAutoSave !== false; // デフォルトで有効

      if (!enabled) {
        return;
      }

      console.log(`自動保存を開始しました（間隔: ${interval / 1000}秒）`);

      autoSaveTimerRef.current = setInterval(async () => {
        await saveData(pet, conversationHistory);
      }, interval);
    },
    [options.autoSaveInterval, options.enableAutoSave, saveData]
  );

  // 自動保存クリア
  const clearAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
      console.log('自動保存を停止しました');
    }
  }, []);

  // beforeunload/visibilitychange イベントでの保存設定
  const setupBeforeUnloadSave = useCallback(
    (pet: Pet, conversationHistory: ConversationMessage[]) => {
      // 既存のリスナーをクリア
      beforeUnloadListenersRef.current.forEach(cleanup => cleanup());
      beforeUnloadListenersRef.current = [];

      // beforeunload イベントリスナー
      const beforeUnloadHandler = () => {
        // 各保存操作を独立してエラーハンドリング
        try {
          dataStorage.savePetData(pet);
        } catch (error) {
          console.error('終了時保存に失敗:', error);
        }

        try {
          dataStorage.saveConversationHistory(conversationHistory);
        } catch (error) {
          console.error('終了時保存に失敗:', error);
        }
      };

      // visibilitychange イベントリスナー
      const visibilityChangeHandler = () => {
        if (document.hidden) {
          // 各保存操作を独立してエラーハンドリング
          try {
            dataStorage.savePetData(pet);
          } catch (error) {
            console.error('非表示時保存に失敗:', error);
          }

          try {
            dataStorage.saveConversationHistory(conversationHistory);
          } catch (error) {
            console.error('非表示時保存に失敗:', error);
          }
        }
      };

      // リスナーを追加
      window.addEventListener('beforeunload', beforeUnloadHandler);
      document.addEventListener('visibilitychange', visibilityChangeHandler);

      // クリーンアップ関数を保存
      const cleanup = () => {
        window.removeEventListener('beforeunload', beforeUnloadHandler);
        document.removeEventListener(
          'visibilitychange',
          visibilityChangeHandler
        );
      };
      beforeUnloadListenersRef.current.push(cleanup);
    },
    []
  );

  return {
    loadInitialData,
    saveData,
    setupAutoSave,
    clearAutoSave,
    setupBeforeUnloadSave,
  };
}
