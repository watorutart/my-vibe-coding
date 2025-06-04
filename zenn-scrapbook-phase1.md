# 🎯 GitHub Copilotと一緒にAIペット育成アプリを1から作ってみた【Phase1完走記】

## 🚀 はじめに

「AI技術を使ったペット育成アプリを作ってみたい！」

そんな思いから始まったこのプロジェクト。GitHub Copilotを相棒に、**テスト駆動開発（TDD）**と**日本語開発継続**という2つの軸を設定して、本格的なReact + TypeScriptアプリケーションを構築してみました。

結果として、**テストカバレッジ85.49%**、**47個のテスト全成功**という高品質な基盤を完成させることができました🎉

この記事では、プロジェクト開始からPhase1完了までの開発の軌跡をリアルに記録していきます。

## 🎮 作ったもの：AI Pet Buddy

### 📱 アプリ概要
- **技術スタック**: React + TypeScript + Vite
- **テスト**: Vitest + React Testing Library
- **特徴**: インタラクティブなAIペット育成システム

### ✨ 実装した機能（Phase1完了時点）
- 🐉 **PetDisplay コンポーネント**: ドラゴンペットの表示とレベル別色変化
- 📊 **StatsPanel コンポーネント**: 幸福度・空腹度・エネルギー・レベルの表示
- 🎮 **ActionButtons コンポーネント**: 餌やり・遊び・休憩の基本アクション
- 🎨 **レスポンシブデザイン**: モバイル・デスクトップ完全対応
- 📝 **Pet型定義**: TypeScript型安全性とデフォルト設定

## 🏗️ 開発体制の確立

### 🧪 テスト駆動開発（TDD）の徹底

Phase1で最も力を入れたのが**品質の担保**でした。

```bash
# Phase1完了時の数値
✅ テスト総数: 47個 (全成功)
✅ テストカバレッジ: 85.49%
✅ TypeScriptエラー: 0個
```

**TDDの実践ルール**
1. 新機能実装前に必ずテストを先に作成
2. Red → Green → Refactorサイクルを厳格に守る
3. カバレッジ80%以上を絶対に維持
4. 全テストパス後のみコミット許可

### 🌏 日本語開発継続指針

GitHub Copilotとの対話を**日本語で統一**することで、開発効率と品質の両方を追求しました。

**確立したルール**
- GitHub Copilot対話: 日本語統一
- コメント・ドキュメント: 日本語優先
- コミットメッセージ: 日本語での詳細記述
- エラー分析: 日本語での根本原因分析

これにより、**開発スピードを落とすことなく**、将来の保守性も確保できました。

## 📊 達成した品質指標

| 指標 | 目標 | 実績 | 評価 |
|------|------|------|------|
| テスト成功率 | 100% | 100% | ✅ 完璧 |
| カバレッジ | 80%以上 | 85.49% | ✅ 超過達成 |
| TypeScriptエラー | 0個 | 0個 | ✅ 完璧 |
| 実装コンポーネント | 3個 | 3個 | ✅ 完了 |
| テスト総数 | 40個以上 | 47個 | ✅ 超過達成 |

## 🔄 自動化システムの構築

### 📝 自動振り返りシステム

開発効率を劇的に向上させた**自動振り返りシステム**を構築しました。

**システム構成**
- `auto-review.sh`: 3種類の振り返り自動実行
- 品質チェック: カバレッジ・日本語化率・エラー監視
- レポート自動生成: markdown形式の詳細分析
- 改善策テンプレート: 問題分析から解決まで

**振り返り種別**
1. **phase完了時**: 包括的評価と次期改善策
2. **daily**: 日常的な品質確認  
3. **problem**: 問題発生時の緊急分析

### 🛡️ 品質ゲートの設置

```bash
# 毎日の開発で実行するコマンド
npm run test:coverage  # カバレッジチェック
npm run test:run       # 全テスト実行
npm run build          # ビルド確認
./auto-review.sh phase # 振り返り実行
```

## 💡 技術的なハイライト

### 🏗️ コンポーネント設計の工夫

**PetDisplay Component**
```typescript
interface PetDisplayProps {
  pet: Pet;
}

// レベル別の色変化を実装
const getPetBodyColor = (level: number) => {
  if (level >= 5) return '#FFD700'; // 金色
  if (level >= 3) return '#87CEEB'; // 青色
  return '#90EE90'; // 緑色
};

// 表情システムでインタラクションを豊かに
const getExpressionEmoji = (expression: Pet['expression']) => {
  switch (expression) {
    case 'happy': return '😊';
    case 'excited': return '🤩';
    case 'sad': return '😢';
    case 'tired': return '😴';
    default: return '😐';
  }
};
```

**StatsPanel Component**
```typescript
// プログレスバーで視覚的に分かりやすく
const getStatColor = (value: number) => {
  if (value >= 70) return '#4CAF50'; // 緑
  if (value >= 30) return '#FF9800'; // オレンジ
  return '#F44336'; // 赤
};
```

**ActionButtons Component**
```typescript
// アクセシビリティを重視した設計
const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onFeed, onPlay, onRest, disabled 
}) => {
  return (
    <div className="action-buttons">
      <button 
        onClick={onFeed} 
        disabled={disabled}
        aria-label="ペットに餌をあげる"
      >
        🍎 餌をあげる
      </button>
      {/* 他のボタンも同様に実装 */}
    </div>
  );
};
```

### 🧪 テスト戦略の実践例

**コンポーネントテスト**
```typescript
describe('PetDisplay', () => {
  it('レベルに応じて色が変化する', () => {
    const lowLevelPet = { ...DEFAULT_PET, level: 1 };
    const { rerender } = render(<PetDisplay pet={lowLevelPet} />);
    
    // レベル1では緑色
    expect(screen.getByTestId('pet-body')).toHaveStyle({
      backgroundColor: '#90EE90'
    });
    
    // レベル5では金色に変化
    const highLevelPet = { ...DEFAULT_PET, level: 5 };
    rerender(<PetDisplay pet={highLevelPet} />);
    expect(screen.getByTestId('pet-body')).toHaveStyle({
      backgroundColor: '#FFD700'
    });
  });
  
  it('表情が正しく表示される', () => {
    const happyPet = { ...DEFAULT_PET, expression: 'happy' };
    render(<PetDisplay pet={happyPet} />);
    expect(screen.getByText('😊')).toBeInTheDocument();
  });
});
```

**統合テスト**
```typescript
describe('App Integration', () => {
  it('アクションボタンクリックでステータスが変化する', async () => {
    render(<App />);
    
    // 初期状態の確認
    expect(screen.getByText(/幸福度: 50/)).toBeInTheDocument();
    
    // 餌やりボタンをクリック
    const feedButton = screen.getByRole('button', { name: /餌をあげる/ });
    await userEvent.click(feedButton);
    
    // ステータスの変化を確認
    await waitFor(() => {
      expect(screen.getByText(/幸福度: 6[0-9]/)).toBeInTheDocument();
    });
  });
});
```

## 🎯 Phase1開発の舞台裏

### 📅 開発タイムライン

**Week 1: プロジェクト初期設定**
- React + TypeScript + Vite環境構築
- テスト環境の設定（Vitest + React Testing Library）
- 基本的なプロジェクト構造の決定

**Week 2: コアコンポーネント開発**
- PetDisplayコンポーネントの実装とテスト
- TDD実践の習得期間
- TypeScript型定義の確立

**Week 3: ユーザーインタラクション**
- ActionButtonsコンポーネント実装
- ステータス変化ロジックの構築
- 統合テストの充実

**Week 4: 品質向上と自動化**
- StatsPanel コンポーネント完成
- 自動振り返りシステム構築
- カバレッジ85.49%達成
- 日本語開発継続指針の確立

### 🔥 開発中の印象的なエピソード

**エピソード1: TDDの威力を実感**
```bash
# 最初は「テストって面倒...」と思っていたが
$ npm run test:watch

# 実装中にリアルタイムでテストが走り
# バグを即座に発見できる快感を知る
✅ PetDisplay › renders correctly
✅ ActionButtons › handles click events
❌ StatsPanel › shows correct values  # ←ここでバグ発見！
```

**エピソード2: 日本語開発の効果**
```typescript
// Before: 英語で書いていた時代
const handleFeedButtonClick = () => {
  // increment happiness by 10
  setPet(prev => ({ ...prev, happiness: prev.happiness + 10 }));
};

// After: 日本語で統一した結果
const handleFeedButtonClick = () => {
  // ペットの幸福度を10増加させる
  // 最大値100を超えないようにクリップ
  setPet(prev => ({ 
    ...prev, 
    happiness: Math.min(prev.happiness + 10, 100) 
  }));
};
```

GitHub Copilotとの対話も日本語にした結果、より細かいニュアンスまで理解してくれるようになり、開発スピードが劇的に向上しました。

## 🎯 Phase1で学んだこと

### ✅ 成功要因

1. **TDDの徹底**: テストファーストにより、設計品質が格段に向上
2. **日本語開発継続**: GitHub Copilotとの効率的な対話が実現
3. **自動化の威力**: 振り返りとチェックの自動化で開発効率UP
4. **品質指標の明確化**: 数値目標設定により達成感と継続性を確保

### 📈 改善ポイント

1. **日本語コメント率**: 現在85% → 目標90%
2. **エントリーポイント**: App.tsxのテスト課題が残存
3. **デザインシステム**: 統一的なデザインガイドラインの確立

## 🚀 Phase2への展望（Phase1完了時点での計画）

Phase1で確立した開発体制を基盤に、以下の機能実装を予定していました：

### 🎮 主要機能実装計画
- 🔄 **自動ステータス減衰システム**: リアルな時間経過の実装
- ⬆️ **レベルアップ・進化機能**: 成長要素の追加
- 💬 **AI会話パターン実装**: より豊かなインタラクション
- 💾 **データ永続化機能**: ユーザーの進行状況保存

### 📊 Phase2品質目標
- テストカバレッジ90%以上
- 日本語コメント率90%以上
- 新機能TDD開発100%
- 自動品質チェック100%運用

### 📝 Phase1→Phase2への技術的準備

**新規ディレクトリ構造**
```
src/
├── hooks/              # 新規作成予定
│   ├── useStatDecay.ts
│   ├── useStatDecay.test.ts
│   ├── usePetProgress.ts
│   └── usePetProgress.test.ts
├── utils/              # 新規作成予定
│   ├── conversationEngine.ts
│   ├── conversationEngine.test.ts
│   ├── localStorage.ts
│   └── localStorage.test.ts
└── components/         # 既存 (Phase1完了)
    └── ... (既に実装済み)
```

**Phase2開発ルール（策定済み）**
1. **TDD**: テストを先に書く
2. **日本語**: すべての説明・コメントは日本語
3. **カバレッジ**: 80%以上を維持
4. **コードレビュー**: 実装前にプランを確認

> **実際の結果**: このPhase1完了記事を書いている時点で、Phase2も既に完了しており、テストカバレッジ90.34%、72個のテスト全成功を達成しています！計画通りの成長を遂げることができました🎉

## 🎊 まとめ：Phase1で得られた財産

**Phase1総合評価: A- (85/100点)**

GitHub Copilotとの協働、TDDの実践、日本語開発継続という挑戦的な取り組みにより、予想以上の成果を得ることができました。

### 🏆 特に価値の高かった学び

**1. TDDは「面倒」ではなく「効率化」だった**
- バグの早期発見により開発速度が向上
- リファクタリングへの心理的安全性が劇的に改善
- 設計品質が自然と向上する

**2. 日本語開発の意外な効果**
- GitHub Copilotとの対話精度が向上
- ドキュメントの可読性と保守性が大幅改善
- チーム開発時のコミュニケーションコストが削減

**3. 自動化の複利効果**
- 振り返りシステムによる継続的改善
- 品質チェックの自動化で心理的負担軽減
- 小さな改善の積み重ねが大きな差に

### 🎯 これからAI開発を始める方へのアドバイス

1. **まずはテスト環境を整備**
   ```bash
   npm install vitest @testing-library/react @testing-library/jest-dom
   ```

2. **GitHub Copilotとは日本語で対話する**
   - より細かい要求を理解してくれます
   - コメントも日本語で統一すると保守性UP

3. **小さく始めて、品質にこだわる**
   - 機能は少なくても、テストカバレッジは高く
   - 最初に品質基準を決めて、それを絶対に守る

4. **自動化できることは早めに自動化**
   - テスト実行、品質チェック、振り返りなど
   - 開発が進むほど自動化の価値が複利で効いてくる

**最終目標は「SNSバイラル確実な愛らしいAIペットアプリの完成」**

この記事を読んでくださった方も、ぜひ自分だけのAIアプリ開発にチャレンジしてみてください！

### 📚 参考になるリソース

- [GitHub Repository](https://github.com/watorutart/my-vibe-coding) - 実際のコードとコミット履歴
- テスト戦略ドキュメント - 実践的なTDD手法
- 日本語開発継続指針 - GitHub Copilot活用法

**Phase2の開発記録も公開予定です！** 🚀

---

*この記事は実際の開発過程をリアルタイムで記録したものです。GitHub Copilotを活用した現代的なWeb開発や、TDD実践の参考になれば幸いです。*

*気になることがあれば、GitHubのIssueやDiscussionでお気軽にご質問ください！*