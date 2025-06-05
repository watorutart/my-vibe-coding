/**
 * @file notificationSound.test.ts
 * @description 音声通知システムのテスト（TDD方式）
 * 
 * macOSの afplay /Library/Sounds/Hero.aiff コマンドを使用した
 * 実際の音声出力機能をテストします。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { playNotificationSound, NotificationSoundError } from './notificationSound';

// モックの型定義
type MockedFunction<T extends (...args: any[]) => any> = T & {
  mockResolvedValue: (value: any) => MockedFunction<T>;
  mockRejectedValue: (value: any) => MockedFunction<T>;
  mockClear: () => void;
};

// グローバルな exec 関数をモック
const mockExec = vi.fn() as MockedFunction<(...args: any[]) => Promise<any>>;

// Node.js child_process モジュールのモック
vi.mock('child_process', () => ({
  exec: mockExec
}));

describe('音声通知システム', () => {
  beforeEach(() => {
    mockExec.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('playNotificationSound', () => {
    it('macOSでHero.aiffサウンドファイルが正常に再生される', async () => {
      // Arrange
      mockExec.mockResolvedValue({ stdout: '', stderr: '' });

      // Act
      await playNotificationSound();

      // Assert
      expect(mockExec).toHaveBeenCalledWith('afplay /Library/Sounds/Hero.aiff');
      expect(mockExec).toHaveBeenCalledTimes(1);
    });

    it('音声ファイルが存在しない場合にエラーをスローする', async () => {
      // Arrange
      const errorMessage = "afplay: can't open '/Library/Sounds/Hero.aiff'";
      mockExec.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(playNotificationSound()).rejects.toThrow(NotificationSoundError);
      await expect(playNotificationSound()).rejects.toThrow('音声通知の再生に失敗しました');
      expect(mockExec).toHaveBeenCalledWith('afplay /Library/Sounds/Hero.aiff');
    });

    it('macOS以外の環境では警告メッセージを出力する', async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // プラットフォーム検出をモック
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        configurable: true
      });

      // Act
      await playNotificationSound();

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('音声通知はmacOSでのみサポートされています');
      expect(mockExec).not.toHaveBeenCalled();

      // Cleanup
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        configurable: true
      });
      consoleSpy.mockRestore();
    });

    it('複数回連続で音声通知を再生できる', async () => {
      // Arrange
      mockExec.mockResolvedValue({ stdout: '', stderr: '' });

      // Act
      await playNotificationSound();
      await playNotificationSound();
      await playNotificationSound();

      // Assert
      expect(mockExec).toHaveBeenCalledTimes(3);
      expect(mockExec).toHaveBeenNthCalledWith(1, 'afplay /Library/Sounds/Hero.aiff');
      expect(mockExec).toHaveBeenNthCalledWith(2, 'afplay /Library/Sounds/Hero.aiff');
      expect(mockExec).toHaveBeenNthCalledWith(3, 'afplay /Library/Sounds/Hero.aiff');
    });

    it('音声再生中にエラーが発生した場合、適切なエラーメッセージを含む', async () => {
      // Arrange
      const systemError = new Error("command not found: afplay");
      mockExec.mockRejectedValue(systemError);

      // Act & Assert
      try {
        await playNotificationSound();
        fail('エラーがスローされるべきです');
      } catch (error) {
        expect(error).toBeInstanceOf(NotificationSoundError);
        expect(error.message).toBe('音声通知の再生に失敗しました');
        expect((error as NotificationSoundError).originalError).toBe(systemError);
      }
    });

    it('音声再生の実行時間が適切な範囲内である', async () => {
      // Arrange
      mockExec.mockResolvedValue({ stdout: '', stderr: '' });
      
      // Act
      const startTime = Date.now();
      await playNotificationSound();
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Assert - 音声コマンドの実行は瞬時であるべき（100ms未満）
      expect(executionTime).toBeLessThan(100);
      expect(mockExec).toHaveBeenCalledTimes(1);
    });
  });

  describe('NotificationSoundError', () => {
    it('カスタムエラークラスが正しく作成される', () => {
      // Arrange
      const originalError = new Error('テストエラー');
      
      // Act
      const soundError = new NotificationSoundError('音声エラー', originalError);

      // Assert
      expect(soundError).toBeInstanceOf(Error);
      expect(soundError).toBeInstanceOf(NotificationSoundError);
      expect(soundError.message).toBe('音声エラー');
      expect(soundError.originalError).toBe(originalError);
      expect(soundError.name).toBe('NotificationSoundError');
    });
  });
});
