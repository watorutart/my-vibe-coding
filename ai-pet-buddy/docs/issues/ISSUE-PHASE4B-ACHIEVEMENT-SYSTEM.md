# Phase 4-B: 実績システムの完成 (Phase 4-B: Achievement System Completion)

## 概要 (Overview)
元Issue `#05-ACHIEVEMENT-STATISTICS` で計画された実績（アチーブメント）システムを完全に実装し、完成させます。このタスクは、`ISSUE-HOTFIX-MEMORY-LEAK-USEACHIEVEMENTS` で `useAchievements` フックのメモリリーク問題が解決されたことを前提とします。実績の定義、達成条件の判定ロジック、実績達成時のユーザー通知、および獲得実績の表示UIを包括的に実装します。

## 関連ドキュメント (Related Documents)
- **元Issue:** `docs/issues/ISSUE-05-ACHIEVEMENT-STATISTICS.md`
- **実績システム設計:** `docs/system-design/ACHIEVEMENT-SYSTEM-DOCUMENTATION.md`, `ACHIEVEMENT-SYSTEM-API-REFERENCE.md` (APIは将来的なサーバー連携用だが、データ構造の参考に), `ACHIEVEMENT-SYSTEM-OVERVIEW.md`
- **関連フック:** `src/hooks/useAchievements.ts` (メモリリーク修正済みであること)
- **開発ルール:** プロジェクトルートの `AI-PET-DEVELOPMENT-PLAN.md` や `DEVELOPMENT-STANDARDS.md` (仮)、特に「AI Pet Buddy開発ルール」セクション。

## 前提条件 (Prerequisites)
- `ISSUE-HOTFIX-MEMORY-LEAK-USEACHIEVEMENTS` がクローズされ、`useAchievements.ts` のメモリリークが解消されていること。

## 期待される動作 (Expected Behavior)
- ユーザーはアプリケーション内での特定のアクション（例: ミニゲームのクリア、特定回数のインタラクション、ペットの特定レベル到達など）を通じて実績を解除できる。
- 実績を達成すると、ユーザーに視覚的な通知（例: トーストメッセージ、モーダル）が表示される。
- ユーザーは獲得した実績の一覧を専用のUI画面で確認できる。
- 実績データは永続化され、アプリケーションを再起動しても保持される（当面は `localStorage` を想定）。

## 関連ファイル (Relevant Files - Expected to be created/modified)
- **型定義:** `src/types/achievements.d.ts` (実績の構造、状態など)
- **実績定義データ:** `src/config/achievements.json` または `src/constants/achievements.ts` (実績リスト、条件、アイコン、説明文など)
- **実績ロジック/ユーティリティ:** `src/utils/achievementManager.ts` (実績判定、状態更新など)
- **実績管理フック:** `src/hooks/useAchievements.ts` (既存フックの拡張・改善)
- **実績表示UIコンポーネント:** `src/components/achievements/AchievementList.tsx`, `src/components/achievements/AchievementItem.tsx`, `src/components/achievements/AchievementNotification.tsx`
- **メインアプリ統合:** `App.tsx` (実績システム初期化、通知システム連携), `src/components/layout/Navbar.tsx` (実績画面への導線)
- **テストファイル:** 上記各ファイルの `*.test.ts` / `*.test.tsx`

## 開発者向け指示 (Instructions for AI Agent)
- **優先度 (Priority):** Medium (Hotfix完了後)
- **目標 (Goal):** `ACHIEVEMENT-SYSTEM-DOCUMENTATION.md` および関連ドキュメントに基づき、実績システムを完全に実装する。実績データの管理、達成条件の監視と判定、ユーザーへの通知、実績一覧表示機能を含む。
- **具体的なタスク (Specific Tasks):**
    1. **前提確認:** `ISSUE-HOTFIX-MEMORY-LEAK-USEACHIEVEMENTS` が解決済みであることを確認する。
    2. **実績定義:**
        - `ACHIEVEMENT-SYSTEM-DOCUMENTATION.md` に基づき、実績のリスト（ID, 名前, 説明, アイコン, 達成条件, 報酬ポイントなど）を `src/config/achievements.json` や `src/constants/achievements.ts` に定義する。
        - `src/types/achievements.d.ts` に実績オブジェクトの型 (`Achievement`, `UserAchievementStatus` など) を定義する。 (TypeScript開発効率化ルール: 型定義先行)
    3. **実績判定ロジック (`src/utils/achievementManager.ts`):**
        - アプリケーション内の様々なイベント（状態変更、アクション実行）を監視または受け取り、実績の達成条件が満たされたかを判定するロジックを実装する。
        - 判定ロジックは効率的で、パフォーマンスに影響を与えないようにする。
        - TDD原則に従い、判定ロジックの単体テストを作成する。
    4. **実績状態管理 (`useAchievements.ts` の拡張):**
        - ユーザーの獲得済み実績、未獲得実績、進捗状況などを管理する状態ロジックを `useAchievements.ts` に実装または拡張する。
        - 実績達成時に状態を更新し、永続化ストレージ（`localStorage`）に保存/読み込みする処理を実装する。
    5. **実績達成通知 (`src/components/achievements/AchievementNotification.tsx`):**
        - 実績達成時に表示されるトースト通知やモーダルなどのUIコンポーネントを作成する。
        - 通知は既存の通知システム（もしあれば）と連携するか、新たに実装する。
    6. **実績一覧表示UI (`src/components/achievements/AchievementList.tsx`, `AchievementItem.tsx`):**
        - ユーザーが獲得した実績と未獲得の実績（ヒント付きで表示するなど）を一覧表示するUIコンポーネントを作成する。
        - 各実績の詳細（アイコン、説明、達成日など）を表示する。
    7. **アプリケーション統合:**
        - アプリケーションの適切な箇所（例: `App.tsx` での初期ロード時、特定アクション完了時）で実績判定ロジックを呼び出す。
        - ナビゲーションメニューなどに実績一覧ページへのリンクを追加する。
    8. **テスト:** 単体テスト、コンポーネントテスト、統合テストを作成し、カバレッジを意識する。
- **考慮事項 (Considerations):**
    - **ファイル構成:** 「AI Pet Buddy開発ルール」のファイル構成に従う。
    - **TDD:** 型定義更新 → 型テスト作成 → ビジネスロジック実装 → 機能テスト作成 → UI実装 → UIテスト作成 のフローを意識する。
    - **拡張性:** 新しい実績を後から容易に追加できるように、実績定義や判定ロジックを設計する。
    - **パフォーマンス:** 実績判定が頻繁に行われる場合、アプリケーション全体のパフォーマンスに影響を与えないように注意する。
    - **UI/UX:** 実績達成の喜びや、実績一覧を見る楽しさを高めるようなUI/UXを心がける。
- **テスト要件 (Testing Requirements):**
    - 実績判定ロジック (`src/utils/achievementManager.ts`) に対する単体テストを作成し、様々な達成条件が正しく判定されることを保証する。
    - 実績状態管理フック (`useAchievements.ts`) のロジック（状態更新、永続化）に対する単体テストを作成する。
    - 実績表示UIコンポーネント (`src/components/achievements/`) に対するUIテストを作成する。
    - 特定のアクション実行から実績達成、通知、一覧表示までの一連の流れを検証する統合テストを作成する。
    - テストカバレッジ目標（例: 90%以上）を意識する。
- **完了条件 (Acceptance Criteria):**
    - ドキュメントに定義された主要な実績がシステムに組み込まれている。
    - ユーザーの特定のアクションに応じて実績が正しく解除（達成）される。
    - 実績達成がユーザーに適切に通知される。
    - ユーザーが獲得した実績および未獲得の実績（進捗がわかる場合はそれも）を一覧で確認できる。
    - 実績データが `localStorage` に永続化され、リロード後も保持される。
    - 実装された機能に関連するすべてのテストが成功し、十分なカバレッジが達成されている。
    - コードはプロジェクトのコーディング規約およびESLintルールに準拠している。

## 参照情報 (References)
- React公式ドキュメント
- Zustand (または使用している状態管理ライブラリ) ドキュメント
- React Testing Library / Vitest ドキュメント
