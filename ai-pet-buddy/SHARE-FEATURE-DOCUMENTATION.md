# AI Pet Buddy シェア機能 完全ドキュメント

このドキュメントでは、AI Pet Buddyのシェア機能の詳細な仕様、実装、使用方法について説明します。

## 📋 目次

1. [機能概要](#機能概要)
2. [アーキテクチャ](#アーキテクチャ)
3. [実装詳細](#実装詳細)
4. [API仕様](#api仕様)
5. [使用方法](#使用方法)
6. [エラーハンドリング](#エラーハンドリング)
7. [パフォーマンス](#パフォーマンス)
8. [今後の拡張](#今後の拡張)

## 🎯 機能概要

AI Pet Buddyのシェア機能は、ユーザーがペットの成長や状態を他のユーザーと共有できる包括的なシステムです。

### 主要機能

#### 1. スクリーンショット撮影
- **高品質画像生成**: html2canvasを使用した1080x1080pxの正方形画像
- **カスタマイズ可能設定**: 解像度、品質、背景色の調整
- **ウォーターマーク**: ブランディング用の透明ロゴ挿入
- **フォーマット対応**: PNG、JPEG、WebP形式での出力

#### 2. 統計カード生成
- **動的データ表示**: ペットレベル、進化段階、プレイ時間、実績
- **美しいデザイン**: グラデーション背景とガラスモーフィズム効果
- **レスポンシブ**: 様々な画面サイズに対応したレイアウト
- **ブランディング**: 一貫したAI Pet Buddyデザイン

#### 3. SNSシェア統合
- **マルチプラットフォーム**: Twitter、Facebook、Instagram、LINE対応
- **最適化されたテキスト**: プラットフォーム別文字数制限対応
- **ハッシュタグ管理**: 自動ハッシュタグ付与とカスタマイズ
- **URL生成**: 各SNSの公式シェアAPIを使用

#### 4. ダウンロード機能
- **ワンクリック保存**: ブラウザの標準ダウンロード機能
- **自動ファイル名**: 日時付きの分かりやすいファイル名
- **履歴管理**: ダウンロード履歴の記録と表示

## 🏗️ アーキテクチャ

### システム構成図

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Interface │    │  Business Logic   │    │  External APIs  │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ • SharePanel    │◄──►│ • useShare Hook   │◄──►│ • html2canvas   │
│ • ActionButtons │    │ • shareUtils      │    │ • Twitter API   │
│ • Preview Modal │    │ • imageGenerator  │    │ • Facebook API  │
│                 │    │ • errorHandling   │    │ • LINE API      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### レイヤー構造

#### 1. プレゼンテーション層 (UI Components)
- **SharePanel**: メインのシェアインターフェース
- **ActionButtons**: シェアボタンの統合
- **Preview Modal**: 画像プレビューとオプション

#### 2. ビジネスロジック層 (Hooks & Utilities)
- **useShare**: 状態管理とオーケストレーション
- **shareUtils**: SNS統合とファイル操作
- **imageGenerator**: 画像生成とウォーターマーク

#### 3. データアクセス層 (External APIs)
- **html2canvas**: DOM要素の画像変換
- **SNS APIs**: プラットフォーム別シェア機能
- **Browser APIs**: ダウンロードとファイルシステム

## 🔧 実装詳細

### 型定義構造

```typescript
// 中核的な型定義
interface ShareData {
  imageDataUrl: string;      // Base64エンコードされた画像データ
  title: string;             // シェア用タイトル
  description: string;       // 説明文
  hashtags: string[];        // ハッシュタグ配列
  stats?: SharePetStats;     // ペット統計（オプション）
}

interface ScreenshotOptions {
  width?: number;            // 画像幅（デフォルト: 1080）
  height?: number;           // 画像高さ（デフォルト: 1080）
  quality?: number;          // 品質 0-1（デフォルト: 1）
  showWatermark?: boolean;   // ウォーターマーク表示
  backgroundColor?: string;  // 背景色
  scale?: number;            // 拡大率（デフォルト: 2）
}

interface StatsCardData {
  petName: string;           // ペット名
  level: number;             // レベル
  evolutionStage: string;    // 進化段階
  totalPlayTime: number;     // 総プレイ時間
  gameWinRate: number;       // ゲーム勝率
  achievementCount: number;  // 達成数
  specialTitle?: string;     // 特別称号
  birthDate: Date;           // 誕生日
}
```

### コンポーネント階層

```
App
├── ActionButtons
│   └── Share Button (シェアパネル起動)
└── SharePanel (isOpen={sharePanel})
    ├── ModeSelector (スクリーンショット/統計カード)
    ├── ImagePreview (生成画像プレビュー)
    ├── SocialButtons (Twitter, Facebook, Instagram, LINE)
    ├── DownloadButton (画像ダウンロード)
    └── ErrorDisplay (エラーメッセージ表示)
```

### 状態管理フロー

```typescript
// useShareフックの状態管理
const useShare = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastShareImageUrl, setLastShareImageUrl] = useState<string | null>(null);
  const [shareHistory, setShareHistory] = useState<ShareHistoryEntry[]>([]);
  
  // 機能実装...
};
```

## 📚 API仕様

### useShare Hook

#### 主要メソッド

```typescript
interface UseShareReturn {
  // スクリーンショット撮影
  captureScreenshot: (
    element: HTMLElement, 
    options?: ScreenshotOptions
  ) => Promise<string>;
  
  // SNSシェア実行
  shareToSocial: (options: SocialShareOptions) => Promise<ShareResult>;
  
  // 画像ダウンロード
  downloadImage: (dataUrl: string, filename?: string) => void;
  
  // 統計カード生成
  generateStatsCard: (
    statsData: StatsCardData, 
    config?: ImageGenerationConfig
  ) => Promise<string>;
  
  // ウォーターマーク追加
  addWatermark: (
    imageDataUrl: string, 
    config?: WatermarkConfig
  ) => Promise<string>;
  
  // 状態とユーティリティ
  isSharing: boolean;
  error: string | null;
  lastShareImageUrl: string | null;
  shareHistory: ShareHistoryEntry[];
  clearError: () => void;
  clearHistory: () => void;
}
```

#### 使用例

```typescript
// 基本的な使用方法
const ShareComponent = () => {
  const {
    captureScreenshot,
    shareToSocial,
    downloadImage,
    generateStatsCard,
    isSharing,
    error
  } = useShare();

  // スクリーンショット撮影
  const handleCapture = async () => {
    try {
      const imageUrl = await captureScreenshot(targetRef.current, {
        width: 1080,
        height: 1080,
        showWatermark: true
      });
      console.log('撮影完了:', imageUrl);
    } catch (err) {
      console.error('撮影失敗:', err);
    }
  };

  // SNSシェア
  const handleShare = async (platform: SocialPlatform) => {
    const shareData = {
      imageDataUrl: lastShareImageUrl,
      title: 'My AI Pet Buddy',
      description: 'かわいいペットと遊んでいます！',
      hashtags: ['#AIPetBuddy', '#VirtualPet']
    };

    const result = await shareToSocial({ platform, shareData });
    if (result.success) {
      console.log('シェア成功:', result.shareUrl);
    }
  };
};
```

### shareUtils API

#### 主要関数

```typescript
// SNSシェア実行
export const shareToSocial = async (
  options: SocialShareOptions
): Promise<ShareResult> => {
  // プラットフォーム別URL生成とシェア実行
};

// ファイル名生成
export const generateFileName = (
  prefix: string = 'pet-buddy',
  extension: string = 'png'
): string => {
  // タイムスタンプ付きファイル名生成
};

// シェアテキスト生成
export const generateShareText = (
  shareData: ShareData,
  platform: SocialPlatform
): string => {
  // プラットフォーム別最適化テキスト生成
};

// 画像ダウンロード
export const downloadImage = (
  dataUrl: string,
  filename?: string
): void => {
  // ブラウザダウンロード実行
};
```

### imageGenerator API

#### 主要関数

```typescript
// DOM要素スクリーンショット
export const captureElement = async (
  element: HTMLElement,
  options: ScreenshotOptions = {}
): Promise<string> => {
  // html2canvasを使用した高品質スクリーンショット
};

// 統計カード生成
export const generateStatsCard = async (
  statsData: StatsCardData,
  config: ImageGenerationConfig = {}
): Promise<string> => {
  // 動的統計カード生成
};

// ウォーターマーク追加
export const addWatermark = async (
  imageDataUrl: string,
  config: WatermarkConfig = DEFAULT_WATERMARK_CONFIG
): Promise<string> => {
  // Canvas APIを使用したウォーターマーク挿入
};
```

## 💡 使用方法

### 基本的なワークフロー

#### 1. シェアパネルの起動

```typescript
// ActionButtonsコンポーネント内
const handleShareClick = () => {
  setSharePanelOpen(true);
};

<button onClick={handleShareClick} className="action-button share-button">
  <FaShare /> Share
</button>
```

#### 2. スクリーンショット撮影

```typescript
// SharePanelコンポーネント内
const handleCaptureScreenshot = async () => {
  if (!captureTargetRef.current) return;
  
  try {
    const imageUrl = await captureScreenshot(captureTargetRef.current, {
      width: 1080,
      height: 1080,
      showWatermark: true,
      quality: 1.0
    });
    setShareImageUrl(imageUrl);
  } catch (error) {
    console.error('Screenshot failed:', error);
  }
};
```

#### 3. 統計カード生成

```typescript
const handleGenerateStatsCard = async () => {
  if (!statsData) return;
  
  try {
    const cardImageUrl = await generateStatsCard(statsData, {
      watermark: {
        text: 'AI Pet Buddy',
        position: 'bottom-right',
        opacity: 0.7
      },
      format: 'png'
    });
    setShareImageUrl(cardImageUrl);
  } catch (error) {
    console.error('Stats card generation failed:', error);
  }
};
```

#### 4. SNSシェア実行

```typescript
const handleSocialShare = async (platform: SocialPlatform) => {
  if (!shareImageUrl) return;
  
  const shareData = generateShareData(shareImageUrl, statsData);
  
  try {
    const result = await shareToSocial({ platform, shareData });
    if (result.success) {
      alert('シェアが完了しました！');
    } else {
      alert(`シェアに失敗しました: ${result.error}`);
    }
  } catch (error) {
    console.error('Share failed:', error);
  }
};
```

#### 5. 画像ダウンロード

```typescript
const handleDownload = () => {
  if (!shareImageUrl) return;
  
  const filename = generateFileName('ai-pet-buddy', 'png');
  downloadImage(shareImageUrl, filename);
};
```

### 高度な使用例

#### カスタムウォーターマーク

```typescript
const customWatermark: WatermarkConfig = {
  text: 'My Custom Brand',
  position: 'top-left',
  opacity: 0.5,
  fontSize: '14px',
  color: '#ff6b6b'
};

const watermarkedImage = await addWatermark(originalImage, customWatermark);
```

#### 高解像度スクリーンショット

```typescript
const highResOptions: ScreenshotOptions = {
  width: 2160,    // 4K解像度
  height: 2160,
  scale: 3,       // 3倍スケール
  quality: 1.0,   // 最高品質
  backgroundColor: '#ffffff'
};

const imageUrl = await captureScreenshot(element, highResOptions);
```

#### 複数プラットフォーム同時シェア

```typescript
const platforms: SocialPlatform[] = ['twitter', 'facebook', 'line'];

const shareResults = await Promise.allSettled(
  platforms.map(platform => 
    shareToSocial({ platform, shareData })
  )
);

shareResults.forEach((result, index) => {
  if (result.status === 'fulfilled' && result.value.success) {
    console.log(`${platforms[index]} シェア成功`);
  } else {
    console.log(`${platforms[index]} シェア失敗`);
  }
});
```

## ⚠️ エラーハンドリング

### エラーの種類と対処法

#### 1. スクリーンショット撮影エラー

```typescript
// 一般的なエラーケース
try {
  const imageUrl = await captureScreenshot(element, options);
} catch (error) {
  if (error.message.includes('html2canvas')) {
    // html2canvasライブラリのエラー
    console.error('Canvas rendering failed:', error);
    // フォールバック: 簡易版スクリーンショット
  } else if (error.message.includes('element not found')) {
    // 要素が存在しない
    console.error('Target element not found');
    // UI警告表示
  } else {
    // その他のエラー
    console.error('Unknown screenshot error:', error);
  }
}
```

#### 2. SNSシェアエラー

```typescript
// プラットフォーム別エラーハンドリング
const handleShareError = (platform: SocialPlatform, error: string) => {
  switch (platform) {
    case 'instagram':
      return 'InstagramはWebからの直接投稿に対応していません。画像をダウンロードしてアプリから投稿してください。';
    case 'twitter':
      return 'Twitterのシェアに失敗しました。ポップアップがブロックされている可能性があります。';
    case 'facebook':
      return 'Facebookのシェアに失敗しました。ログイン状態を確認してください。';
    default:
      return `${platform}のシェアに失敗しました: ${error}`;
  }
};
```

#### 3. 画像生成エラー

```typescript
// 統計カード生成エラー
try {
  const cardImage = await generateStatsCard(statsData, config);
} catch (error) {
  if (error.message.includes('insufficient data')) {
    // データ不足
    alert('統計データが不足しています。ペットとの遊び時間を増やしてください。');
  } else if (error.message.includes('memory')) {
    // メモリ不足
    alert('メモリ不足です。ブラウザを再起動してお試しください。');
  } else {
    // その他のエラー
    console.error('Stats card generation error:', error);
  }
}
```

### エラー状態の管理

```typescript
// useShareフック内でのエラー管理
const [error, setError] = useState<string | null>(null);

const clearError = useCallback(() => {
  setError(null);
}, []);

// エラー表示コンポーネント
const ErrorDisplay = ({ error, onClear }: { error: string | null, onClear: () => void }) => {
  if (!error) return null;
  
  return (
    <div className="error-display">
      <span>{error}</span>
      <button onClick={onClear}>×</button>
    </div>
  );
};
```

## ⚡ パフォーマンス

### 最適化戦略

#### 1. 画像生成の最適化

```typescript
// 遅延読み込みとキャッシュ
const [imageCache, setImageCache] = useState<Map<string, string>>(new Map());

const getCachedImage = useCallback(async (key: string, generator: () => Promise<string>) => {
  if (imageCache.has(key)) {
    return imageCache.get(key)!;
  }
  
  const imageUrl = await generator();
  setImageCache(prev => new Map(prev).set(key, imageUrl));
  return imageUrl;
}, [imageCache]);
```

#### 2. DOM操作の最小化

```typescript
// 統計カード生成時の効率的なDOM操作
const generateStatsCard = async (statsData: StatsCardData) => {
  // 事前にHTML文字列を構築
  const htmlContent = `
    <div class="stats-card">
      <h2>${statsData.petName}</h2>
      <div class="stats-grid">
        ${statsData.achievements.map(achievement => 
          `<div class="stat-item">${achievement}</div>`
        ).join('')}
      </div>
    </div>
  `;
  
  // 一度だけDOM挿入
  const container = document.createElement('div');
  container.innerHTML = htmlContent;
  
  // 画像生成後即座に削除
  document.body.appendChild(container);
  const imageUrl = await html2canvas(container).then(canvas => canvas.toDataURL());
  document.body.removeChild(container);
  
  return imageUrl;
};
```

#### 3. 非同期処理の最適化

```typescript
// 並列処理による高速化
const generateMultipleFormats = async (element: HTMLElement) => {
  const [pngImage, jpegImage, webpImage] = await Promise.all([
    captureElement(element, { format: 'png' }),
    captureElement(element, { format: 'jpeg', quality: 0.8 }),
    captureElement(element, { format: 'webp', quality: 0.8 })
  ]);
  
  return { pngImage, jpegImage, webpImage };
};
```

### メモリ管理

```typescript
// URLオブジェクトのクリーンアップ
useEffect(() => {
  return () => {
    // コンポーネントアンマウント時にURLを解放
    if (lastShareImageUrl && lastShareImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(lastShareImageUrl);
    }
  };
}, [lastShareImageUrl]);
```

### パフォーマンス計測

```typescript
// 処理時間の計測
const measurePerformance = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  const startTime = performance.now();
  try {
    const result = await operation();
    const endTime = performance.now();
    console.log(`${operationName} completed in ${endTime - startTime}ms`);
    return result;
  } catch (error) {
    const endTime = performance.now();
    console.error(`${operationName} failed after ${endTime - startTime}ms:`, error);
    throw error;
  }
};

// 使用例
const captureWithTiming = () => measurePerformance(
  () => captureScreenshot(element, options),
  'Screenshot capture'
);
```

## 🚀 今後の拡張

### 計画中の機能

#### 1. 高度なカスタマイズ
- **テンプレートシステム**: 複数の統計カードデザイン
- **カラーテーマ**: ユーザー定義のカラーパレット
- **フォント選択**: システムフォントとWebフォント対応

#### 2. SNS機能拡張
- **Discord統合**: サーバー別シェア機能
- **Reddit対応**: コミュニティ投稿機能
- **TikTok連携**: 短動画形式のシェア

#### 3. 高度な画像処理
- **アニメーションGIF**: ペットの動きを含むシェア
- **AR効果**: 拡張現実要素の追加
- **AI画像強化**: 機械学習による画質向上

#### 4. 分析・統計機能
- **シェア分析**: どの統計が最も人気かの分析
- **エンゲージメント追跡**: SNSでの反響測定
- **A/Bテスト**: 異なるシェア形式の効果比較

### 技術的改善点

#### 1. パフォーマンス最適化
```typescript
// Web Workersを使用したバックグラウンド処理
const generateStatsCardInWorker = async (statsData: StatsCardData) => {
  const worker = new Worker('/workers/statsCardGenerator.js');
  
  return new Promise<string>((resolve, reject) => {
    worker.postMessage({ statsData });
    worker.onmessage = (e) => {
      if (e.data.success) {
        resolve(e.data.imageUrl);
      } else {
        reject(new Error(e.data.error));
      }
      worker.terminate();
    };
  });
};
```

#### 2. オフライン対応
```typescript
// Service Workerによるオフライン機能
const enableOfflineSharing = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(() => {
      console.log('Offline sharing enabled');
    });
  }
};
```

#### 3. アクセシビリティ向上
```typescript
// 視覚障害者向けの画像説明生成
const generateImageAltText = (statsData: StatsCardData): string => {
  return `${statsData.petName}のステータス: レベル${statsData.level}、` +
         `${statsData.evolutionStage}段階、プレイ時間${statsData.totalPlayTime}分、` +
         `実績${statsData.achievementCount}個達成`;
};
```

#### 4. セキュリティ強化
```typescript
// 画像データの安全な処理
const sanitizeImageData = (imageDataUrl: string): string => {
  // データURLの検証
  if (!imageDataUrl.startsWith('data:image/')) {
    throw new Error('Invalid image data format');
  }
  
  // ファイルサイズ制限
  const base64Data = imageDataUrl.split(',')[1];
  const imageSize = (base64Data.length * 3) / 4; // バイト数計算
  if (imageSize > 5 * 1024 * 1024) { // 5MB制限
    throw new Error('Image size too large');
  }
  
  return imageDataUrl;
};
```

---

## 📝 まとめ

AI Pet Buddyのシェア機能は、現代のソーシャルメディア環境に最適化された包括的なシステムです。高品質な画像生成、多様なプラットフォーム対応、ユーザーフレンドリーなインターフェースを提供し、ユーザーがペットとの体験を簡単に共有できるようになっています。

### 主要な特徴

1. **技術的優秀性**: html2canvas、Canvas API、SNS APIの効果的な組み合わせ
2. **ユーザビリティ**: 直感的なインターフェースと詳細なエラーハンドリング
3. **拡張性**: モジュラー設計による将来的な機能追加への対応
4. **パフォーマンス**: 最適化された非同期処理とメモリ管理

このドキュメントが開発者の理解促進と効率的な開発・メンテナンス作業に貢献することを期待しています。