/**
 * useCustomization.test.ts - カスタマイズHookのテスト
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCustomization } from './useCustomization';
import type { PetCustomization, Accessory } from '../types/Customization';
import { DEFAULT_CUSTOMIZATION, DEFAULT_ACCESSORIES } from '../types/Customization';
import * as customizationUtils from '../utils/customizationUtils';

// ユーティリティ関数のモック
vi.mock('../utils/customizationUtils', () => ({
  saveCustomizationData: vi.fn(),
  loadCustomizationData: vi.fn(),
  validatePetName: vi.fn(),
  validateColor: vi.fn(),
  validateAccessoryId: vi.fn(),
  addAccessoryToCustomization: vi.fn(),
  removeAccessoryFromCustomization: vi.fn(),
  createPreset: vi.fn(),
  resetCustomization: vi.fn(),
  unlockAccessory: vi.fn()
}));

describe('useCustomization', () => {
  const mockCustomization: PetCustomization = {
    name: 'テストペット',
    color: '#FF0000',
    accessories: [],
    unlocked: true,
    lastModified: new Date('2024-01-01')
  };

  const mockAccessory: Accessory = {
    id: 'test-hat',
    type: 'hat',
    name: 'テスト帽子',
    unlocked: true
  };

  const mockAvailableAccessories = [...DEFAULT_ACCESSORIES, mockAccessory];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // デフォルトのモック実装を設定
    vi.mocked(customizationUtils.loadCustomizationData).mockReturnValue({
      current: DEFAULT_CUSTOMIZATION,
      available: mockAvailableAccessories,
      presets: []
    });
    vi.mocked(customizationUtils.saveCustomizationData).mockReturnValue(true);
    vi.mocked(customizationUtils.validatePetName).mockReturnValue({ isValid: true });
    vi.mocked(customizationUtils.validateColor).mockReturnValue({ isValid: true });
    vi.mocked(customizationUtils.validateAccessoryId).mockReturnValue({ isValid: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('初期化', () => {
    it('should initialize with default customization state', () => {
      const { result } = renderHook(() => useCustomization());

      expect(result.current.customizationState.current).toEqual(DEFAULT_CUSTOMIZATION);
      expect(result.current.customizationState.available).toEqual(mockAvailableAccessories);
      expect(result.current.customizationState.presets).toEqual([]);
      expect(result.current.isPreviewMode).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should load initial customization data on mount', () => {
      renderHook(() => useCustomization());

      expect(customizationUtils.loadCustomizationData).toHaveBeenCalled();
    });

    it('should handle loading errors gracefully', () => {
      vi.mocked(customizationUtils.loadCustomizationData).mockImplementation(() => {
        throw new Error('Load error');
      });

      const { result } = renderHook(() => useCustomization());

      expect(result.current.error).toBe('カスタマイズデータの読み込みに失敗しました');
    });
  });

  describe('自動保存', () => {
    it('should enable auto-save by default', () => {
      const { result } = renderHook(() => useCustomization());

      // タイマーが進む前に状態を変更
      act(() => {
        result.current.updateName('新しい名前');
      });

      // タイマーを進める
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(customizationUtils.saveCustomizationData).toHaveBeenCalled();
    });

    it('should disable auto-save when option is false', () => {
      renderHook(() => useCustomization({ autoSave: false }));

      // タイマーを進める
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // 初期ロード以外では保存されない
      expect(customizationUtils.saveCustomizationData).not.toHaveBeenCalled();
    });

    it('should use custom save interval', () => {
      const { result } = renderHook(() => useCustomization({ saveInterval: 3000 }));

      act(() => {
        result.current.updateName('新しい名前');
      });

      // 3秒未満では保存されない
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(customizationUtils.saveCustomizationData).not.toHaveBeenCalled();

      // 3秒経過で保存される
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(customizationUtils.saveCustomizationData).toHaveBeenCalled();
    });
  });

  describe('名前更新', () => {
    it('should update pet name when valid', () => {
      const { result } = renderHook(() => useCustomization());

      act(() => {
        const validationResult = result.current.updateName('新しいペット名');
        expect(validationResult.isValid).toBe(true);
      });

      expect(result.current.customizationState.current.name).toBe('新しいペット名');
      expect(customizationUtils.validatePetName).toHaveBeenCalledWith('新しいペット名');
    });

    it('should reject invalid pet name', () => {
      vi.mocked(customizationUtils.validatePetName).mockReturnValue({
        isValid: false,
        error: '名前が無効です'
      });

      const { result } = renderHook(() => useCustomization());

      act(() => {
        const validationResult = result.current.updateName('');
        expect(validationResult.isValid).toBe(false);
      });

      expect(result.current.error).toBe('名前が無効です');
      expect(result.current.customizationState.current.name).toBe(DEFAULT_CUSTOMIZATION.name);
    });

    it('should update preview when in preview mode - simple test', () => {
      const { result } = renderHook(() => useCustomization());

      act(() => {
        result.current.startPreview();
      });

      expect(result.current.isPreviewMode).toBe(true);
      
      act(() => {
        const validationResult = result.current.updateName('プレビュー名');
        expect(validationResult.isValid).toBe(true);
      });

      // Check if the validation was called correctly
      expect(customizationUtils.validatePetName).toHaveBeenCalledWith('プレビュー名');
      
      // Check if preview name was updated
      expect(result.current.previewCustomization.name).toBe('プレビュー名');
      
      // Check if current state name is still the same
      expect(result.current.customizationState.current.name).toBe(DEFAULT_CUSTOMIZATION.name);
    });
  });

  describe('色更新', () => {
    it('should update pet color when valid', () => {
      const { result } = renderHook(() => useCustomization());

      act(() => {
        const validationResult = result.current.updateColor('#00FF00');
        expect(validationResult.isValid).toBe(true);
      });

      expect(result.current.customizationState.current.color).toBe('#00FF00');
      expect(customizationUtils.validateColor).toHaveBeenCalledWith('#00FF00');
    });

    it('should reject invalid color code', () => {
      vi.mocked(customizationUtils.validateColor).mockReturnValue({
        isValid: false,
        error: '無効な色コードです'
      });

      const { result } = renderHook(() => useCustomization());

      act(() => {
        const validationResult = result.current.updateColor('invalid');
        expect(validationResult.isValid).toBe(false);
      });

      expect(result.current.error).toBe('無効な色コードです');
    });
  });

  describe('アクセサリー管理', () => {
    beforeEach(() => {
      vi.mocked(customizationUtils.addAccessoryToCustomization).mockImplementation(
        (customization, accessory) => ({
          ...customization,
          accessories: [...customization.accessories, accessory],
          lastModified: new Date()
        })
      );

      vi.mocked(customizationUtils.removeAccessoryFromCustomization).mockImplementation(
        (customization, accessoryId) => ({
          ...customization,
          accessories: customization.accessories.filter(acc => acc.id !== accessoryId),
          lastModified: new Date()
        })
      );
    });

    it('should add accessory when valid', () => {
      // モックを再設定して available に test-hat を含める
      vi.mocked(customizationUtils.loadCustomizationData).mockReturnValue({
        current: DEFAULT_CUSTOMIZATION,
        available: mockAvailableAccessories,
        presets: []
      });

      const { result } = renderHook(() => useCustomization());

      act(() => {
        const addResult = result.current.addAccessory('test-hat');
        expect(addResult.success).toBe(true);
      });

      expect(customizationUtils.validateAccessoryId).toHaveBeenCalledWith('test-hat', mockAvailableAccessories);
      expect(customizationUtils.addAccessoryToCustomization).toHaveBeenCalled();
    });

    it('should reject invalid accessory', () => {
      vi.mocked(customizationUtils.validateAccessoryId).mockReturnValue({
        isValid: false,
        error: 'アクセサリーが無効です'
      });

      const { result } = renderHook(() => useCustomization());

      act(() => {
        const addResult = result.current.addAccessory('invalid-id');
        expect(addResult.success).toBe(false);
        expect(addResult.error).toBe('アクセサリーが無効です');
      });

      expect(result.current.error).toBe('アクセサリーが無効です');
    });

    it('should remove accessory', () => {
      const { result } = renderHook(() => useCustomization());

      act(() => {
        result.current.removeAccessory('test-hat');
      });

      expect(customizationUtils.removeAccessoryFromCustomization).toHaveBeenCalledWith(
        result.current.previewCustomization,
        'test-hat'
      );
    });

    it('should unlock accessory', () => {
      vi.mocked(customizationUtils.unlockAccessory).mockReturnValue([
        { ...mockAccessory, unlocked: true }
      ]);

      const { result } = renderHook(() => useCustomization());

      act(() => {
        result.current.unlockAccessoryById('test-hat');
      });

      expect(customizationUtils.unlockAccessory).toHaveBeenCalledWith('test-hat', mockAvailableAccessories);
    });
  });

  describe('プリセット管理', () => {
    beforeEach(() => {
      vi.mocked(customizationUtils.createPreset).mockImplementation(
        (customization, presetName) => ({
          ...customization,
          name: presetName,
          lastModified: new Date()
        })
      );
    });

    it('should save preset with valid name', () => {
      const { result } = renderHook(() => useCustomization());

      act(() => {
        const saveResult = result.current.saveAsPreset('マイプリセット');
        expect(saveResult.success).toBe(true);
      });

      expect(customizationUtils.validatePetName).toHaveBeenCalledWith('マイプリセット');
      expect(customizationUtils.createPreset).toHaveBeenCalled();
    });

    it('should reject preset with invalid name', () => {
      vi.mocked(customizationUtils.validatePetName).mockReturnValue({
        isValid: false,
        error: '無効なプリセット名です'
      });

      const { result } = renderHook(() => useCustomization());

      act(() => {
        const saveResult = result.current.saveAsPreset('');
        expect(saveResult.success).toBe(false);
        expect(saveResult.error).toBe('無効なプリセット名です');
      });
    });

    it('should load preset', () => {
      const { result } = renderHook(() => useCustomization());

      act(() => {
        result.current.loadPreset(mockCustomization);
      });

      expect(result.current.customizationState.current).toEqual(mockCustomization);
    });
  });

  describe('プレビューモード', () => {
    it('should start preview mode', () => {
      const { result } = renderHook(() => useCustomization());

      act(() => {
        result.current.startPreview();
      });

      expect(result.current.isPreviewMode).toBe(true);
      expect(result.current.previewCustomization).toEqual(result.current.customizationState.current);
    });

    it('should apply preview changes', () => {
      const { result } = renderHook(() => useCustomization());

      act(() => {
        result.current.startPreview();
        result.current.updateName('プレビュー名');
        result.current.applyPreview();
      });

      expect(result.current.isPreviewMode).toBe(false);
      expect(result.current.customizationState.current.name).toBe('プレビュー名');
    });

    it('should cancel preview changes', () => {
      const { result } = renderHook(() => useCustomization());
      const originalName = result.current.customizationState.current.name;

      act(() => {
        result.current.startPreview();
        result.current.updateName('プレビュー名');
        result.current.cancelPreview();
      });

      expect(result.current.isPreviewMode).toBe(false);
      expect(result.current.customizationState.current.name).toBe(originalName);
      expect(result.current.previewCustomization.name).toBe(originalName);
    });
  });

  describe('リセット機能', () => {
    it('should reset to default customization', () => {
      vi.mocked(customizationUtils.resetCustomization).mockReturnValue({
        ...DEFAULT_CUSTOMIZATION,
        lastModified: new Date()
      });

      const { result } = renderHook(() => useCustomization());

      act(() => {
        result.current.updateName('変更後の名前');
        result.current.resetToDefault();
      });

      expect(customizationUtils.resetCustomization).toHaveBeenCalled();
    });
  });

  describe('手動保存', () => {
    it('should save customization manually', () => {
      const { result } = renderHook(() => useCustomization());

      act(() => {
        const saveResult = result.current.saveCustomization();
        expect(saveResult).toBe(true);
      });

      expect(customizationUtils.saveCustomizationData).toHaveBeenCalledWith(
        result.current.customizationState
      );
    });

    it('should handle save errors', () => {
      vi.mocked(customizationUtils.saveCustomizationData).mockReturnValue(false);

      const { result } = renderHook(() => useCustomization());

      act(() => {
        const saveResult = result.current.saveCustomization();
        expect(saveResult).toBe(false);
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('should clear error after timeout', async () => {
      vi.mocked(customizationUtils.validatePetName).mockReturnValue({
        isValid: false,
        error: 'テストエラー'
      });

      const { result } = renderHook(() => useCustomization());

      act(() => {
        result.current.updateName('');
      });

      expect(result.current.error).toBe('テストエラー');

      // 5秒より少し長く経過後にエラーがクリアされる
      act(() => {
        vi.advanceTimersByTime(5100);
      });

      expect(result.current.error).toBeNull();
    });
  });
});