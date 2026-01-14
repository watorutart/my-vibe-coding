/**
 * Customization.test.ts - 型定義テストの例
 */

import { describe, it, expect } from 'vitest';
import {
  PetCustomization,
  Accessory,
  CustomizationState,
  DEFAULT_CUSTOMIZATION,
  DEFAULT_ACCESSORIES,
  validatePetName,
  validateColor,
} from './Customization';

describe('Customization Types', () => {
  describe('PetCustomization', () => {
    it('should create valid pet customization object', () => {
      const customization: PetCustomization = {
        name: 'テストペット',
        color: '#FF6B6B',
        accessories: [],
        unlocked: true,
        lastModified: new Date(),
      };

      expect(customization.name).toBe('テストペット');
      expect(customization.color).toBe('#FF6B6B');
      expect(customization.accessories).toEqual([]);
      expect(customization.unlocked).toBe(true);
      expect(customization.lastModified).toBeInstanceOf(Date);
    });

    it('should create customization with accessories', () => {
      const accessories: Accessory[] = [
        {
          id: 'test-1',
          type: 'hat',
          name: 'テスト帽子',
          color: '#000000',
          unlocked: true,
        },
      ];

      const customization: PetCustomization = {
        name: 'アクセサリー付きペット',
        color: '#00FF00',
        accessories,
        unlocked: true,
        lastModified: new Date(),
      };

      expect(customization.accessories).toHaveLength(1);
      expect(customization.accessories[0].type).toBe('hat');
      expect(customization.accessories[0].name).toBe('テスト帽子');
    });
  });

  describe('Accessory', () => {
    it('should create valid accessory objects', () => {
      const accessory: Accessory = {
        id: 'acc-001',
        type: 'ribbon',
        name: 'プリティリボン',
        color: '#FF69B4',
        unlocked: true,
      };

      expect(accessory.id).toBe('acc-001');
      expect(accessory.type).toBe('ribbon');
      expect(accessory.name).toBe('プリティリボン');
      expect(accessory.color).toBe('#FF69B4');
      expect(accessory.unlocked).toBe(true);
    });

    it('should create accessory without color', () => {
      const accessory: Accessory = {
        id: 'acc-002',
        type: 'glasses',
        name: 'クールサングラス',
        unlocked: false,
      };

      expect(accessory.color).toBeUndefined();
      expect(accessory.unlocked).toBe(false);
    });

    it('should support all accessory types', () => {
      const types: Accessory['type'][] = [
        'hat',
        'ribbon',
        'glasses',
        'necklace',
      ];

      types.forEach(type => {
        const accessory: Accessory = {
          id: `test-${type}`,
          type,
          name: `テスト${type}`,
          unlocked: true,
        };
        expect(accessory.type).toBe(type);
      });
    });
  });

  describe('CustomizationState', () => {
    it('should create valid customization state', () => {
      const state: CustomizationState = {
        current: DEFAULT_CUSTOMIZATION,
        available: DEFAULT_ACCESSORIES,
        presets: [DEFAULT_CUSTOMIZATION],
      };

      expect(state.current).toEqual(DEFAULT_CUSTOMIZATION);
      expect(state.available).toEqual(DEFAULT_ACCESSORIES);
      expect(state.presets).toHaveLength(1);
    });
  });

  describe('Default Values', () => {
    it('should have valid default customization', () => {
      expect(DEFAULT_CUSTOMIZATION.name).toBe('Buddy');
      expect(DEFAULT_CUSTOMIZATION.color).toBe('#FF6B6B');
      expect(DEFAULT_CUSTOMIZATION.accessories).toEqual([]);
      expect(DEFAULT_CUSTOMIZATION.unlocked).toBe(true);
      expect(DEFAULT_CUSTOMIZATION.lastModified).toBeInstanceOf(Date);
    });

    it('should have valid default accessories', () => {
      expect(DEFAULT_ACCESSORIES).toHaveLength(4);

      const hatAccessory = DEFAULT_ACCESSORIES.find(acc => acc.type === 'hat');
      expect(hatAccessory).toBeDefined();
      expect(hatAccessory?.name).toBe('麦わら帽子');
      expect(hatAccessory?.unlocked).toBe(true);

      const ribbonAccessory = DEFAULT_ACCESSORIES.find(
        acc => acc.type === 'ribbon'
      );
      expect(ribbonAccessory).toBeDefined();
      expect(ribbonAccessory?.name).toBe('赤いリボン');

      const glassesAccessory = DEFAULT_ACCESSORIES.find(
        acc => acc.type === 'glasses'
      );
      expect(glassesAccessory).toBeDefined();
      expect(glassesAccessory?.unlocked).toBe(false);

      const necklaceAccessory = DEFAULT_ACCESSORIES.find(
        acc => acc.type === 'necklace'
      );
      expect(necklaceAccessory).toBeDefined();
      expect(necklaceAccessory?.unlocked).toBe(false);
    });
  });

  describe('validatePetName', () => {
    it('should validate valid pet names', () => {
      expect(validatePetName('マイペット').isValid).toBe(true);
      expect(validatePetName('A').isValid).toBe(true);
      expect(validatePetName('二十文字以内のペット名前').isValid).toBe(true);
      expect(validatePetName('Pet123').isValid).toBe(true);
      expect(validatePetName('ペット_名前').isValid).toBe(true);
    });

    it('should reject invalid pet names', () => {
      // 空文字列
      const emptyResult = validatePetName('');
      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.error).toBe('名前を入力してください');

      // 空白のみ
      const whitespaceResult = validatePetName('   ');
      expect(whitespaceResult.isValid).toBe(false);
      expect(whitespaceResult.error).toBe('名前を入力してください');

      // 20文字超過
      const longResult = validatePetName(
        '二十一文字を超える非常に長いペット名前です'
      );
      expect(longResult.isValid).toBe(false);
      expect(longResult.error).toBe('名前は20文字以内で入力してください');

      // 無効な文字
      const invalidCharsResult = validatePetName('Pet<Name>');
      expect(invalidCharsResult.isValid).toBe(false);
      expect(invalidCharsResult.error).toBe('使用できない文字が含まれています');
    });

    it('should reject names with special characters', () => {
      const invalidChars = ['<', '>', '"', '/', '\\', '|', '?', '*'];

      invalidChars.forEach(char => {
        const result = validatePetName(`Pet${char}Name`);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('使用できない文字が含まれています');
      });
    });
  });

  describe('validateColor', () => {
    it('should validate valid color codes', () => {
      expect(validateColor('#FF6B6B').isValid).toBe(true);
      expect(validateColor('#000000').isValid).toBe(true);
      expect(validateColor('#ffffff').isValid).toBe(true);
      expect(validateColor('#ABC').isValid).toBe(true);
      expect(validateColor('#123').isValid).toBe(true);
      expect(validateColor('#a1b2c3').isValid).toBe(true);
    });

    it('should reject invalid color codes', () => {
      // 空文字列
      const emptyResult = validateColor('');
      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.error).toBe('カラーコードを入力してください');

      // #なし
      const noHashResult = validateColor('FF6B6B');
      expect(noHashResult.isValid).toBe(false);
      expect(noHashResult.error).toBe(
        '有効なHEXカラーコード（例: #FF6B6B）を入力してください'
      );

      // 無効な文字
      const invalidCharsResult = validateColor('#GGG');
      expect(invalidCharsResult.isValid).toBe(false);
      expect(invalidCharsResult.error).toBe(
        '有効なHEXカラーコード（例: #FF6B6B）を入力してください'
      );

      // 長さが合わない
      const wrongLengthResult = validateColor('#FF6B');
      expect(wrongLengthResult.isValid).toBe(false);
      expect(wrongLengthResult.error).toBe(
        '有効なHEXカラーコード（例: #FF6B6B）を入力してください'
      );

      // 長すぎる
      const tooLongResult = validateColor('#FF6B6B6B');
      expect(tooLongResult.isValid).toBe(false);
      expect(tooLongResult.error).toBe(
        '有効なHEXカラーコード（例: #FF6B6B）を入力してください'
      );
    });
  });
});
