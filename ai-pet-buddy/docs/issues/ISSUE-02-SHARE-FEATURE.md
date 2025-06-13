# 📤 Issue #2: シェア機能実装

## 📋 Issue情報
- **Priority**: High
- **Labels**: `enhancement`, `frontend`, `social`, `Phase4`
- **Milestone**: Phase 4-A (Week 1)
- **Assignee**: GitHub Copilot Coding Agent
- **Estimated Time**: 2-3日

---

## 📝 Description
ペットのスクリーンショットや成長記録をSNSでシェアできる機能を実装し、アプリの拡散とユーザーエンゲージメントを促進する。要件定義書の「シェア機能」を完全実装し、バイラル効果を狙う。

## 🎯 Acceptance Criteria

### ✅ スクリーンショット機能
- [ ] **ペット画面キャプチャ**
  - ペット表示エリアの高品質スクリーンショット
  - PNG形式での画像生成
  - 解像度: 1080x1080（Instagram対応）
  - 透明背景対応

- [ ] **ウォーターマーク機能**
  - アプリ名「AI Pet Buddy」の透かし
  - 小さなロゴマーク追加
  - 位置調整可能（右下推奨）
  - 透明度調整可能

- [ ] **ダウンロード機能**
  - ワンクリックでの画像保存
  - ファイル名の自動生成（pet-buddy-YYYYMMDD.png）
  - ブラウザ互換性確保

### ✅ 成長記録シェア
- [ ] **統計画像生成**
  - ペットレベル・進化段階表示
  - プレイ時間・ゲーム勝率表示
  - 美しいデザインの統計カード
  - カスタマイズ反映

- [ ] **達成バッジ表示**
  - 進化達成バッジ
  - ゲーム勝利記録
  - 特別な称号表示
  - 記念日表示（誕生日など）

### ✅ SNS連携
- [ ] **Twitter/X シェア**
  - ワンクリックツイート
  - ハッシュタグ自動追加（#AIPetBuddy #ペット育成）
  - 画像付きツイート
  - カスタムメッセージ対応

- [ ] **Instagram対応**
  - ストーリー用サイズ対応
  - 正方形画像生成
  - ダウンロード→Instagram投稿フロー

- [ ] **Facebook シェア**
  - Facebook シェアダイアログ
  - Open Graph メタタグ設定
  - 画像・説明文の最適化

- [ ] **LINE シェア**
  - LINE シェアボタン
  - モバイル対応
  - 日本語メッセージ対応

## 🛠️ Technical Requirements

### 📦 実装ファイル構成
```
src/
├── types/
│   ├── Share.ts                      # シェア型定義
│   └── Share.test.ts                 # 型定義テスト
├── hooks/
│   ├── useShare.ts                   # シェア管理Hook
│   └── useShare.test.ts              # Hookテスト
├── components/
│   ├── SharePanel.tsx                # メインパネル
│   ├── SharePanel.test.tsx           # パネルテスト
│   ├── SharePanel.css                # パネルスタイル
│   ├── ScreenshotCapture.tsx         # スクリーンショット
│   ├── SocialButtons.tsx             # SNSボタン群
│   ├── StatsCard.tsx                 # 統計カード
│   └── SharePreview.tsx              # プレビュー表示
└── utils/
    ├── shareUtils.ts                 # シェアユーティリティ
    ├── shareUtils.test.ts            # ユーティリティテスト
    ├── imageGenerator.ts             # 画像生成
    └── imageGenerator.test.ts        # 画像生成テスト
```

### 🔧 型定義要件
```typescript
// 主要な型定義（詳細はPHASE-4-TEMPLATES.mdを参照）
interface ShareData {
  imageDataUrl: string;
  title: string;
  description: string;
  hashtags: string[];
  stats?: PetStats;
}

interface ScreenshotOptions {
  width?: number;
  height?: number;
  quality?: number;
  showWatermark?: boolean;
}
```

### 📊 品質基準
- **テストカバレッジ**: 85%以上
- **TypeScript**: 100%型安全
- **日本語コメント**: 100%対応
- **画像品質**: 高解像度・最適化

## 🛠️ 技術実装仕様

### 📸 スクリーンショット技術
```typescript
// html2canvas または Canvas API使用
import html2canvas from 'html2canvas';

const captureElement = async (element: HTMLElement) => {
  const canvas = await html2canvas(element, {
    width: 1080,
    height: 1080,
    scale: 2, // 高解像度
    backgroundColor: null // 透明背景
  });
  return canvas.toDataURL('image/png');
};
```

### 🌐 SNS API統合
```typescript
// Twitter Web Intent
const twitterShare = (text: string, imageUrl: string) => {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(imageUrl)}`;
  window.open(url, '_blank');
};

// Facebook Share Dialog
const facebookShare = (url: string) => {
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(shareUrl, '_blank');
};
```

## 🎨 Design Guidelines

### 📱 シェアパネルデザイン
- **モダンなカードデザイン**
- **プレビュー中心のレイアウト**
- **SNSアイコンの統一感**
- **シンプルで分かりやすいボタン配置**

### 🖼️ 生成画像デザイン
- **ブランドカラーの統一**
- **読みやすいフォント選択**
- **魅力的な背景グラデーション**
- **情報の階層構造**

## 🔄 既存システムとの統合

### 📦 依存関係
- `Pet.ts` - ペット情報取得
- `Game.ts` - ゲーム統計取得
- `Evolution.ts` - 進化情報取得
- `dataStorage.ts` - 履歴データ取得

### 🔗 統合ポイント
- `App.tsx`にシェアボタン追加
- `ActionButtons.tsx`に「シェア」ボタン追加
- `PetDisplay.tsx`からペット情報取得
- `StatsPanel.tsx`から統計情報取得

## ✅ Definition of Done

### 🧪 テスト要件
- [ ] 全テストが成功（緑）
- [ ] カバレッジ85%以上達成
- [ ] 型エラーゼロ
- [ ] ESLint警告ゼロ

### 🎯 機能確認
- [ ] スクリーンショット正常動作
- [ ] 各SNSシェア正常動作
- [ ] 画像ダウンロード正常動作
- [ ] ウォーターマーク正常表示
- [ ] 統計情報正確表示

### 📱 デバイス・ブラウザ確認
- [ ] Chrome での動作確認
- [ ] Safari での動作確認
- [ ] Firefox での動作確認
- [ ] モバイルブラウザでの動作確認

## 🚀 実装手順

### Step 1: 型定義・ユーティリティ実装
1. `Share.ts`の作成
2. `shareUtils.ts`の作成
3. 基本的なテスト作成

### Step 2: 画像生成機能実装
1. `imageGenerator.ts`の作成
2. html2canvas統合
3. ウォーターマーク機能実装

### Step 3: Hook実装
1. `useShare.ts`の作成
2. スクリーンショット機能実装
3. SNSシェア機能実装

### Step 4: UI実装
1. `SharePanel.tsx`の作成
2. `SocialButtons.tsx`の作成
3. `StatsCard.tsx`の作成
4. CSS スタイリング

### Step 5: 統合・テスト
1. `App.tsx`への統合
2. 各SNSでの動作確認
3. 画像品質確認

## 📦 必要なライブラリ

### 🛠️ 追加依存関係
```json
{
  "dependencies": {
    "html2canvas": "^1.4.1"
  },
  "devDependencies": {
    "@types/html2canvas": "^1.0.0"
  }
}
```

### 📝 インストール手順
```bash
npm install html2canvas
npm install -D @types/html2canvas
```

## 🌐 SEO・メタタグ設定

### 📋 Open Graph設定
```html
<meta property="og:title" content="AI Pet Buddy - 私のペットを見て！" />
<meta property="og:description" content="可愛いペットと一緒に遊ぼう！" />
<meta property="og:image" content="[ペット画像URL]" />
<meta property="og:type" content="website" />
```

### 🐦 Twitter Card設定
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="AI Pet Buddy" />
<meta name="twitter:description" content="私のペットを見て！" />
<meta name="twitter:image" content="[ペット画像URL]" />
```

## 📚 参考資料
- [PHASE-4-TEMPLATES.md](./PHASE-4-TEMPLATES.md) - 実装テンプレート
- [html2canvas Documentation](https://html2canvas.hertzen.com/)
- [Twitter Web Intents](https://developer.twitter.com/en/docs/twitter-for-websites/web-intents/overview)
- [Facebook Share Dialog](https://developers.facebook.com/docs/sharing/reference/share-dialog)

## 🎊 実装完了後のアクション
1. プルリクエスト作成
2. 各SNSでの動作確認
3. 画像品質レビュー
4. Issue #6（デプロイ対応）への引き継ぎ

---

**📤 SNSシェア機能の実装準備完了！GitHub Copilot Coding Agentによる実装をお願いします！**
