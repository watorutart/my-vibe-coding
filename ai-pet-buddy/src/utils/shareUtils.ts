/**
 * シェア機能ユーティリティ
 * SNSシェア、URL生成、ファイル名生成などの共通機能を提供
 */

import type {
  SocialPlatform,
  ShareData,
  SocialShareOptions,
  ShareResult,
  ShareSettings,
} from '../types/Share';

/**
 * デフォルトのシェア設定
 */
export const DEFAULT_SHARE_SETTINGS: ShareSettings = {
  defaultHashtags: ['#AIPetBuddy', '#VirtualPet', '#Gaming'],
  enableWatermark: true,
  autoSave: false,
  imageQuality: 0.9,
  includeStats: true,
};

/**
 * プラットフォーム別の設定
 */
export const PLATFORM_CONFIG = {
  twitter: {
    maxLength: 280,
    recommendedHashtags: ['#AIPetBuddy', '#VirtualPet', '#TwitterGaming'],
    baseUrl: 'https://twitter.com/intent/tweet',
  },
  facebook: {
    maxLength: 63206,
    recommendedHashtags: ['#AIPetBuddy', '#VirtualPet', '#FacebookGaming'],
    baseUrl: 'https://www.facebook.com/sharer/sharer.php',
  },
  instagram: {
    maxLength: 2200,
    recommendedHashtags: ['#AIPetBuddy', '#VirtualPet', '#InstagramGaming'],
    baseUrl: '', // Instagram doesn't support direct web sharing
  },
  line: {
    maxLength: 1000,
    recommendedHashtags: ['#AIPetBuddy', '#VirtualPet'],
    baseUrl: 'https://social-plugins.line.me/lineit/share',
  },
} as const;

/**
 * 現在の日時からファイル名を生成 (UTC基準)
 * @param prefix ファイル名のプレフィックス
 * @param extension ファイル拡張子
 * @returns 生成されたファイル名 (YYYYMMDD-HHMMSS形式、UTC基準)
 */
export const generateFileName = (
  prefix: string = 'pet-buddy',
  extension: string = 'png'
): string => {
  const now = new Date();
  // Use UTC methods to ensure consistent filenames across different timezones
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');

  return `${prefix}-${year}${month}${day}-${hours}${minutes}${seconds}.${extension}`;
};

/**
 * シェア用テキストを生成
 * @param shareData シェアデータ
 * @param platform SNSプラットフォーム
 * @returns 生成されたシェアテキスト
 */
export const generateShareText = (
  shareData: ShareData,
  platform: SocialPlatform
): string => {
  const config = PLATFORM_CONFIG[platform];
  const maxLength = config.maxLength;

  let text = `${shareData.title}\n\n${shareData.description}`;

  // 統計情報を含める場合
  if (shareData.stats) {
    const statsText = `\n\nレベル: ${shareData.stats.level} | 進化段階: ${shareData.stats.evolutionStage}`;
    text += statsText;
  }

  // ハッシュタグを追加
  const hashtags =
    shareData.hashtags.length > 0
      ? shareData.hashtags
      : config.recommendedHashtags;

  const hashtagText = '\n\n' + hashtags.join(' ');

  // 文字数制限を考慮
  const totalLength = text.length + hashtagText.length;
  if (totalLength > maxLength) {
    const availableLength = maxLength - hashtagText.length - 3; // "..." 分を考慮
    text = text.substring(0, availableLength) + '...';
  }

  return text + hashtagText;
};

/**
 * SNSシェア用URLを生成
 * @param options シェアオプション
 * @returns 生成されたURL
 */
export const generateShareUrl = (options: SocialShareOptions): string => {
  const { platform, shareData, url } = options;
  const config = PLATFORM_CONFIG[platform];

  if (platform === 'instagram') {
    // Instagramは直接のWebシェアをサポートしていない
    return '';
  }

  const shareText = generateShareText(shareData, platform);
  const encodedText = encodeURIComponent(shareText);

  switch (platform) {
    case 'twitter':
      return `${config.baseUrl}?text=${encodedText}${url ? `&url=${encodeURIComponent(url)}` : ''}`;

    case 'facebook':
      return url ? `${config.baseUrl}?u=${encodeURIComponent(url)}` : '';

    case 'line':
      return `${config.baseUrl}?text=${encodedText}${url ? `&url=${encodeURIComponent(url)}` : ''}`;

    default:
      return '';
  }
};

/**
 * SNSシェアを実行
 * @param options シェアオプション
 * @returns シェア結果
 */
export const shareToSocial = async (
  options: SocialShareOptions
): Promise<ShareResult> => {
  try {
    const shareUrl = generateShareUrl(options);

    if (!shareUrl) {
      if (options.platform === 'instagram') {
        return {
          success: false,
          error:
            'Instagram does not support direct web sharing. Please save the image and share manually.',
        };
      }
      return {
        success: false,
        error: 'Failed to generate share URL',
      };
    }

    // 新しいウィンドウでシェアページを開く
    const popup = window.open(
      shareUrl,
      'share',
      'width=600,height=400,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      return {
        success: false,
        error: 'Popup blocked. Please allow popups for this site.',
      };
    }

    return {
      success: true,
      shareUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * 画像をダウンロード
 * @param dataUrl 画像データURL
 * @param filename ファイル名
 */
export const downloadImage = (dataUrl: string, filename?: string): void => {
  const link = document.createElement('a');
  link.download = filename || generateFileName();
  link.href = dataUrl;

  // 一時的にDOMに追加してクリック
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Base64データURLから画像サイズを取得
 * @param dataUrl 画像データURL
 * @returns Promise<{width: number, height: number}>
 */
export const getImageDimensions = (
  dataUrl: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = dataUrl;
  });
};

/**
 * データURLから画像サイズ（バイト）を取得
 * @param dataUrl 画像データURL
 * @returns ファイルサイズ（バイト）
 */
export const getImageSize = (dataUrl: string): number => {
  const base64 = dataUrl.split(',')[1];
  if (!base64) return 0;

  const byteCharacters = atob(base64);
  return byteCharacters.length;
};

/**
 * 画像データURLのフォーマットを取得
 * @param dataUrl 画像データURL
 * @returns 画像フォーマット（例: 'png', 'jpeg'）
 */
export const getImageFormat = (dataUrl: string): string => {
  const match = dataUrl.match(/data:image\/([^;]+)/);
  return match ? match[1] : 'unknown';
};

/**
 * シェアデータをローカルストレージに保存
 * @param shareData シェアデータ
 * @param key 保存キー
 */
export const saveShareData = (
  shareData: ShareData,
  key: string = 'lastShareData'
): void => {
  try {
    const data = {
      ...shareData,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save share data:', error);
  }
};

/**
 * ローカルストレージからシェアデータを読み込み
 * @param key 読み込みキー
 * @returns シェアデータまたはnull
 */
export const loadShareData = (
  key: string = 'lastShareData'
): ShareData | null => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const data = JSON.parse(stored);
    return data;
  } catch (error) {
    console.warn('Failed to load share data:', error);
    return null;
  }
};

/**
 * 画像データURLが有効かチェック
 * @param dataUrl 画像データURL
 * @returns 有効性フラグ
 */
export const isValidImageDataUrl = (dataUrl: string): boolean => {
  return /^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(dataUrl);
};

/**
 * ハッシュタグの形式を正規化
 * @param hashtags ハッシュタグ配列
 * @returns 正規化されたハッシュタグ配列
 */
export const normalizeHashtags = (hashtags: string[]): string[] => {
  return hashtags
    .map(tag => {
      // # を先頭に追加（ない場合）
      const normalized = tag.startsWith('#') ? tag : `#${tag}`;
      // 空白を除去
      return normalized.replace(/\s+/g, '');
    })
    .filter(tag => tag.length > 1); // "#" だけの場合は除外
};
