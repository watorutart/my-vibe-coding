# 🐾 AI Pet Buddy

GitHub Copilotを活用して開発したインタラクティブなAIペット育成アプリケーション

![AI Pet Buddy Screenshot](https://via.placeholder.com/600x400?text=AI+Pet+Buddy+Screenshot)

## ✨ 特徴

- 🎮 **インタラクティブなペット育成**: 餌やり、遊び、休憩でペットと触れ合える
- 📊 **リアルタイムステータス**: 幸福度、空腹度、エネルギーを視覚的に管理
- 🎨 **美しいUI**: ポケモン風の可愛いデザイン + 遊戯王のスタイリッシュ要素
- 📱 **レスポンシブ対応**: PC・スマホ両対応
- ⚡ **高速動作**: Vite + React + TypeScript構成
- 🎭 **表情変化**: ペットの状態に応じた自動表情変化

## 🛠️ 技術スタック

- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: CSS3（アニメーション豊富）
- **状態管理**: React Hooks
- **デプロイ**: GitHub Pages（公開中: https://watorutart.github.io/my-vibe-coding/）

## 🚀 クイックスタート

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# GitHub Pages用ビルド
npm run build:github

# デプロイ用プレビュー
npm run deploy:preview
```

**🌐 公開サイト**: https://watorutart.github.io/my-vibe-coding/  
**🔧 開発サーバー**: `http://localhost:5173/` でお楽しみください！

## 🎮 使い方

1. **ペットと挨拶**: アプリを開くと可愛いドラゴンペットが出迎えます
2. **ステータス確認**: 右側のパネルでペットの状態をチェック
3. **お世話開始**:
   - 🍖 **Feed**: 空腹度を回復
   - 🎾 **Play**: 幸福度を上げる（エネルギー消費）
   - 😴 **Rest**: エネルギーを回復

## 📂 プロジェクト構造

```
src/
├── components/          # UIコンポーネント
│   ├── PetDisplay.tsx   # ペット表示
│   ├── StatsPanel.tsx   # ステータスパネル
│   └── ActionButtons.tsx # アクションボタン
├── types/              # TypeScript型定義
└── App.tsx             # メインアプリ
```

## 🏗️ 開発ロードマップ

### ✅ Phase 1: 基盤構築（完了）
- React + TypeScript + Vite セットアップ
- 基本UIコンポーネント実装
- ペット表示・ステータス管理・アクション機能

### ✅ Phase 2: コア機能実装（完了）
- [x] 自動ステータス減衰システム
- [x] レベルアップ・成長システム
- [x] AI会話機能（事前定義パターン）
- [x] データ永続化機能
- [x] 会話パネル実装

### ✅ Phase 3: エンゲージメント強化（完了）
- [x] ビジュアル強化・進化システム
- [x] ミニゲーム実装（Memory, Quiz, Reflex, Rock-Paper-Scissors, Number Guessing）
- [x] カスタマイズ機能
- [x] シェア機能実装

### ✅ Phase 4: 実績・統計システム（完了）
- [x] **実績システム**: 9種類のバッジ、6種類の称号による達成度追跡
- [x] **統計システム**: ゲーム履歴、ケア履歴、セッション統計の包括的記録
- [x] **プログレス管理**: リアルタイム進捗計算と通知システム
- [x] **UI コンポーネント**: BadgeDisplayによる美しい実績表示
- [x] **データ永続化**: localStorage基盤の自動保存機能

### ✅ Phase 5: GitHub Pages デプロイ・本番対応（完了）
- [x] **GitHub Pages自動デプロイ**: Actions使用の完全自動化
- [x] **SEO・メタタグ最適化**: Open Graph、Twitter Card対応
- [x] **パフォーマンス最適化**: バンドルサイズ500KB、ビルド時間2.5秒達成
- [x] **PWA対応**: 完全なPWAメタタグとアイコン対応
- [x] **開発・デプロイツール**: 包括的なnpm scripts
- [x] **本番環境**: https://watorutart.github.io/my-vibe-coding/ で公開中

---

## 📚 ドキュメント

### 🌟 機能ドキュメント
- [**機能ドキュメント（日本語）**](./FEATURES.md) - 全機能の包括的な使用方法とガイド
- [**機能ドキュメント（English）**](./FEATURES-EN.md) - Comprehensive features documentation
- [**デプロイメントガイド**](./DEPLOYMENT.md) - GitHub Pages デプロイの詳細手順
- [**Phase 4 完了レポート**](./PHASE4-ISSUE6-COMPLETION-REPORT.md) - 本番対応完了の詳細

### システム設計
- [**実績・統計システム 技術仕様書**](./system-design/ACHIEVEMENT-SYSTEM-DOCUMENTATION.md) - 包括的なシステム仕様とアーキテクチャ
- [**実績・統計システム シーケンス図**](./system-design/ACHIEVEMENT-SYSTEM-SEQUENCE-DIAGRAMS.md) - 詳細なフローとシーケンス図
- [**実績・統計システム API リファレンス**](./system-design/ACHIEVEMENT-SYSTEM-API-REFERENCE.md) - 完全なAPI仕様書
- [**PWA技術仕様書**](./PWA-TECHNICAL-ARCHITECTURE.md) - PWA実装の詳細
- [**シェア機能仕様書**](./system-design/SHARE-FEATURE-ARCHITECTURE.md) - ソーシャル機能の詳細

### 開発ガイド
- [**開発標準**](./development-standards/) - コーディング規約とベストプラクティス
- [**ゲーム設計書**](./game-docs/) - ミニゲームの詳細仕様
- [**Phase別開発記録**](./phases/) - 開発進捗と技術的判断の記録

---

**Made with ❤️ and GitHub Copilot**
