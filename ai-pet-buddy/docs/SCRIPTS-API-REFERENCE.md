# 🛠️ AI Pet Buddy - スクリプト・API リファレンス

## 📋 概要
AI Pet Buddyで使用可能なnpmスクリプト、設定オプション、APIの完全なリファレンスです。

---

## 🚀 npm スクリプト リファレンス

### 開発用スクリプト

#### `npm run dev`
```bash
npm run dev
```
- **目的**: 開発サーバーの起動
- **ポート**: `http://localhost:5173/`
- **機能**: ホットリロード、TypeScript監視、高速リフレッシュ
- **使用場面**: 日常的な開発作業

#### `npm run preview`
```bash
npm run preview
```
- **目的**: ビルド結果のローカルプレビュー
- **ポート**: `http://localhost:4173/`
- **機能**: 本番ビルドの動作確認
- **使用場面**: デプロイ前の最終確認

#### `npm run preview:dist`
```bash
npm run preview:dist
```
- **目的**: dist フォルダの内容をプレビュー
- **機能**: ビルド成果物の直接プレビュー
- **使用場面**: ビルド結果の詳細確認

---

### ビルド用スクリプト

#### `npm run build`
```bash
npm run build
```
- **目的**: TypeScript型チェック + 本番ビルド
- **プロセス**: 
  1. TypeScript コンパイル（`tsc -b --noEmitOnError false`）
  2. Vite ビルド実行
- **出力**: `dist/` フォルダ
- **使用場面**: ローカル本番ビルド

#### `npm run build:github`
```bash
npm run build:github
```
- **目的**: GitHub Pages用ビルド（型チェックスキップ）
- **特徴**: TypeScript エラーがあってもビルド実行
- **設定**: `base: '/my-vibe-coding/'` 適用
- **使用場面**: CI/CD、デプロイ用ビルド

#### `npm run build:analyze`
```bash
npm run build:analyze
```
- **目的**: バンドルサイズ分析
- **機能**: 依存関係とバンドルサイズの詳細分析
- **出力**: バンドル分析レポート
- **使用場面**: パフォーマンス最適化

---

### テスト用スクリプト

#### `npm run test`
```bash
npm run test
```
- **目的**: 全テストの一回実行
- **フレームワーク**: Vitest
- **設定**: `vitest run`
- **使用場面**: CI/CD、プリコミット

#### `npm run test:watch`
```bash
npm run test:watch
```
- **目的**: テストの監視モード
- **機能**: ファイル変更時の自動テスト実行
- **使用場面**: TDD開発、継続的テスト

#### `npm run test:coverage`
```bash
npm run test:coverage
```
- **目的**: テストカバレッジ計測
- **出力**: カバレッジレポート
- **形式**: HTML、JSON、テキスト
- **使用場面**: 品質管理、コードレビュー

#### `npm run test:ui`
```bash
npm run test:ui
```
- **目的**: Vitest UI インターフェース起動
- **機能**: ブラウザベースのテスト管理
- **使用場面**: インタラクティブなテスト開発

#### `npm run test:ci`
```bash
npm run test:ci
```
- **目的**: CI環境用テスト実行
- **設定**: `--reporter=verbose`
- **機能**: 詳細なテストログ出力
- **使用場面**: GitHub Actions、自動化

---

### 品質管理スクリプト

#### `npm run lint`
```bash
npm run lint
```
- **目的**: ESLint による静的解析
- **設定**: `eslint.config.js`
- **対象**: TypeScript、React ファイル
- **使用場面**: コード品質チェック

#### `npm run check:types`
```bash
npm run check:types
```
- **目的**: TypeScript型チェック
- **設定**: `tsc --noEmit`
- **機能**: ビルドなしの型確認
- **使用場面**: 型エラーの迅速確認

#### `npm run check:all`
```bash
npm run check:all
```
- **目的**: 包括的品質チェック
- **プロセス**: `build` → `test` → `lint`
- **使用場面**: プリコミット、リリース前

#### `npm run check:enhanced`
```bash
npm run check:enhanced
```
- **目的**: 拡張品質チェック
- **スクリプト**: `./enhanced-quality-check.sh`
- **機能**: カスタム品質管理ツール
- **使用場面**: 高度な品質管理

---

### デプロイ用スクリプト

#### `npm run deploy:preview`
```bash
npm run deploy:preview
```
- **目的**: デプロイ結果のローカルプレビュー
- **プロセス**: 
  1. `npm run build:github`
  2. `npm run preview:dist`
- **URL**: `http://localhost:4173/my-vibe-coding/`
- **使用場面**: デプロイ前の最終確認

---

### 通知・自動化スクリプト（macOS）

#### `npm run notify`
```bash
npm run notify
```
- **目的**: 音声通知の実行
- **スクリプト**: `./notify.sh`
- **機能**: macOS システム音声再生
- **使用場面**: 作業完了通知

#### `npm run test:complete`
```bash
npm run test:complete
```
- **目的**: テスト実行 + 通知
- **プロセス**: `test` → `notify`
- **使用場面**: バックグラウンドテスト実行

#### `npm run build:complete`
```bash
npm run build:complete
```
- **目的**: ビルド実行 + 通知
- **プロセス**: `build` → `notify`
- **使用場面**: 長時間ビルドの完了通知

---

## ⚙️ 設定ファイル リファレンス

### Vite設定（vite.config.ts）

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/my-vibe-coding/',      // GitHub Pages用ベース
  build: {
    outDir: 'dist',              // 出力ディレクトリ
    sourcemap: false,            // ソースマップ無効
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
        },
      },
    },
  },
})
```

#### 設定項目詳細
- **base**: GitHub Pages用のベースURL
- **outDir**: ビルド出力先ディレクトリ
- **sourcemap**: 本番環境でのソースマップ生成制御
- **manualChunks**: コード分割の設定

### TypeScript設定（tsconfig.json）

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Vitest設定（vitest.config.ts）

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',        // DOM環境でのテスト
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
})
```

---

## 🔗 GitHub Actions API

### デプロイワークフロー

```yaml
name: Deploy AI Pet Buddy to GitHub Pages
on:
  push:
    branches: [ main ]
    paths: [ 'ai-pet-buddy/**' ]
  workflow_dispatch:
```

#### トリガー条件
- **push**: `main`ブランチへのプッシュ
- **paths**: `ai-pet-buddy/**` 配下の変更
- **workflow_dispatch**: 手動実行

#### ジョブ詳細
1. **Checkout**: リポジトリのチェックアウト
2. **Node.js Setup**: Node.js 18 + npm キャッシュ
3. **Install**: `npm ci` で依存関係インストール
4. **Build**: `npm run build:github` でビルド
5. **Deploy**: GitHub Pages へのデプロイ

---

## 📊 パフォーマンス API

### ビルドメトリクス

```bash
# ビルド時間計測
time npm run build:github

# バンドルサイズ確認
npm run build:analyze

# 依存関係サイズ確認
npm ls --depth=0
```

### 目標パフォーマンス指標
- **ビルド時間**: < 3秒
- **バンドルサイズ**: < 500KB
- **gzip圧縮**: < 150KB
- **初回読み込み**: < 2秒

---

## 🛠️ カスタムスクリプトの作成

### 新しいスクリプトの追加

```json
// package.json
{
  "scripts": {
    "custom:script": "echo 'Custom script execution'"
  }
}
```

### シェルスクリプトの作成

```bash
#!/bin/bash
# custom-script.sh

echo "Starting custom process..."
npm run build:github
npm run test:run
echo "Process completed!"
```

### 実行権限の付与

```bash
chmod +x custom-script.sh
```

---

## 🔍 トラブルシューティング API

### よく使用するデバッグコマンド

```bash
# 依存関係の確認
npm ls

# キャッシュのクリア
npm cache clean --force

# node_modules の完全再インストール
rm -rf node_modules package-lock.json
npm install

# TypeScript エラーの詳細確認
npx tsc --noEmit --pretty

# ESLint エラーの詳細確認
npx eslint . --ext .ts,.tsx
```

### パフォーマンス診断

```bash
# ビルド詳細ログ
npm run build:github -- --verbose

# テスト詳細実行
npm run test:ci

# 依存関係の脆弱性チェック
npm audit
```

---

## 📝 使用例

### 日常的な開発フロー

```bash
# 1. 開発環境起動
npm run dev

# 2. テスト監視モード（別ターミナル）
npm run test:watch

# 3. 作業完了後の確認
npm run check:all

# 4. デプロイ前プレビュー
npm run deploy:preview
```

### CI/CD フロー

```bash
# 1. 依存関係インストール
npm ci

# 2. 型チェック
npm run check:types

# 3. テスト実行
npm run test:ci

# 4. リンター実行
npm run lint

# 5. ビルド
npm run build:github
```

### パフォーマンス最適化フロー

```bash
# 1. 現在のサイズ確認
npm run build:analyze

# 2. 依存関係確認
npm ls --depth=0

# 3. バンドルサイズ最適化後
npm run build:github

# 4. 結果比較
npm run build:analyze
```

---

**🎯 このリファレンスを使って効率的な開発を進めましょう！**

---

*最終更新: 2024年6月15日*
*バージョン: v1.0.0*