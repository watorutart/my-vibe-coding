### macOS音声通知システム
以下の場面で音声通知を実行する：

#### Agent動作ルール
- **ユーザー操作待ち状態**になった際は `afplay /System/Library/Sounds/Basso.aiff` を実行
- **作業完了**した際は `afplay /System/Library/Sounds/Basso.aiff` を実行

### Vitestテスト実行最適化（再発防止策）
テスト無限待機状態の防止設定：

#### package.json設定
```json
{
  "scripts": {
    "test": "vitest run",           // デフォルト: ワンショット実行
    "test:watch": "vitest",         // 明示的: watch mode
    "test:ci": "vitest run --reporter=verbose"  // CI用詳細出力
  }
}
```

#### vitest.config.ts設定
```typescript
export default defineConfig({
  test: {
    watch: false,  // デフォルトでwatch mode無効化
    // ...その他設定
  }
})
```

### TypeScript開発効率化ルール

#### 型定義拡張パターン
- 新機能追加時は型定義ファイルを先に更新
- Union型への項目追加は段階的実装を推奨
- 型テストファイルで動作確認後に本実装

#### TDD実装フロー
1. 型定義更新 → 型テスト作成
2. メイン機能実装 → 機能テスト作成
3. UI実装 → UIテスト作成
4. 統合テスト → 動作確認

### Git運用ルール

#### コミットメッセージ形式
```
feat: 機能概要

✨ 新機能
- 具体的な実装内容

🔧 バグ修正  
- 解決した問題

📋 その他変更
- 設定・ドキュメント等

Phase情報・目標達成状況 🚀
```

#### プッシュ前チェック
- `npm run test` - 全テスト成功確認
- `npm run lint` - 静的解析エラー解消
- 音声通知で作業完了を確認

### AI Pet Buddy開発ルール

#### Phase開発原則
- TDD原則に基づく段階的実装
- テストファースト → 実装 → 統合の順序
- 各Phase完了時に包括的な動作確認

#### 会話システム開発パターン
- シンプルな条件分岐方式を採用
- 事前定義パターン + ランダム選択でバリエーション確保
- ペット状態（幸福度・エネルギー・レベル）連動の応答生成

#### ファイル構成ルール
```
src/
├── types/           # 型定義 + 型テスト
├── utils/           # ビジネスロジック + 単体テスト  
├── components/      # UIコンポーネント + UIテスト
├── hooks/           # カスタムフック + フックテスト
└── test/            # テスト共通設定
```

#### コンポーネント実装順序
1. 型定義ファイル作成・更新
2. ビジネスロジック実装（utils/）
3. UIコンポーネント実装（components/）
4. メインアプリ統合（App.tsx）

### 品質保証チェックリスト

#### リリース前確認項目
- [ ] 全テスト成功（99テスト以上）
- [ ] TypeScript型エラーゼロ
- [ ] ESLint警告ゼロ
- [ ] 音声通知システム動作確認
- [ ] Phase目標達成確認
