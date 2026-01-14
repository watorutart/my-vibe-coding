# 開発者向けガイド (Contributing Guide)

## 開発環境セットアップ

### 1. リポジトリのクローン
```bash
git clone https://github.com/watorutart/my-vibe-coding.git
cd my-vibe-coding/ai-pet-buddy
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. Git フックの初期化
このプロジェクトは [Lefthook](https://github.com/evilmartians/lefthook) を使用して、コミット前の品質チェックを自動化しています。

```bash
npx lefthook install
```

## 開発ワークフロー

### コミット前チェック

コミット時に以下のチェックが**自動的に**実行されます：

#### 1. TypeScript 型チェック
```bash
npm run check:types
# または
npx tsc --noEmit
```

型エラーがある場合、コミットがブロックされます。

#### 2. コードフォーマットチェック
```bash
npm run format:check
# または
npx prettier --check .
```

フォーマットエラーがある場合、コミットがブロックされます。

### コードフォーマット

コードを自動的にフォーマットするには：
```bash
npm run format
```

## 利用可能なスクリプト

### 開発
- `npm run dev` - 開発サーバーを起動
- `npm run build` - プロダクションビルド
- `npm run preview` - ビルド結果をプレビュー

### テスト
- `npm run test` - テストを実行（ワンショット）
- `npm run test:watch` - テストをウォッチモードで実行
- `npm run test:coverage` - カバレッジレポートを生成

### コード品質
- `npm run lint` - ESLint でコードをチェック
- `npm run check:types` - TypeScript 型チェック
- `npm run format` - Prettier でコードを自動フォーマット
- `npm run format:check` - フォーマットチェック（修正なし）

### 統合チェック
- `npm run check:all` - ビルド + テスト + Lint を実行

## Pre-commit フック設定

### 設定ファイル
- `lefthook.yml` - Lefthook の設定ファイル（リポジトリルート）
- `.prettierrc` - Prettier の設定ファイル
- `.prettierignore` - Prettier の除外ファイル設定

### フック内容

#### typecheck
- **実行内容**: `npx tsc --noEmit`
- **目的**: TypeScript の型エラーを検出
- **対象**: ai-pet-buddy/ ディレクトリ

#### format-check
- **実行内容**: `npx prettier --check .`
- **目的**: コードフォーマットの統一性をチェック
- **対象**: `*.{js,jsx,ts,tsx,json,css,md}` ファイル

両方のチェックは**並列実行**されるため、効率的です。

## トラブルシューティング

### フックが実行されない場合
```bash
# Lefthook を再インストール
npx lefthook uninstall
npx lefthook install
```

### フォーマットエラーでコミットできない場合
```bash
# コードを自動フォーマット
npm run format

# 再度コミットを試行
git add .
git commit -m "your message"
```

### 型エラーでコミットできない場合
```bash
# 型エラーを確認
npm run check:types

# エラーを修正後、再度コミット
git commit -m "your message"
```

### 緊急時のフックスキップ（非推奨）
```bash
# 注意: 本来は推奨されません
git commit --no-verify -m "emergency fix"
```

## コーディング規約

### TypeScript
- strict モードを使用
- `any` 型の使用は最小限に
- 明示的な型アノテーションを推奨

### コードスタイル
- Prettier の設定に従う
- セミコロンを使用
- シングルクォートを使用
- インデント: 2スペース

### コミットメッセージ
以下の形式を推奨：
```
<type>: <subject>

<body>
```

**Type 例:**
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント更新
- `style`: コードフォーマット
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: その他の変更

## 参考リンク

- [Lefthook ドキュメント](https://github.com/evilmartians/lefthook)
- [Prettier ドキュメント](https://prettier.io/)
- [TypeScript ドキュメント](https://www.typescriptlang.org/)
