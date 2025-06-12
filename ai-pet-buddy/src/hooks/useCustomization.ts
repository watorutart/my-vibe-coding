/**
 * @file useCustomization.ts
 * @description ペットカスタマイズ管理Hook
 * 
 * 名前、色、アクセサリーの管理とプレビュー機能を提供します。
 * 自動保存、データ永続化、バリデーション機能を含みます。
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { 
  PetCustomization, 
  CustomizationState, 
  NameValidationResult,
  ColorValidationResult
} from '../types/Customization';
import { DEFAULT_CUSTOMIZATION, DEFAULT_ACCESSORIES } from '../types/Customization';
import {
  saveCustomizationData,
  loadCustomizationData,
  validatePetName,
  validateColor,
  validateAccessoryId,
  addAccessoryToCustomization,
  removeAccessoryFromCustomization,
  createPreset,
  resetCustomization,
  unlockAccessory
} from '../utils/customizationUtils';

interface UseCustomizationOptions {
  /** 自動保存を有効にするか */
  autoSave?: boolean;
  /** 自動保存の間隔（ミリ秒） */
  saveInterval?: number;
}

export interface UseCustomizationReturn {
  /** 現在のカスタマイズ状態 */
  customizationState: CustomizationState;
  /** プレビュー用の一時的なカスタマイズ */
  previewCustomization: PetCustomization;
  /** プレビューモードかどうか */
  isPreviewMode: boolean;
  /** データが読み込み中かどうか */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
  
  // アクション関数
  /** ペット名を更新 */
  updateName: (name: string) => NameValidationResult;
  /** ペット色を更新 */
  updateColor: (color: string) => ColorValidationResult;
  /** アクセサリーを追加 */
  addAccessory: (accessoryId: string) => { success: boolean; error?: string };
  /** アクセサリーを削除 */
  removeAccessory: (accessoryId: string) => void;
  /** プリセットを作成 */
  saveAsPreset: (presetName: string) => { success: boolean; error?: string };
  /** プリセットを読み込み */
  loadPreset: (preset: PetCustomization) => void;
  /** カスタマイズをリセット */
  resetToDefault: () => void;
  /** アクセサリーを解除 */
  unlockAccessoryById: (accessoryId: string) => void;
  
  // プレビュー関数
  /** プレビューモードを開始 */
  startPreview: () => void;
  /** プレビューを適用 */
  applyPreview: () => void;
  /** プレビューをキャンセル */
  cancelPreview: () => void;
  
  // 保存関数
  /** 手動保存 */
  saveCustomization: () => boolean;
  /** 初期データを読み込み */
  loadInitialCustomization: () => void;
}

/**
 * ペットカスタマイズ管理Hook
 * @param options 設定オプション
 * @returns カスタマイズ管理関数群
 */
export function useCustomization(options: UseCustomizationOptions = {}): UseCustomizationReturn {
  const { autoSave = true, saveInterval = 5000 } = options;
  
  // 状態管理
  const [customizationState, setCustomizationState] = useState<CustomizationState>({
    current: DEFAULT_CUSTOMIZATION,
    available: DEFAULT_ACCESSORIES,
    presets: []
  });
  
  const [previewCustomization, setPreviewCustomization] = useState<PetCustomization>(DEFAULT_CUSTOMIZATION);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 自動保存用のタイマー参照
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // エラーハンドリング
  const handleError = useCallback((message: string, error?: any) => {
    console.error(message, error);
    setError(message);
    
    // 既存のタイマーをクリア
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current as any);
    }
    
    // 一定時間後にエラーをクリア
    errorTimeoutRef.current = setTimeout(() => setError(null), 5000);
  }, []);
  
  // 初期データ読み込み
  const loadInitialCustomization = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loadedState = loadCustomizationData();
      setCustomizationState(loadedState);
      setPreviewCustomization(loadedState.current);
      console.log('カスタマイズデータを読み込みました');
    } catch (error) {
      handleError('カスタマイズデータの読み込みに失敗しました', error);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);
  
  // データ保存
  const saveCustomization = useCallback((): boolean => {
    try {
      const success = saveCustomizationData(customizationState);
      if (success) {
        lastSaveTimeRef.current = Date.now();
        console.log('カスタマイズデータを保存しました');
      }
      return success;
    } catch (error) {
      handleError('カスタマイズデータの保存に失敗しました', error);
      return false;
    }
  }, [customizationState, handleError]);
  
  // 自動保存設定
  useEffect(() => {
    if (!autoSave) return;
    
    // 既存のタイマーをクリア
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current as any);
    }
    
    // 新しいタイマーを設定
    autoSaveTimerRef.current = setInterval(() => {
      const now = Date.now();
      if (now - lastSaveTimeRef.current > saveInterval) {
        saveCustomization();
      }
    }, saveInterval);
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current as any);
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current as any);
      }
    };
  }, [autoSave, saveInterval, saveCustomization]);
  
  // 初期化
  useEffect(() => {
    loadInitialCustomization();
  }, [loadInitialCustomization]);
  
  // ペット名更新
  const updateName = useCallback((name: string): NameValidationResult => {
    const validation = validatePetName(name);
    
    if (validation.isValid) {
      const baseCustomization = isPreviewMode ? previewCustomization : customizationState.current;
      const updatedCustomization = {
        ...baseCustomization,
        name,
        lastModified: new Date()
      };
      
      if (isPreviewMode) {
        setPreviewCustomization(updatedCustomization);
      } else {
        setCustomizationState(prev => ({
          ...prev,
          current: updatedCustomization
        }));
      }
      
      setError(null);
    } else {
      setError(validation.error || '無効な名前です');
    }
    
    return validation;
  }, [previewCustomization, isPreviewMode, customizationState.current]);
  
  // 色更新
  const updateColor = useCallback((color: string): ColorValidationResult => {
    const validation = validateColor(color);
    
    if (validation.isValid) {
      const baseCustomization = isPreviewMode ? previewCustomization : customizationState.current;
      const updatedCustomization = {
        ...baseCustomization,
        color,
        lastModified: new Date()
      };
      
      if (isPreviewMode) {
        setPreviewCustomization(updatedCustomization);
      } else {
        setCustomizationState(prev => ({
          ...prev,
          current: updatedCustomization
        }));
      }
      
      setError(null);
    } else {
      setError(validation.error || '無効な色コードです');
    }
    
    return validation;
  }, [previewCustomization, isPreviewMode, customizationState.current]);
  
  // アクセサリー追加
  const addAccessory = useCallback((accessoryId: string): { success: boolean; error?: string } => {
    const validation = validateAccessoryId(accessoryId, customizationState.available);
    
    if (!validation.isValid) {
      setError(validation.error || 'アクセサリーの追加に失敗しました');
      return { success: false, error: validation.error };
    }
    
    const accessory = customizationState.available.find(acc => acc.id === accessoryId);
    if (!accessory) {
      const error = 'アクセサリーが見つかりません';
      setError(error);
      return { success: false, error };
    }
    
    const baseCustomization = isPreviewMode ? previewCustomization : customizationState.current;
    const updatedCustomization = addAccessoryToCustomization(baseCustomization, accessory);
    
    if (isPreviewMode) {
      setPreviewCustomization(updatedCustomization);
    } else {
      setCustomizationState(prev => ({
        ...prev,
        current: updatedCustomization
      }));
    }
    
    setError(null);
    return { success: true };
  }, [customizationState.available, previewCustomization, isPreviewMode, customizationState.current]);
  
  // アクセサリー削除
  const removeAccessory = useCallback((accessoryId: string) => {
    const baseCustomization = isPreviewMode ? previewCustomization : customizationState.current;
    const updatedCustomization = removeAccessoryFromCustomization(baseCustomization, accessoryId);
    
    if (isPreviewMode) {
      setPreviewCustomization(updatedCustomization);
    } else {
      setCustomizationState(prev => ({
        ...prev,
        current: updatedCustomization
      }));
    }
    
    setError(null);
  }, [previewCustomization, isPreviewMode, customizationState.current]);
  
  // プリセット保存
  const saveAsPreset = useCallback((presetName: string): { success: boolean; error?: string } => {
    const nameValidation = validatePetName(presetName);
    if (!nameValidation.isValid) {
      setError(nameValidation.error || '無効なプリセット名です');
      return { success: false, error: nameValidation.error };
    }
    
    const baseCustomization = isPreviewMode ? previewCustomization : customizationState.current;
    const preset = createPreset(baseCustomization, presetName);
    
    setCustomizationState(prev => ({
      ...prev,
      presets: [...prev.presets, preset]
    }));
    
    setError(null);
    return { success: true };
  }, [previewCustomization, isPreviewMode, customizationState.current]);
  
  // プリセット読み込み
  const loadPreset = useCallback((preset: PetCustomization) => {
    if (isPreviewMode) {
      setPreviewCustomization(preset);
    } else {
      setCustomizationState(prev => ({
        ...prev,
        current: preset
      }));
    }
    
    setError(null);
  }, [isPreviewMode]);
  
  // リセット
  const resetToDefault = useCallback(() => {
    const defaultCustomization = resetCustomization();
    
    if (isPreviewMode) {
      setPreviewCustomization(defaultCustomization);
    } else {
      setCustomizationState(prev => ({
        ...prev,
        current: defaultCustomization
      }));
    }
    
    setError(null);
  }, [isPreviewMode]);
  
  // アクセサリー解除
  const unlockAccessoryById = useCallback((accessoryId: string) => {
    const updatedAccessories = unlockAccessory(accessoryId, customizationState.available);
    
    setCustomizationState(prev => ({
      ...prev,
      available: updatedAccessories
    }));
    
    setError(null);
  }, [customizationState.available]);
  
  // プレビューモード開始
  const startPreview = useCallback(() => {
    setPreviewCustomization(customizationState.current);
    setIsPreviewMode(true);
  }, [customizationState.current]);
  
  // プレビュー適用
  const applyPreview = useCallback(() => {
    setCustomizationState(prev => ({
      ...prev,
      current: previewCustomization
    }));
    setIsPreviewMode(false);
    setError(null);
  }, [previewCustomization]);
  
  // プレビューキャンセル
  const cancelPreview = useCallback(() => {
    setPreviewCustomization(customizationState.current);
    setIsPreviewMode(false);
    setError(null);
  }, [customizationState.current]);
  
  return {
    customizationState,
    previewCustomization,
    isPreviewMode,
    isLoading,
    error,
    
    updateName,
    updateColor,
    addAccessory,
    removeAccessory,
    saveAsPreset,
    loadPreset,
    resetToDefault,
    unlockAccessoryById,
    
    startPreview,
    applyPreview,
    cancelPreview,
    
    saveCustomization,
    loadInitialCustomization
  };
}