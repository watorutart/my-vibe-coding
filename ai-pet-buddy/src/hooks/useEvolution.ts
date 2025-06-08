import { useCallback, useEffect, useState } from 'react';
import type { EvolutionEvent, EvolutionProgress } from '../types/Evolution';
import type { Pet } from '../types/Pet';
import {
    calculateEvolutionProgress,
    checkEvolutionRequirements,
    createInitialEvolutionProgress,
    EVOLUTION_STAGES,
    evolvepet,
    getCurrentEvolutionStage,
    getNextEvolutionStage,
    syncProgressWithPet
} from '../utils/evolutionEngine';

export interface UseEvolutionReturn {
  /** 現在の進化プログレス */
  evolutionProgress: EvolutionProgress;
  /** 現在の進化ステージ */
  currentStage: ReturnType<typeof getCurrentEvolutionStage>;
  /** 次の進化ステージ（最終ステージの場合はnull） */
  nextStage: ReturnType<typeof getNextEvolutionStage>;
  /** 次の進化までの進捗率（0-100） */
  progressToNext: number;
  /** 進化可能かどうか */
  canEvolveNext: boolean;
  /** 進化要件の詳細 */
  evolutionRequirements: ReturnType<typeof checkEvolutionRequirements> | null;
  /** 最新の進化イベント */
  latestEvolutionEvent: EvolutionEvent | null;
  /** 進化を実行する関数 */
  triggerEvolution: () => EvolutionEvent | null;
  /** 進化プログレスをリセットする関数 */
  resetEvolutionProgress: () => void;
  /** 進化履歴を取得する関数 */
  getEvolutionHistory: () => EvolutionEvent[];
}

/**
 * 進化システムを管理するカスタムフック
 * @param pet - ペットオブジェクト
 * @param onPetUpdate - ペット更新時のコールバック関数
 * @param initialProgress - 初期進化プログレス（省略可能）
 * @returns 進化システムの状態と操作関数
 */
export function useEvolution(
  pet: Pet,
  onPetUpdate: (updatedPet: Pet) => void,
  initialProgress?: EvolutionProgress
): UseEvolutionReturn {
  const [evolutionProgress, setEvolutionProgress] = useState<EvolutionProgress>(
    () => syncProgressWithPet(pet, initialProgress)
  );
  
  const [latestEvolutionEvent, setLatestEvolutionEvent] = useState<EvolutionEvent | null>(null);

  // 現在の進化ステージを計算（プログレスを基に）
  const currentStage = EVOLUTION_STAGES.find((stage) => stage.id === evolutionProgress.currentStage) || EVOLUTION_STAGES[0];
  
  // 次の進化ステージを計算
  const nextStage = getNextEvolutionStage(pet, evolutionProgress);
  
  // 次の進化までの進捗率を計算
  const progressToNext = calculateEvolutionProgress(pet, evolutionProgress);
  
  // 進化要件をチェック
  const evolutionRequirements = nextStage ? checkEvolutionRequirements(pet, nextStage) : null;
  const canEvolveNext = evolutionRequirements?.canEvolve ?? false;

  /**
   * 進化を実行する関数
   */
  const triggerEvolution = useCallback((): EvolutionEvent | null => {
    if (!canEvolveNext) {
      console.warn('進化の条件が満たされていません');
      return null;
    }

    const result = evolvepet(pet, evolutionProgress);
    
    if (result.event) {
      // ペットの状態を更新
      onPetUpdate(result.pet);
      
      // 進化プログレスを更新
      setEvolutionProgress(result.progress);
      
      // 最新の進化イベントを設定
      setLatestEvolutionEvent(result.event);
      
      console.log(`🎉 進化成功: ${result.event.fromStage} → ${result.event.toStage}`);
      
      return result.event;
    }
    
    return null;
  }, [pet, evolutionProgress, canEvolveNext, onPetUpdate]);

  /**
   * 進化プログレスをリセットする関数
   */
  const resetEvolutionProgress = useCallback(() => {
    const newProgress = createInitialEvolutionProgress();
    setEvolutionProgress(newProgress);
    setLatestEvolutionEvent(null);
    console.log('進化プログレスをリセットしました');
  }, []);

  /**
   * 進化履歴を取得する関数
   */
  const getEvolutionHistory = useCallback((): EvolutionEvent[] => {
    return evolutionProgress.evolutionHistory;
  }, [evolutionProgress.evolutionHistory]);

  // ペットの変更時に自動進化チェック
  useEffect(() => {
    if (canEvolveNext) {
      console.log(`進化可能: ${currentStage.name} → ${nextStage?.name}`);
    }
  }, [canEvolveNext, currentStage.name, nextStage?.name]);

  // 進化プログレスの変更をログ出力
  useEffect(() => {
    if (latestEvolutionEvent) {
      console.log('進化イベント:', latestEvolutionEvent);
    }
  }, [latestEvolutionEvent]);

  return {
    evolutionProgress,
    currentStage,
    nextStage,
    progressToNext,
    canEvolveNext,
    evolutionRequirements,
    latestEvolutionEvent,
    triggerEvolution,
    resetEvolutionProgress,
    getEvolutionHistory
  };
}
