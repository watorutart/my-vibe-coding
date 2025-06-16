# Phase 4-A: PWA機能の完成とテスト環境問題の解決 (Phase 4-A: PWA Feature Completion and Test Environment Issue Resolution)

## 概要 (Overview)
元Issue `#04-PWA-SUPPORT` で定義されたProgressive Web Application (PWA) 機能を完成させます。これには、オフラインサポートの強化、ホーム画面への追加機能の確実な提供、および関連機能のテスト容易性の向上が含まれます。特に、現在のVitestテスト環境 (`happy-dom`) で `localStorage` や `navigator.serviceWorker` が未定義であるために失敗しているPWA関連テスト (`pwaUtils.test.ts` など) の問題を解決することが急務です。

## 関連ドキュメント (Related Documents)
- **元Issue:** `docs/issues/ISSUE-04-PWA-SUPPORT.md`
- **PWA技術資料:** `docs/PWA-DOCUMENTATION.md`, `docs/PWA-TECHNICAL-ARCHITECTURE.md`
- **Service Workerスクリプト:** `public/sw.js`
- **Manifestファイル:** `public/manifest.json`
- **Vitest設定:** `vitest.config.ts`
- **開発ルール:** プロジェクトルートの `AI-PET-DEVELOPMENT-PLAN.md` や `DEVELOPMENT-STANDARDS.md` (仮)

## 期待される動作 (Expected Behavior)
- アプリケーションがPWAとしてブラウザから「ホーム画面に追加」（インストール）できる。
- Service Workerによるキャッシュ戦略が効果的に機能し、主要なアセットがキャッシュされ、オフライン時でもある程度の基本機能（例: 前回表示したペットの状態表示、静的コンテンツの閲覧）が利用可能になる。
- PWA関連のユーティリティ関数 (`src/utils/pwaUtils.ts` など) の単体テストがVitest環境で正しく実行でき、すべて成功する。
- LighthouseのPWAカテゴリで高いスコア（例: 90点以上）を達成する。

## 現在の動作 (Current Behavior)
- PWAの基本的な設定（`manifest.json`, `sw.js`の登録）は存在するものの、オフライン機能やインストールプロンプトの挙動が不安定または未完成の可能性がある。
- `pwaUtils.test.ts` などのPWA関連テストが、テスト環境における `localStorage` や `navigator.serviceWorker` の未定義エラーにより失敗している。

## 関連ファイル (Relevant Files - Expected to be created/modified)
- `src/utils/pwaUtils.ts` (PWA関連ロジック)
- `src/utils/pwaUtils.test.ts` (上記テストファイル)
- `public/sw.js` (Service Workerの実装)
- `public/manifest.json` (Web App Manifest)
- `vitest.config.ts` (テスト環境設定の変更)
- `src/main.tsx` または `src/App.tsx` (Service Worker登録処理、インストールプロンプト表示ロジック)
- `src/test/setupTests.ts` (またはVitestの `setupFiles` で指定するファイル, グローバルモック設定用)

## 開発者向け指示 (Instructions for AI Agent)
- **優先度 (Priority):** Medium
- **目標 (Goal):** PWA機能を完全に動作させ、オフラインサポートとインストール機能を提供し、PWA関連の単体テストがVitest環境で成功するように問題を解決する。
- **具体的なタスク (Specific Tasks):**
    1. **テスト環境問題の解決:**
        - `vitest.config.ts` および/または `src/test/setupTests.ts` (またはVitestの `setupFiles` で指定するファイル) を編集し、テスト環境で `localStorage` および `navigator.serviceWorker` の基本的なモックを提供する。
            - `localStorage`: `happy-dom` は `localStorage` をサポートしているはずだが、問題がある場合はカスタムモックを検討。
            - `navigator.serviceWorker`: `register`, `controller` などの基本的なプロパティやメソッドを持つモックオブジェクトをグローバルスコープ (`global.navigator.serviceWorker`) に設定する。
        - `pwaUtils.test.ts` を修正し、モックされた環境でテストが正しく実行され、パスするようにする。
    2. **Service Worker (`public/sw.js`) の強化:**
        - キャッシュ戦略（例: Cache First for static assets, Network First or Stale-While-Revalidate for dynamic content/API calls）を見直し、最適化する。
        - `install`, `activate`, `fetch` イベントハンドラを適切に実装する。
        - キャッシュするアセットのリスト（プレキャッシュ対象）を適切に管理する。
        - キャッシュのバージョン管理と古いキャッシュのクリア処理を実装する。
    3. **Manifest (`public/manifest.json`) の確認と最適化:**
        - `name`, `short_name`, `icons`, `start_url`, `display`, `background_color`, `theme_color` などのプロパティが適切に設定されていることを確認する。
        - 様々なデバイスサイズに対応するアイコンを提供する。
    4. **インストールプロンプトの実装:**
        - `beforeinstallprompt` イベントをリッスンし、ユーザーにインストールを促すカスタムUI（例: ボタン）を表示するロジックを `App.tsx` や関連コンポーネントに実装する。
    5. **PWA機能のテスト:**
        - ブラウザの開発者ツール（Applicationタブ）を使用して、Service Workerの動作、キャッシュストレージの内容、Manifestの解釈を確認する。
        - オフライン状態をシミュレートして、アプリが期待通りに動作するかテストする。
        - Lighthouse監査を実行し、PWAカテゴリのスコアと指摘事項を確認・改善する。
- **考慮事項 (Considerations):**
    - **テストの分離:** `pwaUtils.ts` のテストは、Service Worker自体の複雑な動作をテストするのではなく、ユーティリティ関数が正しく `navigator.serviceWorker` APIを呼び出したり、状態を管理したりするかを検証することに焦点を当てる。
    - **Service Workerのデバッグ:** Service Workerのデバッグは複雑な場合があるため、ブラウザの開発者ツールを積極的に活用する (`chrome://serviceworker-internals/` など)。
    - **ユーザー体験:** オフライン時やインストールプロンプトの表示タイミングなど、ユーザー体験を損なわないように配慮する。
    - **Vite PWA Plugin:** `vite-plugin-pwa` のようなプラグインが導入されている場合、その設定とドキュメントを最大限に活用する。導入されていない場合、手動での `sw.js` 管理となる。
- **テスト要件 (Testing Requirements):**
    - `pwaUtils.test.ts` のすべての単体テストが、モックされた環境下で成功すること。
    - Service Workerの主要な機能（アセットのキャッシング、オフライン時のフォールバック提供など）は、手動テストおよびブラウザ開発者ツールでの確認を主とする。
    - LighthouseのPWA監査で、主要なチェック項目をクリアしていること。
- **完了条件 (Acceptance Criteria):**
    - アプリケーションがPWAとしてブラウザからインストール可能である。
    - オフライン時にも、キャッシュされたコンテンツにより基本的なアプリケーションUIが表示され、利用可能な機能が動作する。
    - `pwaUtils.test.ts` を含むPWA関連の単体テストがすべて成功する。
    - LighthouseのPWAカテゴリで目標スコア（例: 90点以上）を達成する。
    - コード変更は、既存のESLintルールおよびプロジェクトのコーディング規約に準拠する。

## 参照情報 (References)
- MDN: Progressive Web Apps (PWA)
- MDN: Service Worker API
- MDN: Web App Manifest
- Google Developers: Lighthouse
- Vitest ドキュメント: Mocking, `setupFiles`
- `vite-plugin-pwa` (もし使用している場合)
