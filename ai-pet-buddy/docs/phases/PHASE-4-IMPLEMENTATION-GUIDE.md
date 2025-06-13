# 🤖 GitHub Copilot Coding Agent 実装指示書

## 📋 Phase 4 実装の委託について

### 🎯 目的
AI Pet BuddyのPhase 4機能実装をGitHub Copilot Coding Agentに委託し、効率的な開発を実現する。

### 📚 必須確認事項
以下のドキュメントを必ず確認してから実装を開始してください：

1. **[PHASE-4-ISSUES.md](./PHASE-4-ISSUES.md)** - 詳細なタスク仕様
2. **[REQUIREMENTS.md](../REQUIREMENTS.md)** - 要件定義書
3. **[PHASE-3-完了レポート.md](./PHASE-3-完了レポート.md)** - 現在の実装状況
4. **[TESTING-STRATEGY.md](./TESTING-STRATEGY.md)** - テスト戦略

---

## 🚀 実装開始指示

### 📋 Issue #1: カスタマイズシステム実装
**最優先で実装してください**

#### 🎯 実装手順
1. **型定義の作成**
   ```bash
   # 以下のファイルを作成
   src/types/Customization.ts
   src/types/Customization.test.ts
   ```

2. **カスタマイズ用Hook実装**
   ```bash
   src/hooks/useCustomization.ts
   src/hooks/useCustomization.test.ts
   ```

3. **UIコンポーネント実装**
   ```bash
   src/components/CustomizationPanel.tsx
   src/components/CustomizationPanel.test.tsx
   src/components/CustomizationPanel.css
   ```

4. **ユーティリティ関数**
   ```bash
   src/utils/customizationUtils.ts
   src/utils/customizationUtils.test.ts
   ```

#### 🔧 技術仕様

**Customization.ts の型定義例:**
```typescript
export interface PetCustomization {
  name: string;
  color: string;
  accessories: Accessory[];
  unlocked: boolean;
}

export interface Accessory {
  id: string;
  type: 'hat' | 'ribbon' | 'glasses';
  name: string;
  color?: string;
  unlocked: boolean;
}

export interface CustomizationState {
  current: PetCustomization;
  available: Accessory[];
  presets: PetCustomization[];
}
```

**useCustomization Hook の要件:**
- 名前変更機能
- 色変更機能
- アクセサリー管理
- プレビュー機能
- 設定の永続化（localStorage）

**CustomizationPanel の要件:**
- タブ形式のUI（名前/色/アクセサリー）
- リアルタイムプレビュー
- 保存・キャンセル機能
- レスポンシブデザイン

---

### 📋 Issue #2: シェア機能実装
**カスタマイズ完了後に実装**

#### 🎯 実装手順
1. **型定義とテスト**
2. **スクリーンショット機能**
3. **SNSシェアボタン**
4. **統合テスト**

#### 🔧 技術仕様
- html2canvas または Canvas API使用
- Twitter/Instagram/Facebook/LINE対応
- 高画質画像生成（PNG、1080x1080推奨）
- ウォーターマーク追加

---

### 📋 Issue #6: デプロイ対応
**全機能実装後に実施**

#### 🎯 実装手順
1. **Vercel設定ファイル作成**
2. **環境変数の設定**
3. **パフォーマンス最適化**
4. **SEOメタタグ追加**

---

## 🧪 品質基準

### ✅ 必須要件
- **テストカバレッジ**: 90%以上
- **TypeScript**: strict mode対応
- **ESLint**: エラー・警告ゼロ
- **全テスト成功**: 100%パス

### 📏 開発ルール
1. **TDD原則**: テストを先に書く
2. **日本語コメント**: 新規コード100%
3. **型安全性**: TypeScript厳格適用
4. **レスポンシブ**: モバイルファースト

### 🎨 デザイン統一
- 既存のCSS変数を使用
- 可愛い系デザイン維持
- 明るい配色パレット
- 60fps アニメーション

---

## 🔍 検証・テスト手順

### 1. 単体テスト実行
```bash
npm run test
```

### 2. カバレッジ確認
```bash
npm run test:coverage
```

### 3. 型チェック
```bash
npm run type-check
```

### 4. Lint実行
```bash
npm run lint
```

### 5. ビルド確認
```bash
npm run build
```

---

## 📁 既存アーキテクチャとの統合

### 🔄 既存Hookとの連携
- `usePetProgress`: レベル・経験値管理
- `useDataPersistence`: データ保存・読み込み
- `useEvolution`: 進化システム
- `useGame`: ゲーム機能

### 🎮 既存コンポーネントとの統合
- `App.tsx`: メインアプリへの統合
- `PetDisplay.tsx`: カスタマイズ反映
- `ActionButtons.tsx`: 新機能ボタン追加

### 💾 データ永続化
既存の`dataStorage.ts`を拡張してカスタマイズ設定を保存

---

## 🚨 注意事項

### ⚠️ 破壊的変更の禁止
- 既存の型定義変更時は下位互換性を維持
- 既存のテストが失敗しないよう注意
- データマイグレーション機能の実装

### 🔧 既存コードの尊重
- 既存のコーディングスタイルに合わせる
- 命名規則の統一
- フォルダ構造の統一

### 📱 パフォーマンス配慮
- 画像ファイルサイズの最適化
- 不要な再レンダリングの防止
- メモリリークの防止

---

## 🎯 成功の定義

### ✅ Phase 4完了条件
1. 全Issue実装完了
2. 全テスト成功（255+新規テスト）
3. カバレッジ90%以上維持
4. Vercelデプロイ成功
5. 要件定義書の全機能実装

### 🏆 品質目標
- Lighthouse Score: 90+
- ページ読み込み時間: 3秒以内
- モバイル対応: 完全対応
- アクセシビリティ: WCAG 2.1 AA

---

## 📞 サポート・質問

### 🤝 レビュープロセス
1. 各Issue完了時にプルリクエスト
2. コードレビュー実施
3. 品質チェック通過後マージ
4. 次のIssueへ進行

### 📋 報告事項
- 実装完了時の報告
- 問題発生時の即座報告
- 設計変更提案時の事前相談

---

**🚀 実装開始を承認します。PHASE-4-ISSUES.mdの順序で実装を開始してください！**
