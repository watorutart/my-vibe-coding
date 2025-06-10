/**
 * 画像生成ユーティリティ
 * html2canvasを使用したスクリーンショット撮影とウォーターマーク機能を提供
 */

import html2canvas from 'html2canvas';
import type {
  ScreenshotOptions,
  WatermarkConfig,
  ImageGenerationConfig,
  StatsCardData
} from '../types/Share';

/**
 * デフォルトのスクリーンショットオプション
 */
export const DEFAULT_SCREENSHOT_OPTIONS: ScreenshotOptions = {
  width: 1080,
  height: 1080,
  quality: 1,
  showWatermark: true,
  backgroundColor: null,
  scale: 2
};

/**
 * デフォルトのウォーターマーク設定
 */
export const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  text: 'AI Pet Buddy',
  position: 'bottom-right',
  opacity: 0.7,
  fontSize: '16px',
  color: '#ffffff'
};

/**
 * 要素のスクリーンショットを撮影
 * @param element キャプチャ対象の要素
 * @param options スクリーンショットオプション
 * @returns Promise<string> 画像データURL
 */
export const captureElement = async (
  element: HTMLElement,
  options: ScreenshotOptions = {}
): Promise<string> => {
  const config = { ...DEFAULT_SCREENSHOT_OPTIONS, ...options };
  
  try {
    const canvas = await html2canvas(element, {
      width: config.width,
      height: config.height,
      scale: config.scale,
      backgroundColor: config.backgroundColor,
      useCORS: true,
      allowTaint: true,
      removeContainer: true,
      imageTimeout: 15000,
      logging: false
    });
    
    return canvas.toDataURL('image/png', config.quality);
  } catch (error) {
    throw new Error(`Screenshot capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * 画像にウォーターマークを追加
 * @param imageDataUrl 元画像のデータURL
 * @param config ウォーターマーク設定
 * @returns Promise<string> ウォーターマーク付き画像のデータURL
 */
export const addWatermark = async (
  imageDataUrl: string,
  config: WatermarkConfig = DEFAULT_WATERMARK_CONFIG
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 元画像を描画
        ctx.drawImage(img, 0, 0);
        
        // ウォーターマークを描画
        ctx.save();
        ctx.globalAlpha = config.opacity || 0.7;
        ctx.fillStyle = config.color || '#ffffff';
        ctx.font = `${config.fontSize || '16px'} Arial, sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        
        // 位置計算
        const padding = 20;
        let x: number, y: number;
        
        switch (config.position) {
          case 'top-left':
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            x = padding;
            y = padding;
            break;
          case 'top-right':
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top';
            x = canvas.width - padding;
            y = padding;
            break;
          case 'bottom-left':
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            x = padding;
            y = canvas.height - padding;
            break;
          case 'bottom-right':
          default:
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            x = canvas.width - padding;
            y = canvas.height - padding;
            break;
        }
        
        // テキストに影を追加（可読性向上）
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 3;
        ctx.strokeText(config.text, x, y);
        ctx.fillText(config.text, x, y);
        
        ctx.restore();
        
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(new Error(`Watermark addition failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for watermark'));
    };
    
    img.src = imageDataUrl;
  });
};

/**
 * 統計カード画像を生成
 * @param statsData 統計データ
 * @param config 画像生成設定
 * @returns Promise<string> 統計カード画像のデータURL
 */
export const generateStatsCard = async (
  statsData: StatsCardData,
  config: ImageGenerationConfig = {}
): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // キャンバスサイズ設定
  canvas.width = config.screenshot?.width || 1080;
  canvas.height = config.screenshot?.height || 1080;
  
  // 背景グラデーション
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // カード背景
  const cardPadding = 80;
  const cardX = cardPadding;
  const cardY = cardPadding;
  const cardWidth = canvas.width - cardPadding * 2;
  const cardHeight = canvas.height - cardPadding * 2;
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 10;
  roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 20);
  ctx.fill();
  
  // 影をリセット
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // タイトル
  ctx.fillStyle = '#2d3748';
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AI Pet Buddy', canvas.width / 2, cardY + 100);
  
  // ペット名
  ctx.fillStyle = '#4a5568';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.fillText(`"${statsData.petName}"`, canvas.width / 2, cardY + 180);
  
  // 統計情報
  const statsY = cardY + 280;
  const leftX = cardX + 100;
  const rightX = cardX + cardWidth - 100;
  
  ctx.textAlign = 'left';
  ctx.font = '32px Arial, sans-serif';
  ctx.fillStyle = '#2d3748';
  
  // 左列
  ctx.fillText(`レベル: ${statsData.level}`, leftX, statsY);
  ctx.fillText(`進化段階: ${statsData.evolutionStage}`, leftX, statsY + 80);
  ctx.fillText(`プレイ時間: ${Math.floor(statsData.totalPlayTime / 60)}時間`, leftX, statsY + 160);
  
  // 右列
  ctx.textAlign = 'right';
  ctx.fillText(`勝率: ${Math.round(statsData.gameWinRate * 100)}%`, rightX, statsY);
  ctx.fillText(`実績: ${statsData.achievementCount}個`, rightX, statsY + 80);
  
  // 経過日数計算
  const daysSinceBirth = Math.floor((Date.now() - statsData.birthDate.getTime()) / (1000 * 60 * 60 * 24));
  ctx.fillText(`育成日数: ${daysSinceBirth}日`, rightX, statsY + 160);
  
  // 特別な称号（ある場合）
  if (statsData.specialTitle) {
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillStyle = '#e53e3e';
    ctx.fillText(`【${statsData.specialTitle}】`, canvas.width / 2, statsY + 280);
  }
  
  // 日付
  ctx.textAlign = 'center';
  ctx.font = '20px Arial, sans-serif';
  ctx.fillStyle = '#718096';
  const now = new Date();
  const dateString = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
  ctx.fillText(dateString, canvas.width / 2, cardY + cardHeight - 40);
  
  let result = canvas.toDataURL('image/png');
  
  // ウォーターマークを追加
  if (config.watermark || config.screenshot?.showWatermark) {
    result = await addWatermark(result, config.watermark);
  }
  
  return result;
};

/**
 * 角丸矩形を描画するヘルパー関数
 * @param ctx CanvasRenderingContext2D
 * @param x X座標
 * @param y Y座標
 * @param width 幅
 * @param height 高さ
 * @param radius 角の半径
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * 画像を指定サイズにリサイズ
 * @param imageDataUrl 元画像のデータURL
 * @param width 目標幅
 * @param height 目標高さ
 * @param maintainAspectRatio アスペクト比維持フラグ
 * @returns Promise<string> リサイズ後の画像データURL
 */
export const resizeImage = async (
  imageDataUrl: string,
  width: number,
  height: number,
  maintainAspectRatio: boolean = true
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        let targetWidth = width;
        let targetHeight = height;
        
        if (maintainAspectRatio) {
          const aspectRatio = img.width / img.height;
          if (width / height > aspectRatio) {
            targetWidth = height * aspectRatio;
          } else {
            targetHeight = width / aspectRatio;
          }
        }
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(new Error(`Image resize failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for resize'));
    };
    
    img.src = imageDataUrl;
  });
};

/**
 * 画像品質を調整
 * @param imageDataUrl 元画像のデータURL
 * @param quality 品質 (0-1)
 * @param format 出力フォーマット
 * @returns Promise<string> 品質調整後の画像データURL
 */
export const adjustImageQuality = async (
  imageDataUrl: string,
  quality: number = 0.9,
  format: 'png' | 'jpeg' | 'webp' = 'png'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        const mimeType = `image/${format}`;
        const result = canvas.toDataURL(mimeType, quality);
        resolve(result);
      } catch (error) {
        reject(new Error(`Image quality adjustment failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for quality adjustment'));
    };
    
    img.src = imageDataUrl;
  });
};