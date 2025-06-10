/**
 * シェア機能関連の型定義
 * SNSシェア、スクリーンショット、画像生成機能の型を定義
 */

/**
 * シェア用のペット統計情報
 */
export interface SharePetStats {
  level: number;
  happiness: number;
  energy: number;
  experience: number;
  evolutionStage: string;
}

/**
 * シェアデータの基本情報
 */
export interface ShareData {
  /** 画像データURL（base64形式） */
  imageDataUrl: string;
  /** シェア時のタイトル */
  title: string;
  /** シェア時の説明文 */
  description: string;
  /** ハッシュタグ配列 */
  hashtags: string[];
  /** ペット統計情報（オプション） */
  stats?: SharePetStats;
}

/**
 * スクリーンショット撮影オプション
 */
export interface ScreenshotOptions {
  /** 画像幅（デフォルト: 1080） */
  width?: number;
  /** 画像高さ（デフォルト: 1080） */
  height?: number;
  /** 画像品質（0-1、デフォルト: 1） */
  quality?: number;
  /** ウォーターマーク表示フラグ */
  showWatermark?: boolean;
  /** 背景色（デフォルト: 透明） */
  backgroundColor?: string | null;
  /** 拡大率（デフォルト: 2） */
  scale?: number;
}

/**
 * SNSプラットフォーム種別
 */
export type SocialPlatform = 'twitter' | 'facebook' | 'instagram' | 'line';

/**
 * SNSシェアオプション
 */
export interface SocialShareOptions {
  /** SNSプラットフォーム */
  platform: SocialPlatform;
  /** シェアデータ */
  shareData: ShareData;
  /** シェア用URL（オプション） */
  url?: string;
}

/**
 * シェア結果
 */
export interface ShareResult {
  /** シェア成功フラグ */
  success: boolean;
  /** エラーメッセージ（失敗時） */
  error?: string;
  /** シェア先URL（成功時） */
  shareUrl?: string;
}

/**
 * ウォーターマーク設定
 */
export interface WatermarkConfig {
  /** 表示テキスト */
  text: string;
  /** 位置（デフォルト: 'bottom-right'） */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** 透明度（0-1、デフォルト: 0.7） */
  opacity?: number;
  /** フォントサイズ（デフォルト: '16px'） */
  fontSize?: string;
  /** フォントカラー（デフォルト: '#ffffff'） */
  color?: string;
}

/**
 * 画像生成設定
 */
export interface ImageGenerationConfig {
  /** ウォーターマーク設定 */
  watermark?: WatermarkConfig;
  /** スクリーンショットオプション */
  screenshot?: ScreenshotOptions;
  /** 出力形式（デフォルト: 'png'） */
  format?: 'png' | 'jpeg' | 'webp';
}

/**
 * 統計カード表示データ
 */
export interface StatsCardData {
  /** ペット名 */
  petName: string;
  /** レベル */
  level: number;
  /** 進化段階 */
  evolutionStage: string;
  /** 総プレイ時間（分） */
  totalPlayTime: number;
  /** ゲーム勝率（0-1） */
  gameWinRate: number;
  /** 達成バッジ数 */
  achievementCount: number;
  /** 特別な称号 */
  specialTitle?: string;
  /** 誕生日 */
  birthDate: Date;
}

/**
 * シェアプレビューデータ
 */
export interface SharePreviewData {
  /** プレビュー画像URL */
  previewImageUrl: string;
  /** シェアテキスト */
  shareText: string;
  /** プラットフォーム固有設定 */
  platformConfig: Record<SocialPlatform, {
    /** 最大文字数 */
    maxLength: number;
    /** 推奨ハッシュタグ */
    recommendedHashtags: string[];
    /** プラットフォーム固有パラメータ */
    platformParams?: Record<string, string>;
  }>;
}

/**
 * シェア履歴エントリ
 */
export interface ShareHistoryEntry {
  /** シェア日時 */
  timestamp: number;
  /** シェア先プラットフォーム */
  platform: SocialPlatform;
  /** シェア内容 */
  content: string;
  /** 画像URL */
  imageUrl?: string;
  /** シェア成功フラグ */
  success: boolean;
}

/**
 * シェア設定
 */
export interface ShareSettings {
  /** デフォルトハッシュタグ */
  defaultHashtags: string[];
  /** ウォーターマーク表示設定 */
  enableWatermark: boolean;
  /** 自動保存設定 */
  autoSave: boolean;
  /** 画像品質設定 */
  imageQuality: number;
  /** プライバシー設定 */
  includeStats: boolean;
}