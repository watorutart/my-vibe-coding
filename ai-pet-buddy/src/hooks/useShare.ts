/**
 * シェア機能管理Hook
 * スクリーンショット撮影とSNSシェア機能を提供
 */

import { useState, useCallback, useRef } from 'react';
import { captureElement, generateStatsCard, addWatermark } from '../utils/imageGenerator';
import { shareToSocial, downloadImage, generateShareText, saveShareData } from '../utils/shareUtils';
import type {
  ShareData,
  ScreenshotOptions,
  SocialShareOptions,
  ShareResult,
  StatsCardData,
  WatermarkConfig,
  ImageGenerationConfig,
  ShareHistoryEntry
} from '../types/Share';

/**
 * useShareの戻り値型
 */
export interface UseShareReturn {
  /** スクリーンショット撮影 */
  captureScreenshot: (element: HTMLElement, options?: ScreenshotOptions) => Promise<string>;
  /** SNSシェア */
  shareToSocial: (options: SocialShareOptions) => Promise<ShareResult>;
  /** 画像ダウンロード */
  downloadImage: (dataUrl: string, filename?: string) => void;
  /** シェアデータ生成 */
  generateShareData: (imageDataUrl: string, statsData?: StatsCardData) => ShareData;
  /** 統計カード生成 */
  generateStatsCard: (statsData: StatsCardData, config?: ImageGenerationConfig) => Promise<string>;
  /** ウォーターマーク追加 */
  addWatermark: (imageDataUrl: string, config?: WatermarkConfig) => Promise<string>;
  /** シェア中フラグ */
  isSharing: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** 最後のシェア画像URL */
  lastShareImageUrl: string | null;
  /** シェア履歴 */
  shareHistory: ShareHistoryEntry[];
  /** エラーをクリア */
  clearError: () => void;
  /** 履歴をクリア */
  clearHistory: () => void;
}

/**
 * シェア機能Hook
 * @returns UseShareReturn
 */
export const useShare = (): UseShareReturn => {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastShareImageUrl, setLastShareImageUrl] = useState<string | null>(null);
  const [shareHistory, setShareHistory] = useState<ShareHistoryEntry[]>([]);
  
  // シェア履歴の参照を保持
  const shareHistoryRef = useRef<ShareHistoryEntry[]>([]);

  /**
   * エラーをクリア
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 履歴をクリア
   */
  const clearHistory = useCallback(() => {
    setShareHistory([]);
    shareHistoryRef.current = [];
  }, []);

  /**
   * 履歴にエントリを追加
   */
  const addToHistory = useCallback((entry: ShareHistoryEntry) => {
    const newHistory = [entry, ...shareHistoryRef.current].slice(0, 50); // 最大50件保持
    shareHistoryRef.current = newHistory;
    setShareHistory(newHistory);
  }, []);

  /**
   * スクリーンショット撮影
   */
  const captureScreenshot = useCallback(async (
    element: HTMLElement,
    options: ScreenshotOptions = {}
  ): Promise<string> => {
    try {
      setIsSharing(true);
      setError(null);
      
      const imageDataUrl = await captureElement(element, options);
      setLastShareImageUrl(imageDataUrl);
      
      return imageDataUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'スクリーンショットの撮影に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSharing(false);
    }
  }, []);

  /**
   * SNSシェア実行
   */
  const performSocialShare = useCallback(async (
    options: SocialShareOptions
  ): Promise<ShareResult> => {
    try {
      setIsSharing(true);
      setError(null);
      
      const result = await shareToSocial(options);
      
      // 履歴に追加
      const historyEntry: ShareHistoryEntry = {
        timestamp: Date.now(),
        platform: options.platform,
        content: generateShareText(options.shareData, options.platform),
        imageUrl: options.shareData.imageDataUrl,
        success: result.success
      };
      addToHistory(historyEntry);
      
      if (result.success) {
        // 成功時はシェアデータを保存
        saveShareData(options.shareData, `share_${Date.now()}`);
      } else {
        setError(result.error || 'シェアに失敗しました');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'シェアに失敗しました';
      setError(errorMessage);
      
      // エラーも履歴に追加
      const historyEntry: ShareHistoryEntry = {
        timestamp: Date.now(),
        platform: options.platform,
        content: generateShareText(options.shareData, options.platform),
        imageUrl: options.shareData.imageDataUrl,
        success: false
      };
      addToHistory(historyEntry);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsSharing(false);
    }
  }, [addToHistory]);

  /**
   * 画像ダウンロード実行
   */
  const performDownloadImage = useCallback((dataUrl: string, filename?: string) => {
    try {
      setError(null);
      downloadImage(dataUrl, filename);
      
      // ダウンロード履歴を追加
      const historyEntry: ShareHistoryEntry = {
        timestamp: Date.now(),
        platform: 'line', // ダウンロードは便宜上LINEとして記録
        content: 'Image downloaded',
        imageUrl: dataUrl,
        success: true
      };
      addToHistory(historyEntry);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ダウンロードに失敗しました';
      setError(errorMessage);
    }
  }, [addToHistory]);

  /**
   * シェアデータ生成
   */
  const generateShareData = useCallback((
    imageDataUrl: string,
    statsData?: StatsCardData
  ): ShareData => {
    const baseData: ShareData = {
      imageDataUrl,
      title: 'AI Pet Buddy',
      description: 'かわいいペットと一緒に遊んでいます！',
      hashtags: ['#AIPetBuddy', '#VirtualPet', '#Gaming']
    };

    if (statsData) {
      baseData.title = `${statsData.petName}のペット記録`;
      baseData.description = `レベル${statsData.level}の${statsData.evolutionStage}に成長しました！`;
      baseData.stats = {
        level: statsData.level,
        happiness: 85, // デフォルト値（実際は現在のペット状態から取得）
        energy: 75,
        experience: 1000,
        evolutionStage: statsData.evolutionStage
      };
      
      if (statsData.specialTitle) {
        baseData.description += ` 称号：${statsData.specialTitle}`;
      }
    }

    return baseData;
  }, []);

  /**
   * 統計カード生成
   */
  const createStatsCard = useCallback(async (
    statsData: StatsCardData,
    config: ImageGenerationConfig = {}
  ): Promise<string> => {
    try {
      setIsSharing(true);
      setError(null);
      
      const imageDataUrl = await generateStatsCard(statsData, config);
      setLastShareImageUrl(imageDataUrl);
      
      return imageDataUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '統計カードの生成に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSharing(false);
    }
  }, []);

  /**
   * ウォーターマーク追加
   */
  const performAddWatermark = useCallback(async (
    imageDataUrl: string,
    config: WatermarkConfig = { text: 'AI Pet Buddy' }
  ): Promise<string> => {
    try {
      setIsSharing(true);
      setError(null);
      
      const watermarkedImageUrl = await addWatermark(imageDataUrl, config);
      setLastShareImageUrl(watermarkedImageUrl);
      
      return watermarkedImageUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ウォーターマークの追加に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSharing(false);
    }
  }, []);

  return {
    captureScreenshot,
    shareToSocial: performSocialShare,
    downloadImage: performDownloadImage,
    generateShareData,
    generateStatsCard: createStatsCard,
    addWatermark: performAddWatermark,
    isSharing,
    error,
    lastShareImageUrl,
    shareHistory,
    clearError,
    clearHistory
  };
};