/**
 * @file notificationSound.ts
 * @description 音声通知システムの実装
 * 
 * macOSの afplay /Library/Sounds/Hero.aiff コマンドを使用して
 * 実際の音声出力を行います。Agent操作における重要な通知時に使用されます。
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 音声通知エラーのカスタムクラス
 */
export class NotificationSoundError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NotificationSoundError';
  }
}

/**
 * 音声通知を再生する関数
 * macOSの Hero.aiff サウンドファイルを使用
 * 
 * @throws {NotificationSoundError} 音声再生に失敗した場合
 */
export async function playNotificationSound(): Promise<void> {
  // macOS以外の環境では警告を出して終了
  if (process.platform !== 'darwin') {
    console.warn('音声通知はmacOSでのみサポートされています');
    return;
  }

  try {
    // macOSの標準サウンドファイル Hero.aiff を再生
    await execAsync('afplay /Library/Sounds/Hero.aiff');
  } catch (error) {
    // エラーをラップして詳細情報を保持
    throw new NotificationSoundError(
      '音声通知の再生に失敗しました',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * 🔔 NOTIFICATION マークと共に音声通知を実行するヘルパー関数
 * Agent操作における重要な通知で使用
 */
export async function playNotificationWithMessage(message: string): Promise<void> {
  try {
    await playNotificationSound();
    console.log(`🔔 NOTIFICATION: ${message}`);
  } catch (error) {
    // 音声再生に失敗してもメッセージは表示
    console.warn('音声通知の再生に失敗しましたが、メッセージを表示します');
    console.log(`🔔 NOTIFICATION: ${message}`);
  }
}
