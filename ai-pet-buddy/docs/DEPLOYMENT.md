# 🚀 AI Pet Buddy - GitHub Pages デプロイメントガイド

## 📋 概要
AI Pet BuddyをGitHub Pagesにデプロイするためのガイドです。

## 🛠️ 設定済み内容

### ✅ Vite設定
- **base**: `/my-vibe-coding/` - GitHub Pages用のベースURL
- **build.outDir**: `dist` - ビルド出力ディレクトリ
- **manualChunks**: vendor/chartsでコード分割済み

### ✅ GitHub Actions
- **トリガー**: `main`ブランチへのプッシュ時
- **パス**: `ai-pet-buddy/**`の変更時のみ実行
- **Node.js**: v18
- **自動デプロイ**: GitHub Pagesへ自動デプロイ

### ✅ SEO最適化
- **Meta Tags**: 基本的なSEOタグ追加済み
- **Open Graph**: ソーシャルメディア共有対応
- **Twitter Card**: Twitterカード対応
- **PWA対応**: マニフェスト・アイコン設定

## 🚀 デプロイ手順

### 1. リポジトリ設定
```bash
# GitHub Pagesを有効化
1. リポジトリの Settings > Pages
2. Source: "GitHub Actions" を選択
3. 保存
```

### 2. 自動デプロイ
```bash
# mainブランチにプッシュするだけで自動デプロイ
git push origin main
```

### 3. 手動デプロイ
```bash
# 必要に応じて手動実行
cd ai-pet-buddy
npm install
npm run build:github
```

## 📊 パフォーマンス最適化

### ✅ 実装済み
- コード分割（vendor/charts）
- 静的アセット最適化
- SEOメタタグ

### 🔄 今後の改善点
- 画像最適化（WebP変換）
- Service Worker実装
- 遅延読み込み
- バンドルサイズ削減

## 🌐 URL
- **本番環境**: `https://watorutart.github.io/my-vibe-coding/`
- **開発環境**: `http://localhost:5173`

## 🔧 トラブルシューティング

### ビルドエラー
```bash
# TypeScriptエラーの場合
npm run build:github  # 型チェックをスキップ
```

### パス問題
```bash
# 相対パスの確認
base: '/my-vibe-coding/' がvite.config.tsに設定済み
```

## 📝 メンテナンス

### 定期チェック項目
- [ ] GitHub Actions実行状況
- [ ] ビルドサイズ確認
- [ ] パフォーマンス監視
- [ ] SEO効果測定

## 🎯 成果指標
- **ビルド時間**: < 3分
- **バンドルサイズ**: ~500KB
- **デプロイ時間**: < 5分
- **アクセス可能性**: 99%以上