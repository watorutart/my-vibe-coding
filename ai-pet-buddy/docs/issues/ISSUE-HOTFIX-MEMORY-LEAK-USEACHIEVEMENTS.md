# Hotfix: `useAchievements` フックにおけるメモリリークの特定と修正 (Hotfix: Identify and Fix Memory Leak in `useAchievements` Hook)

## 概要 (Overview)
`useAchievements`フックにおいてメモリリークが疑われます。`npm run test:run` 実行時に "heap out of memory" エラーが関連テスト (`useAchievements.test.ts`) で発生しており、これが原因である可能性が高いです。この問題を解決し、アプリケーションの安定性を向上させる必要があります。

## 発生条件・再現手順 (Conditions / Steps to Reproduce)
1. ターミナルで `cd /Users/suzukiwataru/src/my-vibe-coding/ai-pet-buddy` を実行。
2. `npm run test:run` を実行。
3. `useAchievements.test.ts` に関連するテストで "JavaScript heap out of memory" エラーが発生することを確認。

## 期待される動作 (Expected Behavior)
- `useAchievements` フック内のメモリリークが解消される。
- `npm run test:run` を実行した際に、`useAchievements.test.ts` に関連する "heap out of memory" エラーが発生しなくなる。
- 実績システム関連機能がメモリリークなしに正しく動作する。

## 現在の動作 (Current Behavior)
`useAchievements.test.ts` を含むテストスイート実行中に "JavaScript heap out of memory" エラーが発生し、テストがクラッシュする。

## 関連ファイル (Relevant Files)
- `src/hooks/useAchievements.ts`
- `src/hooks/useAchievements.test.ts`
- `src/types/achievements.d.ts` (または関連する型定義ファイル)
- 上記フックを使用している可能性のあるコンポーネント

## 修正状況 (Fix Status)
- `useAchievements` フック内のメモリリークは修正されました。
- 関連するテスト (`useAchievements.test.ts`) を実行し、"heap out of memory" エラーが解消されたことを確認しました。
- コードにエラーはなく、期待通りに動作しています。

## 開発者向け指示 (Instructions for AI Agent)
- **優先度 (Priority):** High
- **目標 (Goal):** `useAchievements.ts` 内のメモリリークを特定し修正する。修正後、関連テストが成功し、メモリ使用量が安定することを確認する。
- **具体的なタスク (Specific Tasks):**
    1. **コードレビュー:** `useAchievements.ts` のコードを詳細にレビューし、メモリリークの一般的な原因（未クリーンアップのイベントリスナー、クリアされていないタイマー/インターバル、コンポーネントのアンマウント後も残る外部への参照、大きなデータセットの不適切な保持、`useEffect` の依存配列の誤りによる無限ループや過剰な再実行など）を特定する。
    2. **`useEffect` の検証:** `useEffect` フックの依存配列とクリーンアップ関数を特に慎重に確認する。クリーンアップ関数が、フック内でセットアップされたすべての購読やタイマー、イベントリスナーを正しく解除していることを保証する。
    3. **状態更新ロジックの確認:** 状態更新ロジックが意図しない再レンダリングや計算の連鎖を引き起こしていないか確認する。
    4. **修正適用:** 特定されたリーク箇所を修正する。
    5. **テスト実行:** `npm run test:run` を実行し、`useAchievements.test.ts` を含む全てのテストが成功すること、特に "heap out of memory" エラーが解消されたことを確認する。
    6. **(推奨) メモリプロファイリング:** ブラウザのメモリプロファイリングツールを使用し、修正前後のメモリ使用量を比較して、リークが実際に解消されたことを視覚的に確認する。
- **考慮事項 (Considerations):**
    - `useEffect` のクリーンアップ関数は、コンポーネントがアンマウントされる際、または依存関係が変更されてエフェクトが再実行される直前に呼び出されることを理解する。
    - 依存配列 (`useEffect` の第二引数) が正しく設定されていることを確認し、エフェクトの不要な再実行を防ぐ。
    - 大量のデータを扱う場合、必要なデータのみを状態に保持し、不要になったデータは適切に解放する。
    - 外部ライブラリやグローバルオブジェクトへの参照が残らないように注意する。
- **テスト要件 (Testing Requirements):**
    - `useAchievements.test.ts` の既存テストがすべてパスすること。
    - メモリリークが修正されたことを確認するため、長時間実行テストや多数回実行テストをローカルで試すことが望ましい（CI環境では難しい場合があるため）。
- **完了条件 (Acceptance Criteria):**
    - `useAchievements.ts` のメモリリークが解消される。
    - `npm run test:run` 実行時に `useAchievements.test.ts` に関連する "heap out of memory" エラーが発生しない。
    - 関連する実績機能が期待通りに動作し、アプリケーション全体の安定性が損なわれない。
    - コード変更は、既存のESLintルールおよびプロジェクトのコーディング規約に準拠する。

## 参照情報 (References)
- React公式ドキュメント: `useEffect` のクリーンアップについて
- MDN: メモリ管理、よくあるメモリリークのパターン
