# Phase 4-B: Lighthouseスコア90点以上達成 (Phase 4-B: Achieve Lighthouse Score 90+)

## 概要 (Overview)
アプリケーションの全体的な品質を向上させるため、Google Lighthouseを使用して監査を行い、主要カテゴリ（パフォーマンス、アクセシビリティ、ベストプラクティス、SEO）でそれぞれ90点以上のスコアを達成することを目指します。特に、ユーザー体感速度に直結する「パフォーマンス」カテゴリの改善に重点を置きます。PWAカテゴリについては、`ISSUE-PHASE4A-PWA-COMPLETION` で対応済み、または並行して高スコアを目指します。

## 関連ドキュメント (Related Documents)
- **Vite設定:** `vite.config.ts` (ビルド最適化設定)
- **HTMLエントリーポイント:** `index.html`
- **PWA関連ファイル:** `public/manifest.json`, `public/sw.js` (これらもスコアに影響)
- **開発ルール:** プロジェクトルートの `AI-PET-DEVELOPMENT-PLAN.md` や `DEVELOPMENT-STANDARDS.md` (仮)

## 期待される動作 (Expected Behavior)
- Google Chrome DevToolsのLighthouse監査で、パフォーマンス、アクセシビリティ、ベストプラクティス、SEOの各カテゴリにおいて90点以上のスコアを達成する。
- アプリケーションの読み込み速度、インタラクティブ性、視覚的安定性が向上する。
- より多くのユーザーが快適にアプリケーションを利用できるようになる（アクセシビリティ向上）。

## 現在の動作 (Current Behavior)
現在のLighthouseスコアは不明。監査を実行して現状を把握する必要がある。

## 関連ファイル (Relevant Files - Expected to be modified)
- `vite.config.ts` (ビルド設定、チャンキング、最小化など)
- `index.html` (metaタグ、linkタグ、scriptタグの配置など)
- `src/App.tsx` および主要なReactコンポーネント (レンダリングパフォーマンス、コード分割)
- `src/assets/` 内の画像ファイル (最適化)
- CSSファイル/スタイル定義 (CSSの最適化、クリティカルCSS)
- `public/manifest.json`, `public/sw.js` (PWA関連の最適化も含む)
- `public/robots.txt` (SEO関連)

## 開発者向け指示 (Instructions for AI Agent)
- **優先度 (Priority):** Medium
- **目標 (Goal):** Google Lighthouseを使用してアプリケーションを監査し、パフォーマンス、アクセシビリティ、ベストプラクティス、SEOの各カテゴリで90点以上を達成するための改善を行う。
- **具体的なタスク (Specific Tasks):**
    1. **現状測定:** Chrome DevToolsのLighthouseタブを使用して、現在のアプリケーション（ローカル開発サーバーまたはステージング環境）のスコアを測定する。モバイルとデスクトップの両方で監査を行う。
    2. **レポート分析:** 生成されたLighthouseレポートを詳細に確認し、各カテゴリでのスコア低下の原因となっている指摘事項（Opportunities, Diagnostics）を特定する。
    3. **パフォーマンス改善 (重点項目):**
        - **画像最適化:** 画像を適切なフォーマット（例: WebP）に変換し、圧縮する。遅延読み込み (`loading="lazy"`) を実装する。レスポンシブ画像 (`<picture>` 要素や `srcset` 属性）を使用する。
        - **コード最小化と分割:** Viteのビルド設定 (`vite.config.ts`) を確認し、JavaScript/CSSが最小化されていること、不要なコードが削除 (ツリーシェイキング) されていることを確認する。ルートベースのコード分割やコンポーネントレベルの遅延読み込み (`React.lazy`, `Suspense`) を導入・最適化する。
        - **レンダリング最適化:** `React.memo`, `useMemo`, `useCallback` を適切に使用して不要な再レンダリングを削減する。大きなリストには仮想化 (windowing) を検討する。
        - **クリティカルCSS:** Above-the-foldコンテンツに必要な最小限のCSSをインライン化するか、早期に読み込む。
        - **ブラウザキャッシュ:** HTTPキャッシュヘッダーを適切に設定する（Viteのビルド出力でハッシュベースのファイル名が使われていれば、長期キャッシュが有効）。
        - **フォント読み込み最適化:** `font-display: swap;` を使用し、FOIT/FOUTを制御する。
    4. **アクセシビリティ改善:**
        - **セマンティックHTML:** 適切なHTMLタグ (`<nav>`, `<main>`, `<article>`, `<button>` など) を使用する。
        - **ARIA属性:** 必要に応じてARIA属性 (`aria-label`, `aria-hidden`, `role` など) を正しく使用する。
        - **キーボードナビゲーション:** すべてのインタラクティブ要素がキーボードで操作可能であることを確認する。フォーカスインジケータが明確であること。
        - **色のコントラスト:** テキストと背景のコントラスト比がWCAG基準を満たしていることを確認する。
        - **画像代替テキスト:** すべての意味のある画像に適切な `alt` テキストを提供する。
    5. **ベストプラクティス改善:**
        - **HTTPS:** (デプロイ環境で) HTTPSを使用する。
        - **安全なAPI:** `document.write()` や古いAPIの使用を避ける。
        - **JavaScriptエラー:** ブラウザコンソールにエラーが表示されないようにする。
        - **適切なアスペクト比の画像:** 画像要素に `width` と `height` を指定してレイアウトシフトを防ぐ。
    6. **SEO改善:**
        - **メタタグ:** 各ページに適切でユニークな `<title>` タグと `<meta name="description">` を設定する。
        - **`robots.txt`:** クロールを制御するために `public/robots.txt` を適切に設定する。
        - **リンク:** リンクテキストが説明的であること。内部リンク構造が適切であること。
        - **構造化データ:** (可能であれば) 構造化データマークアップ (JSON-LDなど) を追加する。
    7. **繰り返し検証:** 改善策を適用するたびにLighthouseでスコアを再測定し、目標達成を確認する。一つの変更が他のスコアに悪影響を与えないかも注意する。
- **考慮事項 (Considerations):**
    - **測定駆動:** パフォーマンス改善は推測ではなく、LighthouseやブラウザのPerformanceタブなどを用いた測定に基づいて行う。
    - **Viteの活用:** Viteのビルド最適化機能（チャンキング、ツリーシェイキング、CSSの自動プレフィックスなど）を最大限に活用する。
    - **ユーザー体験優先:** スコア向上が目的化し、ユーザー体験を損なうような変更は避ける。
    - **段階的改善:** 一度に全てを修正しようとせず、影響の大きい項目から優先的に対応する。
- **テスト要件 (Testing Requirements):**
    - Lighthouseスコアの改善を客観的に示す（改善前後のレポート比較）。
    - 適用した改善策によって、既存のアプリケーション機能が損なわれていないことを確認する（手動テストおよび既存の自動テストスイートのパス）。
- **完了条件 (Acceptance Criteria):**
    - Lighthouse監査において、パフォーマンス、アクセシビリティ、ベストプラクティス、SEOの各カテゴリでそれぞれ90点以上を達成する。
    - 主要なパフォーマンス指標（例: LCP, FID/INP, CLS）が良好な範囲にある。
    - 適用された変更が、アプリケーションの機能や安定性に悪影響を与えていない。
    - コード変更は、既存のESLintルールおよびプロジェクトのコーディング規約に準拠する。

## 参照情報 (References)
- Google Developers: Lighthouse
- web.dev by Google (パフォーマンス、アクセシビリティなどの学習リソース)
- MDN Web Docs (HTML, CSS, JavaScript, Accessibility)
- Vite公式ドキュメント: Build Options, Performance
