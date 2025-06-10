/**
 * customizationUtils.test.ts - カスタマイズユーティリティ関数のテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
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
  getColorPalette,
  unlockAccessory
} from './customizationUtils';
import {
  DEFAULT_CUSTOMIZATION,
  DEFAULT_ACCESSORIES,
  type PetCustomization,
  type Accessory,
  type CustomizationState
} from '../types/Customization';

// localStorage のモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

// globalThis.localStorage = localStorageMock as any;
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('customizationUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('saveCustomizationData', () => {
    it('should save customization data successfully', () => {
      const testState: CustomizationState = {
        current: DEFAULT_CUSTOMIZATION,
        available: DEFAULT_ACCESSORIES,
        presets: []
      };

      const result = saveCustomizationData(testState);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(3);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ai-pet-buddy-customization-data',
        JSON.stringify(testState.current)
      );
    });

    it('should handle save errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const testState: CustomizationState = {
        current: DEFAULT_CUSTOMIZATION,
        available: DEFAULT_ACCESSORIES,
        presets: []
      };

      const result = saveCustomizationData(testState);

      expect(result).toBe(false);
    });
  });

  describe('loadCustomizationData', () => {
    it('should load customization data successfully', () => {
      const mockCustomization = {
        ...DEFAULT_CUSTOMIZATION,
        name: 'テストペット',
        color: '#00FF00',
        lastModified: new Date().toISOString()
      };

      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(mockCustomization))
        .mockReturnValueOnce(JSON.stringify(DEFAULT_ACCESSORIES))
        .mockReturnValueOnce(JSON.stringify([]));

      const result = loadCustomizationData();

      expect(result.current.name).toBe('テストペット');
      expect(result.current.color).toBe('#00FF00');
      expect(result.current.lastModified).toBeInstanceOf(Date);
      expect(result.available).toEqual(DEFAULT_ACCESSORIES);
      expect(result.presets).toEqual([]);
    });

    it('should return default data when storage is empty', () => {
      const result = loadCustomizationData();

      expect(result.current).toEqual(DEFAULT_CUSTOMIZATION);
      expect(result.available).toEqual(DEFAULT_ACCESSORIES);
      expect(result.presets).toEqual([]);
    });

    it('should handle invalid data gracefully', () => {
      localStorageMock.getItem
        .mockReturnValueOnce('invalid json')
        .mockReturnValueOnce('invalid json')
        .mockReturnValueOnce('invalid json');

      const result = loadCustomizationData();

      expect(result.current).toEqual(DEFAULT_CUSTOMIZATION);
      expect(result.available).toEqual(DEFAULT_ACCESSORIES);
      expect(result.presets).toEqual([]);
    });

    it('should filter invalid customization data', () => {
      const invalidCustomization = {
        name: 123, // 無効な型
        color: '#FF0000',
        accessories: [],
        unlocked: true,
        lastModified: new Date().toISOString()
      };

      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(invalidCustomization))
        .mockReturnValueOnce(JSON.stringify(DEFAULT_ACCESSORIES))
        .mockReturnValueOnce(JSON.stringify([]));

      const result = loadCustomizationData();

      expect(result.current).toEqual(DEFAULT_CUSTOMIZATION);
    });
  });

  describe('validatePetName', () => {
    it('should validate valid pet names', () => {
      expect(validatePetName('テストペット').isValid).toBe(true);
      expect(validatePetName('Pet123').isValid).toBe(true);
      expect(validatePetName('二十文字以内のペット名前').isValid).toBe(true);
    });

    it('should reject invalid pet names', () => {
      expect(validatePetName('').isValid).toBe(false);
      expect(validatePetName('   ').isValid).toBe(false);
      expect(validatePetName('二十一文字を超える非常に長いペット名前です').isValid).toBe(false);
      expect(validatePetName('Pet<Name>').isValid).toBe(false);
    });
  });

  describe('validateColor', () => {
    it('should validate valid color codes', () => {
      expect(validateColor('#FF6B6B').isValid).toBe(true);
      expect(validateColor('#000000').isValid).toBe(true);
      expect(validateColor('#ABC').isValid).toBe(true);
    });

    it('should reject invalid color codes', () => {
      expect(validateColor('').isValid).toBe(false);
      expect(validateColor('FF6B6B').isValid).toBe(false);
      expect(validateColor('#GGG').isValid).toBe(false);
      expect(validateColor('#FF6B').isValid).toBe(false);
    });
  });

  describe('validateAccessoryId', () => {
    const mockAccessories: Accessory[] = [
      {
        id: 'acc-1',
        type: 'hat',
        name: 'テスト帽子',
        unlocked: true
      },
      {
        id: 'acc-2',
        type: 'ribbon',
        name: 'ロック済みリボン',
        unlocked: false
      }
    ];

    it('should validate unlocked accessory', () => {
      const result = validateAccessoryId('acc-1', mockAccessories);
      expect(result.isValid).toBe(true);
    });

    it('should reject locked accessory', () => {
      const result = validateAccessoryId('acc-2', mockAccessories);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('このアクセサリーはまだ解除されていません');
    });

    it('should reject non-existent accessory', () => {
      const result = validateAccessoryId('non-existent', mockAccessories);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('指定されたアクセサリーは存在しません');
    });

    it('should reject empty id', () => {
      const result = validateAccessoryId('', mockAccessories);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('アクセサリーIDが指定されていません');
    });
  });

  describe('addAccessoryToCustomization', () => {
    it('should add accessory to customization', () => {
      const customization: PetCustomization = {
        ...DEFAULT_CUSTOMIZATION,
        accessories: []
      };

      const accessory: Accessory = {
        id: 'hat-1',
        type: 'hat',
        name: 'テスト帽子',
        unlocked: true
      };

      const result = addAccessoryToCustomization(customization, accessory);

      expect(result.accessories).toHaveLength(1);
      expect(result.accessories[0]).toEqual(accessory);
      expect(result.lastModified).toBeInstanceOf(Date);
    });

    it('should replace accessory of same type', () => {
      const existingHat: Accessory = {
        id: 'hat-old',
        type: 'hat',
        name: '古い帽子',
        unlocked: true
      };

      const customization: PetCustomization = {
        ...DEFAULT_CUSTOMIZATION,
        accessories: [existingHat]
      };

      const newHat: Accessory = {
        id: 'hat-new',
        type: 'hat',
        name: '新しい帽子',
        unlocked: true
      };

      const result = addAccessoryToCustomization(customization, newHat);

      expect(result.accessories).toHaveLength(1);
      expect(result.accessories[0].id).toBe('hat-new');
    });

    it('should keep accessories of different types', () => {
      const existingRibbon: Accessory = {
        id: 'ribbon-1',
        type: 'ribbon',
        name: 'リボン',
        unlocked: true
      };

      const customization: PetCustomization = {
        ...DEFAULT_CUSTOMIZATION,
        accessories: [existingRibbon]
      };

      const hat: Accessory = {
        id: 'hat-1',
        type: 'hat',
        name: '帽子',
        unlocked: true
      };

      const result = addAccessoryToCustomization(customization, hat);

      expect(result.accessories).toHaveLength(2);
      expect(result.accessories.some(acc => acc.id === 'ribbon-1')).toBe(true);
      expect(result.accessories.some(acc => acc.id === 'hat-1')).toBe(true);
    });
  });

  describe('removeAccessoryFromCustomization', () => {
    it('should remove accessory by id', () => {
      const accessories: Accessory[] = [
        {
          id: 'hat-1',
          type: 'hat',
          name: '帽子',
          unlocked: true
        },
        {
          id: 'ribbon-1',
          type: 'ribbon',
          name: 'リボン',
          unlocked: true
        }
      ];

      const customization: PetCustomization = {
        ...DEFAULT_CUSTOMIZATION,
        accessories
      };

      const result = removeAccessoryFromCustomization(customization, 'hat-1');

      expect(result.accessories).toHaveLength(1);
      expect(result.accessories[0].id).toBe('ribbon-1');
      expect(result.lastModified).toBeInstanceOf(Date);
    });

    it('should handle non-existent accessory gracefully', () => {
      const customization: PetCustomization = {
        ...DEFAULT_CUSTOMIZATION,
        accessories: []
      };

      const result = removeAccessoryFromCustomization(customization, 'non-existent');

      expect(result.accessories).toHaveLength(0);
    });
  });

  describe('createPreset', () => {
    it('should create preset with new name', () => {
      const customization: PetCustomization = {
        ...DEFAULT_CUSTOMIZATION,
        name: 'CurrentPet',
        color: '#FF0000'
      };

      const result = createPreset(customization, 'MyPreset');

      expect(result.name).toBe('MyPreset');
      expect(result.color).toBe('#FF0000');
      expect(result.lastModified).toBeInstanceOf(Date);
    });
  });

  describe('resetCustomization', () => {
    it('should return default customization with new timestamp', () => {
      const result = resetCustomization();

      expect(result.name).toBe(DEFAULT_CUSTOMIZATION.name);
      expect(result.color).toBe(DEFAULT_CUSTOMIZATION.color);
      expect(result.accessories).toEqual([]);
      expect(result.unlocked).toBe(true);
      expect(result.lastModified).toBeInstanceOf(Date);
    });
  });

  describe('getColorPalette', () => {
    it('should return array of color codes', () => {
      const palette = getColorPalette();

      expect(Array.isArray(palette)).toBe(true);
      expect(palette.length).toBeGreaterThan(0);
      
      // すべてが有効なHEXカラーコードか確認
      palette.forEach(color => {
        expect(color).toMatch(/^#[A-Fa-f0-9]{6}$/);
      });
    });

    it('should include expected default colors', () => {
      const palette = getColorPalette();

      expect(palette).toContain('#FF6B6B');
      expect(palette).toContain('#4ECDC4');
      expect(palette).toContain('#45B7D1');
    });
  });

  describe('unlockAccessory', () => {
    it('should unlock specified accessory', () => {
      const accessories: Accessory[] = [
        {
          id: 'acc-1',
          type: 'hat',
          name: '帽子',
          unlocked: false
        },
        {
          id: 'acc-2',
          type: 'ribbon',
          name: 'リボン',
          unlocked: true
        }
      ];

      const result = unlockAccessory('acc-1', accessories);

      expect(result[0].unlocked).toBe(true);
      expect(result[1].unlocked).toBe(true);
    });

    it('should not affect other accessories', () => {
      const accessories: Accessory[] = [
        {
          id: 'acc-1',
          type: 'hat',
          name: '帽子',
          unlocked: false
        },
        {
          id: 'acc-2',
          type: 'ribbon',
          name: 'リボン',
          unlocked: false
        }
      ];

      const result = unlockAccessory('acc-1', accessories);

      expect(result[0].unlocked).toBe(true);
      expect(result[1].unlocked).toBe(false);
    });

    it('should handle non-existent accessory gracefully', () => {
      const accessories: Accessory[] = [
        {
          id: 'acc-1',
          type: 'hat',
          name: '帽子',
          unlocked: false
        }
      ];

      const result = unlockAccessory('non-existent', accessories);

      expect(result).toEqual(accessories);
    });
  });
});