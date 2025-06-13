# 🎮 Issue #3: 追加ミニゲーム実装

## 📋 Issue情報
- **Priority**: Medium
- **Labels**: `enhancement`, `game`, `Phase4`, `mini-games`
- **Milestone**: Phase 4-B (Week 2)
- **Assignee**: GitHub Copilot Coding Agent
- **Estimated Time**: 2日

---

## 📝 Description
要件定義書にある「じゃんけん」「数当てゲーム」を新たに実装し、ゲームバリエーションを拡大する。既存のMemory/Reflex/Quizゲームに加えて、より多様なゲーム体験を提供し、ユーザーの飽きを防ぐ。

## 🎯 Acceptance Criteria

### ✅ じゃんけんゲーム
- [ ] **基本ゲームプレイ**
  - グー・チョキ・パーの3択UI実装
  - 視覚的に分かりやすいアイコン表示
  - AI対戦相手の実装（ランダム選択）
  - 勝敗判定ロジック（完全実装）

- [ ] **ゲーム進行システム**
  - 連続対戦機能（5回戦制）
  - 連勝記録の保存・表示
  - リアルタイムスコア表示
  - ゲーム終了時の総合結果

- [ ] **アニメーション演出**
  - 選択時のホバーエフェクト
  - 結果発表のアニメーション
  - 勝利・敗北・引き分け演出
  - じゃんけんの「ポン！」タイミング演出

### ✅ 数当てゲーム
- [ ] **基本ゲームプレイ**
  - 1-100の数字当てゲーム
  - 数字入力フィールド（バリデーション付き）
  - 高い・低いのヒント表示
  - 試行回数制限（最大10回）

- [ ] **難易度システム**
  - Easy: 1-50（制限8回）
  - Medium: 1-100（制限10回）
  - Hard: 1-200（制限12回）
  - 難易度別報酬設定

- [ ] **スコア計算システム**
  - 試行回数に基づくスコア算出
  - 最少試行回数記録保存
  - 難易度別統計管理
  - パーフェクトゲーム特別報酬

### ✅ 既存システム統合
- [ ] **報酬システム連携**
  - 既存GameEngineとの完全統合
  - 経験値・幸福度・エネルギー報酬
  - 勝利時のボーナス報酬
  - 連勝ボーナスシステム

- [ ] **統計機能統合**
  - ゲーム履歴への自動記録
  - 勝率・最高記録の統計
  - 総合ランキング表示
  - 月間・週間統計

- [ ] **進化システム連携**
  - ゲーム勝利が進化条件に貢献
  - 特定ゲーム専門の進化パス
  - ゲーム実績による特別進化

## 🛠️ Technical Requirements

### 📦 実装ファイル構成
```
src/
├── types/
│   └── Game.ts (既存ファイル拡張)    # 新ゲーム型追加
├── components/games/
│   ├── RockPaperScissorsGame.tsx     # じゃんけんゲーム
│   ├── RockPaperScissorsGame.test.tsx
│   ├── RockPaperScissorsGame.css
│   ├── NumberGuessingGame.tsx        # 数当てゲーム
│   ├── NumberGuessingGame.test.tsx
│   ├── NumberGuessingGame.css
│   ├── GameSelector.tsx              # ゲーム選択UI
│   └── GameResults.tsx (既存拡張)    # 結果表示拡張
├── utils/
│   ├── gameEngine.ts (既存拡張)      # 新ゲーム対応
│   ├── rockPaperScissorsLogic.ts    # じゃんけんロジック
│   ├── rockPaperScissorsLogic.test.ts
│   ├── numberGuessingLogic.ts       # 数当てロジック
│   └── numberGuessingLogic.test.ts
└── hooks/
    └── useGame.ts (既存拡張)         # 新ゲーム対応
```

### 🔧 型定義拡張
```typescript
// Game.ts への追加型定義
export type GameType = 'memory' | 'reflex' | 'quiz' | 'rock-paper-scissors' | 'number-guessing';

export interface RockPaperScissorsData extends BaseGameData {
  playerChoice: 'rock' | 'paper' | 'scissors' | null;
  aiChoice: 'rock' | 'paper' | 'scissors' | null;
  result: 'win' | 'lose' | 'draw' | null;
  consecutiveWins: number;
  totalRounds: number;
  currentRound: number;
}

export interface NumberGuessingData extends BaseGameData {
  targetNumber: number;
  currentGuess: number | null;
  attemptsLeft: number;
  hints: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  minNumber: number;
  maxNumber: number;
}
```

### 📊 品質基準
- **テストカバレッジ**: 90%以上
- **TypeScript**: 100%型安全
- **日本語コメント**: 100%対応
- **ゲームバランス**: 適切な難易度調整

## 🎮 ゲーム仕様詳細

### ✊ じゃんけんゲーム仕様
```typescript
// ゲームルール
const GAME_RULES = {
  rounds: 5,              // 総ラウンド数
  timeLimit: 30,          // 制限時間（秒）
  winReward: 100,         // 勝利報酬
  drawReward: 25,         // 引き分け報酬
  consecutiveBonus: 50,   // 連勝ボーナス
};

// 勝敗判定ロジック
const determineWinner = (player: Choice, ai: Choice): Result => {
  if (player === ai) return 'draw';
  if (
    (player === 'rock' && ai === 'scissors') ||
    (player === 'paper' && ai === 'rock') ||
    (player === 'scissors' && ai === 'paper')
  ) {
    return 'win';
  }
  return 'lose';
};
```

### 🔢 数当てゲーム仕様
```typescript
// 難易度設定
const DIFFICULTY_SETTINGS = {
  easy: { min: 1, max: 50, maxAttempts: 8, baseReward: 75 },
  medium: { min: 1, max: 100, maxAttempts: 10, baseReward: 100 },
  hard: { min: 1, max: 200, maxAttempts: 12, baseReward: 150 },
};

// スコア計算
const calculateScore = (attempts: number, maxAttempts: number, baseReward: number): number => {
  const efficiency = (maxAttempts - attempts + 1) / maxAttempts;
  return Math.floor(baseReward * efficiency);
};
```

## 🎨 Design Guidelines

### 🎮 じゃんけんUI
- **大きく分かりやすいアイコン**
- **選択時のアニメーション効果**
- **結果発表の演出**
- **和風のデザイン要素**

### 🔢 数当てUI
- **数字入力の使いやすさ**
- **ヒント表示の視認性**
- **進捗バーによる残り回数表示**
- **シンプルで集中できるデザイン**

## 🔄 既存システムとの統合

### 📦 GameEngine拡張
```typescript
// gameEngine.ts への追加
export class GameEngine {
  // 既存メソッド...
  
  startRockPaperScissors(difficulty: GameDifficulty): void {
    // じゃんけんゲーム開始処理
  }
  
  startNumberGuessing(difficulty: GameDifficulty): void {
    // 数当てゲーム開始処理
  }
  
  submitRPSChoice(choice: 'rock' | 'paper' | 'scissors'): void {
    // じゃんけん選択処理
  }
  
  submitNumberGuess(guess: number): void {
    // 数字推測処理
  }
}
```

### 🔗 統合ポイント
- `MiniGamePanel.tsx`にゲーム選択肢追加
- `GameResults.tsx`に新ゲーム結果表示
- `useGame.ts`に新ゲーム状態管理
- 既存報酬システムとの完全統合

## ✅ Definition of Done

### 🧪 テスト要件
- [ ] 全テストが成功（緑）
- [ ] カバレッジ90%以上達成
- [ ] 型エラーゼロ
- [ ] ESLint警告ゼロ

### 🎯 機能確認
- [ ] じゃんけんゲーム正常動作
- [ ] 数当てゲーム正常動作
- [ ] 勝敗判定正確
- [ ] 報酬システム正常動作
- [ ] 統計記録正常動作

### 🎮 ゲームバランス確認
- [ ] 難易度が適切
- [ ] 報酬バランスが適切
- [ ] ゲーム時間が適切
- [ ] UIが使いやすい

## 🚀 実装手順

### Step 1: 型定義拡張
1. `Game.ts`に新ゲーム型追加
2. 既存型との整合性確認
3. テスト作成・実行

### Step 2: ゲームロジック実装
1. `rockPaperScissorsLogic.ts`作成
2. `numberGuessingLogic.ts`作成
3. 勝敗判定・スコア計算実装

### Step 3: UI実装
1. `RockPaperScissorsGame.tsx`作成
2. `NumberGuessingGame.tsx`作成
3. CSS スタイリング

### Step 4: GameEngine拡張
1. `gameEngine.ts`に新ゲーム追加
2. `useGame.ts`拡張
3. 既存システムとの統合

### Step 5: 統合・テスト
1. `MiniGamePanel.tsx`への統合
2. 全ゲーム動作確認
3. バランス調整

## 🎯 ゲームバランス設計

### 🏆 報酬設計
```typescript
const GAME_REWARDS = {
  rockPaperScissors: {
    win: { experience: 75, happiness: 10, energy: -3 },
    draw: { experience: 25, happiness: 3, energy: -1 },
    lose: { experience: 15, happiness: 1, energy: -1 },
    consecutiveBonus: { experience: 50, happiness: 5 }
  },
  numberGuessing: {
    perfect: { experience: 150, happiness: 15, energy: -5 },
    good: { experience: 100, happiness: 10, energy: -3 },
    average: { experience: 75, happiness: 7, energy: -2 },
    poor: { experience: 50, happiness: 5, energy: -1 }
  }
};
```

## 📚 参考資料
- [既存Game.ts](./src/types/Game.ts) - 現在のゲーム型定義
- [既存gameEngine.ts](./src/utils/gameEngine.ts) - ゲームエンジン
- [PHASE-3-完了レポート.md](./PHASE-3-完了レポート.md) - 既存ゲーム実装

## 🎊 実装完了後のアクション
1. プルリクエスト作成
2. ゲームバランステスト
3. ユーザビリティ確認
4. 既存ゲームとの比較検証

---

**🎮 新しいミニゲームの実装準備完了！GitHub Copilot Coding Agentによる実装をお願いします！**
