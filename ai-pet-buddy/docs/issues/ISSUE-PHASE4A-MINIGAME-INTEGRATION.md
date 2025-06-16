# Phase 4-A: ミニゲーム機能の統合 (Phase 4-A: Mini-Game Feature Integration)

## 概要 (Overview)
AIペットバディアプリケーションにエンゲージメント向上のためのミニゲーム機能を統合します。これは元Issue `#03-MINI-GAMES` で計画された機能であり、本Issueはその具体的な実装フェーズとなります。少なくとも1種類のシンプルなミニゲームを実装し、ペットのステータス（例: エネルギー、幸福度）と連動させることを目指します。

## 関連ドキュメント (Related Documents)
- **元Issue:** `docs/issues/ISSUE-03-MINI-GAMES.md`
- **ゲーム仕様:** `docs/game-docs/MINI-GAMES-DOCUMENTATION.md` (このドキュメントに詳細なゲームルール、UI/UXのアイデア、技術的考察を記載、または参照すること)
- **開発ルール:** プロジェクトルートの `AI-PET-DEVELOPMENT-PLAN.md` や `DEVELOPMENT-STANDARDS.md` (仮) に記載された全般的な開発ルール、特に「AI Pet Buddy開発ルール」セクション。

## 期待される動作 (Expected Behavior)
- ユーザーはアプリケーション内からミニゲームを起動し、プレイできる。
- ミニゲームのプレイにはペットの「エネルギー」などのステータスを消費する。
- ミニゲームの結果（スコア、クリア状況など）に応じて、ペットの「幸福度」などのステータスが変動する。
- ミニゲームのUIは既存アプリケーションのデザインと調和し、直感的に操作できる。

## 関連ファイル (Relevant Files - Expected to be created/modified)
- **型定義:** `src/types/game.d.ts`, `src/types/pet.d.ts` (更新の可能性)
- **ゲームロジック:** `src/utils/game/` (例: `src/utils/game/gameLogic.ts`, `src/utils/game/scoreCalculator.ts`)
- **ゲームコンポーネント:** `src/components/game/` (例: `src/components/game/GameArea.tsx`, `src/components/game/StartScreen.tsx`)
- **ゲーム用フック:** `src/hooks/useGame.ts` (ゲームの状態管理やロジック呼び出し)
- **メインアプリ統合:** `src/App.tsx`, `src/components/PetInteractionPanel.tsx` (ゲームへの導線)
- **テストファイル:** 上記各ファイルの `*.test.ts` / `*.test.tsx`

## 開発者向け指示 (Instructions for AI Agent)
- **優先度 (Priority):** Medium
- **目標 (Goal):** `docs/game-docs/MINI-GAMES-DOCUMENTATION.md` に基づいて、選択されたミニゲーム（例: シンプルなクリッカーゲーム、タイミングゲームなど）を1種類実装し、アプリケーションに完全に統合する。
- **具体的なタスク (Specific Tasks):**
    1. **仕様確認:** `ISSUE-03-MINI-GAMES.md` および `MINI-GAMES-DOCUMENTATION.md` を熟読し、実装するミニゲームのルール、UI要件、ペットステータスとの連携方法を完全に理解する。
    2. **型定義:** `src/types/game.d.ts` にゲームの状態（例: `gameState`, `score`, `level`）、設定などの型を定義する。必要に応じて `src/types/pet.d.ts` を更新する。 (TypeScript開発効率化ルール: 型定義先行)
    3. **ゲームロジック実装 (`src/utils/game/`):**
        - ゲームのコアロジック（ルール判定、スコア計算、状態遷移など）を純粋な関数として実装する。
        - TDD原則に従い、ロジックに対する単体テスト (`*.test.ts`) を先に作成または並行して作成する。
    4. **ゲーム状態管理フック (`src/hooks/useGame.ts`):**
        - ゲームの状態（スコア、ライフ、ゲームオーバーフラグなど）を管理するカスタムフックを作成する。
        - `useState`, `useReducer`, `useEffect` などを適切に利用する。
        - ペットのステータス（エネルギー消費、幸福度付与など）を更新するための関数呼び出し（例: Zustandストアのアクション）もこのフックが担う。
    5. **UIコンポーネント実装 (`src/components/game/`):**
        - ゲーム画面、スタート画面、結果表示画面などのReactコンポーネントを作成する。
        - UIコンポーネントの単体テスト/UIテスト (`*.test.tsx`) を作成する。
        - 既存のUIコンポーネント（ボタン、モーダルなど）を再利用し、デザインの一貫性を保つ。
    6. **アプリケーション統合:**
        - メインUI（例: ペットとのインタラクションパネル）にミニゲームを開始するためのボタンや導線を設置する。
        - ゲームプレイの条件（例: エネルギーが一定以上ないとプレイできない）を実装する。
    7. **テスト:** 単体テスト、コンポーネントテスト、統合テストを作成し、カバレッジを意識する。
- **考慮事項 (Considerations):**
    - **ファイル構成:** 「AI Pet Buddy開発ルール」のファイル構成に従う (`src/types/`, `src/utils/`, `src/components/`, `src/hooks/`)。
    - **TDD:** 型定義更新 → 型テスト作成 → ビジネスロジック実装 → 機能テスト作成 → UI実装 → UIテスト作成 のフローを意識する。
    - **パフォーマンス:** ゲームがブラウザのパフォーマンスに大きな負荷をかけないように注意する。特に頻繁な状態更新やアニメーションがある場合は、`React.memo`, `useMemo`, `useCallback` を適切に使用し、不要な再レンダリングを避ける。
    - **UI/UX:** ユーザーが直感的に理解でき、楽しめるようなインターフェースを心がける。
    - **拡張性:** 将来的に他のミニゲームを追加しやすいように、共通化できるロジックやコンポーネントは汎用的に設計する。
- **テスト要件 (Testing Requirements):**
    - ゲームロジック (`src/utils/game/`) に対する単体テストを作成し、主要なルールや計算が正しいことを保証する。
    - ゲームUIコンポーネント (`src/components/game/`) に対するUIテストを作成し、表示や基本的なインタラクションが期待通りであることを確認する。
    - ミニゲームの開始から終了、およびペットステータスへの影響までの一連の流れを検証する統合テストを作成する。
    - テストカバレッジ目標（例: 90%以上）を意識する。
- **完了条件 (Acceptance Criteria):**
    - 仕様書に基づいたミニゲームが少なくとも1種類プレイ可能である。
    - ミニゲームの開始、プレイ中（入力受付、状態更新）、終了（結果表示）のフローが正しく実装されている。
    - ミニゲームのプレイがペットのステータス（エネルギー消費、幸福度など）に仕様通り反映される。
    - 実装された機能に関連するすべてのテストが成功し、十分なカバレッジが達成されている。
    - コードはプロジェクトのコーディング規約およびESLintルールに準拠している。

## 参照情報 (References)
- React公式ドキュメント (フック、コンポーネント)
- Zustand (または使用している状態管理ライブラリ) ドキュメント
- React Testing Library / Vitest ドキュメント
