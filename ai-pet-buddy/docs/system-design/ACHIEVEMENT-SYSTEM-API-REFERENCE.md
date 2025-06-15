# 実績・統計システム API リファレンス

このドキュメントでは、AI Pet Buddy実績・統計システムのAPI仕様を詳細に説明します。

## 📋 目次

1. [型定義API](#型定義api)
2. [Achievement Engine API](#achievement-engine-api)
3. [useAchievements Hook API](#useachievements-hook-api)
4. [BadgeDisplay Component API](#badgedisplay-component-api)
5. [統計データ構造](#統計データ構造)
6. [エラーハンドリング](#エラーハンドリング)
7. [設定オプション](#設定オプション)

---

## 型定義API

### Achievement Types

#### Badge Interface

```typescript
interface Badge {
  /** 一意のバッジID */
  id: string;
  
  /** バッジ表示名 */
  name: string;
  
  /** バッジの説明文 */
  description: string;
  
  /** バッジアイコン（絵文字またはURL） */
  icon: string;
  
  /** 実績カテゴリ */
  category: AchievementCategory;
  
  /** レアリティレベル */
  rarity: AchievementRarity;
  
  /** 解除条件 */
  requirements: AchievementRequirement;
  
  /** 解除済みフラグ */
  unlocked: boolean;
  
  /** 解除日時（Unixタイムスタンプ） */
  unlockedAt?: number;
  
  /** 進捗率（0.0-1.0） */
  progress: number;
}
```

#### Title Interface

```typescript
interface Title {
  /** 一意の称号ID */
  id: string;
  
  /** 称号表示名 */
  name: string;
  
  /** 称号の説明文 */
  description: string;
  
  /** 称号アイコン */
  icon: string;
  
  /** 実績カテゴリ */
  category: AchievementCategory;
  
  /** レアリティレベル */
  rarity: AchievementRarity;
  
  /** 解除条件 */
  requirements: AchievementRequirement;
  
  /** 解除済みフラグ */
  unlocked: boolean;
  
  /** 解除日時 */
  unlockedAt?: number;
  
  /** アクティブ状態（表示中） */
  active: boolean;
}
```

#### Achievement Requirement

```typescript
interface AchievementRequirement {
  /** 要求条件の種類 */
  type: 
    | 'evolution_count'    // 進化回数
    | 'game_win_streak'    // 連続勝利数
    | 'consecutive_days'   // 連続プレイ日数
    | 'level_reached'      // 到達レベル
    | 'stat_max'          // ステータス最大化
    | 'total_games'       // 総ゲーム数
    | 'total_playtime';   // 総プレイ時間
  
  /** 必要な値 */
  value: number;
  
  /** 条件の説明文 */
  description: string;
}
```

#### Achievement Categories & Rarity

```typescript
type AchievementCategory = 
  | 'evolution'  // 進化関連
  | 'game'      // ゲーム関連
  | 'care'      // ケア関連
  | 'time'      // 時間関連
  | 'level';    // レベル関連

type AchievementRarity = 
  | 'common'    // 一般（緑）
  | 'rare'      // レア（青）
  | 'epic'      // エピック（紫）
  | 'legendary'; // レジェンダリー（金）
```

### Statistics Types

#### Game Statistics

```typescript
interface GameStatistics {
  /** 総ゲーム数 */
  totalGames: number;
  
  /** 勝利数 */
  wins: number;
  
  /** 敗北数 */
  losses: number;
  
  /** 引き分け数 */
  draws: number;
  
  /** 勝率（0.0-1.0） */
  winRate: number;
  
  /** 現在の連勝数 */
  winStreak: number;
  
  /** 最大連勝記録 */
  maxWinStreak: number;
  
  /** 平均ゲーム時間（秒） */
  averageGameDuration: number;
  
  /** ゲーム履歴 */
  gameHistory: GameRecord[];
  
  /** ゲーム種別統計 */
  gameTypeStats: GameTypeStatistics;
}

interface GameRecord {
  /** ゲーム種別 */
  type: string;
  
  /** 結果 */
  result: 'win' | 'lose' | 'draw';
  
  /** プレイ日時 */
  timestamp: number;
  
  /** プレイ時間（秒） */
  duration: number;
  
  /** 難易度（オプション） */
  difficulty?: string;
  
  /** スコア（オプション） */
  score?: number;
}
```

#### Care Statistics

```typescript
interface CareStatistics {
  /** 総ケア行動数 */
  totalActions: number;
  
  /** 給餌回数 */
  feedingActions: number;
  
  /** 遊び回数 */
  playingActions: number;
  
  /** 休息回数 */
  restingActions: number;
  
  /** 現在の連続日数 */
  consecutiveDays: number;
  
  /** 最大連続記録 */
  maxConsecutiveDays: number;
  
  /** ケア履歴 */
  careHistory: CareRecord[];
  
  /** 日別統計 */
  dailyCareStats: DailyCareStatistics;
}
```

---

## Achievement Engine API

### Core Functions

#### initializeAchievementState

```typescript
function initializeAchievementState(pet: Pet): AchievementState
```

**説明**: 新規ユーザー向けの実績状態を初期化

**パラメータ**:
- `pet: Pet` - 現在のペット情報

**戻り値**: 初期化された `AchievementState`

**使用例**:
```typescript
const initialState = initializeAchievementState(userPet);
```

#### updateGameProgress

```typescript
function updateGameProgress(
  gameData: GameData, 
  currentState: AchievementState
): AchievementState
```

**説明**: ゲーム結果に基づいて実績進捗を更新

**パラメータ**:
- `gameData: GameData` - ゲーム結果データ
- `currentState: AchievementState` - 現在の実績状態

**戻り値**: 更新された `AchievementState`

**GameData Interface**:
```typescript
interface GameData {
  type: string;                    // ゲーム種別
  result: 'win' | 'lose' | 'draw'; // 結果
  timestamp: number;               // プレイ日時
  duration: number;                // プレイ時間（秒）
}
```

#### checkAchievements

```typescript
function checkAchievements(
  state: AchievementState, 
  progress: AchievementProgress
): AchievementNotification[]
```

**説明**: 現在の進捗に基づいて新しい実績解除をチェック

**パラメータ**:
- `state: AchievementState` - 現在の実績状態
- `progress: AchievementProgress` - 最新の進捗データ

**戻り値**: 新しい実績通知の配列

### Utility Functions

#### getAchievementSummary

```typescript
function getAchievementSummary(state: AchievementState): AchievementSummary
```

**説明**: 実績の概要統計を生成

**戻り値**:
```typescript
interface AchievementSummary {
  totalBadges: number;        // 総バッジ数
  unlockedBadges: number;     // 解除済みバッジ数
  totalTitles: number;        // 総称号数
  unlockedTitles: number;     // 解除済み称号数
  overallProgress: number;    // 全体進捗率
  totalGames: number;         // 総ゲーム数
  winRate: number;           // 勝率
  playtime: number;          // 総プレイ時間
  currentStreak: number;     // 現在の連勝
  maxStreak: number;         // 最大連勝記録
}
```

#### getNextAchievements

```typescript
function getNextAchievements(state: AchievementState): Badge[]
```

**説明**: 次に取得可能な実績を取得（進捗率の高い順）

**戻り値**: 未解除バッジの配列（進捗順）

---

## useAchievements Hook API

### Hook Signature

```typescript
function useAchievements(
  pet: Pet, 
  options?: UseAchievementsOptions
): UseAchievementsReturn
```

### Options Interface

```typescript
interface UseAchievementsOptions {
  /** 自動保存を有効にするか（デフォルト: true） */
  autoSave?: boolean;
  
  /** 自動保存間隔（ミリ秒、デフォルト: 30000） */
  saveInterval?: number;
  
  /** 最大同時通知数（デフォルト: 5） */
  maxNotifications?: number;
  
  /** セッション追跡を有効にするか（デフォルト: true） */
  enableSessionTracking?: boolean;
  
  /** デバッグモード（デフォルト: false） */
  debug?: boolean;
}
```

### Return Interface

```typescript
interface UseAchievementsReturn {
  // State
  /** 現在の実績状態 */
  achievementState: AchievementState;
  
  /** アクティブな通知一覧 */
  notifications: AchievementNotification[];
  
  /** 読み込み中フラグ */
  isLoading: boolean;
  
  /** エラー情報 */
  error: string | null;
  
  // Actions
  /** ゲーム結果を記録 */
  recordGameResult: (gameData: GameData) => void;
  
  /** 進化を記録 */
  recordEvolution: (evolutionData: EvolutionData) => void;
  
  /** ケア行動を記録 */
  recordCareAction: (careData: CareActionData) => void;
  
  /** レベル変更を記録 */
  recordLevelChange: (levelData: LevelData) => void;
  
  /** 称号をアクティブ化 */
  activateTitle: (titleId: string) => void;
  
  /** 通知を削除 */
  dismissNotification: (notificationId: string) => void;
  
  /** 全通知をクリア */
  clearAllNotifications: () => void;
  
  // Queries
  /** 実績概要を取得 */
  getSummary: () => AchievementSummary;
  
  /** 次の実績を取得 */
  getNextAchievements: () => Badge[];
  
  /** 特定カテゴリの実績を取得 */
  getAchievementsByCategory: (category: AchievementCategory) => Badge[];
  
  /** 解除済み実績を取得 */
  getUnlockedAchievements: () => Badge[];
  
  // Utilities
  /** 実績データをエクスポート */
  exportData: () => string;
  
  /** 実績データをインポート */
  importData: (data: string) => boolean;
  
  /** キャッシュをクリア */
  clearCache: () => void;
}
```

### Usage Examples

#### 基本的な使用例

```typescript
function AchievementScreen({ pet }: { pet: Pet }) {
  const {
    achievementState,
    notifications,
    recordGameResult,
    getSummary
  } = useAchievements(pet);

  const handleGameWin = () => {
    recordGameResult({
      type: 'rock-paper-scissors',
      result: 'win',
      timestamp: Date.now(),
      duration: 30
    });
  };

  const summary = getSummary();

  return (
    <div>
      <h1>実績: {summary.unlockedBadges}/{summary.totalBadges}</h1>
      {/* バッジ表示 */}
    </div>
  );
}
```

#### カスタムオプション付き使用例

```typescript
function App() {
  const achievementOptions: UseAchievementsOptions = {
    autoSave: true,
    saveInterval: 60000,    // 1分間隔で保存
    maxNotifications: 3,    // 最大3つの通知
    enableSessionTracking: true,
    debug: process.env.NODE_ENV === 'development'
  };

  const achievement = useAchievements(pet, achievementOptions);

  return (
    <AchievementProvider value={achievement}>
      <MainApp />
    </AchievementProvider>
  );
}
```

---

## BadgeDisplay Component API

### Props Interface

```typescript
interface BadgeDisplayProps {
  /** 表示するバッジ */
  badge: Badge;
  
  /** サイズバリエーション */
  size?: 'small' | 'medium' | 'large';
  
  /** 進捗バーを表示するか */
  showProgress?: boolean;
  
  /** 説明文を表示するか */
  showDescription?: boolean;
  
  /** クリック時のコールバック */
  onClick?: (badge: Badge) => void;
  
  /** 追加のCSSクラス */
  className?: string;
  
  /** アニメーション効果を有効にするか */
  enableAnimations?: boolean;
  
  /** ツールチップを表示するか */
  showTooltip?: boolean;
}
```

### Usage Examples

#### 基本的な表示

```typescript
<BadgeDisplay 
  badge={badge}
  size="medium"
  showProgress={true}
  onClick={(badge) => console.log('Badge clicked:', badge.name)}
/>
```

#### カスタムスタイル付き

```typescript
<BadgeDisplay 
  badge={badge}
  size="large"
  className="custom-badge"
  enableAnimations={true}
  showTooltip={true}
  showDescription={false}
/>
```

#### 小さいサイズでの一覧表示

```typescript
{badges.map(badge => (
  <BadgeDisplay 
    key={badge.id}
    badge={badge}
    size="small"
    showProgress={false}
    showDescription={false}
  />
))}
```

---

## 統計データ構造

### Session Statistics

```typescript
interface SessionStatistics {
  /** セッション総数 */
  totalSessions: number;
  
  /** 総プレイ時間（ミリ秒） */
  totalPlaytime: number;
  
  /** 平均セッション時間 */
  averageSessionDuration: number;
  
  /** 最長セッション時間 */
  longestSession: number;
  
  /** 今日のプレイ時間 */
  todayPlaytime: number;
  
  /** 連続プレイ日数 */
  consecutiveDays: number;
  
  /** セッション履歴 */
  sessionHistory: SessionRecord[];
}

interface SessionRecord {
  /** セッションID */
  id: string;
  
  /** 開始時刻 */
  startTime: number;
  
  /** 終了時刻 */
  endTime: number;
  
  /** セッション中のアクション数 */
  actionCount: number;
  
  /** セッション種別 */
  type: 'active' | 'idle' | 'background';
}
```

### Evolution Statistics

```typescript
interface EvolutionStatistics {
  /** 総進化回数 */
  totalEvolutions: number;
  
  /** 現在の進化段階 */
  currentStage: number;
  
  /** 最高到達レベル */
  maxLevel: number;
  
  /** 進化履歴 */
  evolutionHistory: EvolutionRecord[];
  
  /** 平均レベルアップ時間 */
  averageLevelUpTime: number;
}

interface EvolutionRecord {
  /** 進化前レベル */
  fromLevel: number;
  
  /** 進化後レベル */
  toLevel: number;
  
  /** 進化前段階 */
  fromStage: number;
  
  /** 進化後段階 */
  toStage: number;
  
  /** 進化日時 */
  timestamp: number;
  
  /** 進化に要した時間 */
  timeToEvolve?: number;
}
```

---

## エラーハンドリング

### Error Types

```typescript
enum AchievementErrorType {
  STORAGE_ERROR = 'STORAGE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  MIGRATION_ERROR = 'MIGRATION_ERROR'
}

interface AchievementError {
  type: AchievementErrorType;
  message: string;
  timestamp: number;
  context?: Record<string, any>;
}
```

### Error Handling Examples

```typescript
const {
  achievementState,
  error,
  recordGameResult
} = useAchievements(pet);

// エラー状態の処理
if (error) {
  return <ErrorMessage error={error} />;
}

// 安全な操作実行
try {
  recordGameResult(gameData);
} catch (err) {
  console.error('Achievement recording failed:', err);
  // フォールバック処理
}
```

---

## 設定オプション

### Predefined Data

#### Default Badges

```typescript
export const PREDEFINED_BADGES: Badge[] = [
  {
    id: 'first-evolution',
    name: '初めての進化',
    description: 'ペットを初めて進化させた',
    icon: '🌟',
    category: 'evolution',
    rarity: 'common',
    requirements: {
      type: 'evolution_count',
      value: 1,
      description: '1回進化する'
    },
    unlocked: false,
    progress: 0
  },
  // ... その他のバッジ定義
];
```

#### Default Titles

```typescript
export const PREDEFINED_TITLES: Title[] = [
  {
    id: 'beginner-trainer',
    name: '見習いトレーナー',
    description: '冒険を始めたばかりの新人トレーナー',
    icon: '🌱',
    category: 'level',
    rarity: 'common',
    requirements: {
      type: 'level_reached',
      value: 1,
      description: 'レベル1に到達する'
    },
    unlocked: true,  // 初期解除済み
    active: true,    // 初期アクティブ
    unlockedAt: Date.now()
  },
  // ... その他の称号定義
];
```

### Configuration Constants

```typescript
// Storage keys
export const STORAGE_KEYS = {
  ACHIEVEMENTS: 'ai-pet-buddy-achievements',
  STATISTICS: 'ai-pet-buddy-statistics',
  SETTINGS: 'ai-pet-buddy-achievement-settings'
} as const;

// Default settings
export const DEFAULT_SETTINGS = {
  AUTO_SAVE_INTERVAL: 30000,      // 30秒
  MAX_NOTIFICATIONS: 5,           // 最大通知数
  ANIMATION_DURATION: 1000,       // アニメーション時間
  SESSION_TIMEOUT: 300000,        // セッションタイムアウト（5分）
  MAX_HISTORY_ENTRIES: 1000       // 履歴最大保存数
} as const;

// Badge rarity colors
export const RARITY_COLORS = {
  common: '#10b981',     // green
  rare: '#3b82f6',       // blue
  epic: '#8b5cf6',       // purple
  legendary: '#f59e0b'   // gold
} as const;
```

---

*このAPI リファレンスは AI Pet Buddy Phase 4 実装に基づいています。*
*最新の仕様については、TypeScript型定義ファイルを参照してください。*