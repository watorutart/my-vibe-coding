# ミニゲーム シーケンス図詳細版

## 🎯 概要
このドキュメントは、AI Pet Buddy アプリのミニゲーム機能における詳細な処理フローをシーケンス図で示しています。

## 📋 システム全体フロー

### 1. アプリケーション初期化とゲーム準備

```mermaid
sequenceDiagram
    participant App as App.tsx
    participant Pet as usePet Hook
    participant Engine as GameEngine
    participant Panel as MiniGamePanel

    App->>Pet: アプリ起動
    Pet->>Pet: ペット状態読み込み
    App->>Engine: GameEngine初期化
    Engine->>Engine: availableGames設定
    Note over Engine: 15ゲーム設定<br/>(5タイプ × 3難易度)
    App->>Panel: MiniGamePanel表示
    Panel->>Panel: ゲーム選択UI生成
    Panel->>App: 準備完了
```

### 2. 統合ゲーム開始・終了フロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Panel as MiniGamePanel
    participant Engine as GameEngine
    participant Logic as Game Logic
    participant UI as Game UI
    participant Pet as Pet System

    User->>Panel: ゲーム選択
    Panel->>Engine: startGame(type, difficulty)
    
    Engine->>Engine: セッション生成
    activate Engine
    Engine->>Logic: ゲーム初期化
    Logic-->>Engine: 初期状態
    Engine->>UI: onGameStart(session)
    Engine->>Pet: onGameStart通知
    deactivate Engine
    
    UI->>User: ゲーム画面表示
    
    loop ゲームプレイ
        User->>UI: ユーザー操作
        UI->>Logic: アクション処理
        Logic-->>UI: 結果・状態更新
        UI->>Engine: updateSession(progress)
        UI->>User: フィードバック表示
    end
    
    UI->>Logic: 最終スコア計算
    Logic-->>UI: 結果・報酬データ
    UI->>Engine: submitResult(gameResult)
    
    Engine->>Engine: 統計更新
    activate Engine
    Engine->>Pet: applyReward(reward)
    Pet->>Pet: ステータス更新
    Pet-->>Engine: 更新完了
    Engine->>UI: onGameComplete(result)
    deactivate Engine
    
    UI->>User: 結果画面表示
```

## 🎮 ゲーム固有フロー

### 3. じゃんけんゲーム - 詳細処理フロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant RPS as RockPaperScissorsGame
    participant Logic as RPS Logic
    participant State as ゲーム状態
    participant Anim as アニメーション

    Note over RPS: ゲーム開始 - ラウンド1
    RPS->>State: totalRounds設定（難易度ベース）
    RPS->>User: 選択肢ボタン表示

    loop 各ラウンド
        User->>RPS: 手を選択（Rock/Paper/Scissors）
        RPS->>State: playerChoice記録
        RPS->>Anim: カウントダウン開始
        
        par アニメーション実行
            Anim->>Anim: "じゃん"（0.8秒）
            Anim->>Anim: "けん"（0.8秒） 
            Anim->>Anim: "ポン！"（0.4秒）
        and AI選択処理
            RPS->>Logic: generateAIChoice()
            Logic-->>RPS: aiChoice（ランダム）
            RPS->>State: aiChoice記録
        end
        
        RPS->>Logic: determineWinner(playerChoice, aiChoice)
        Logic-->>RPS: result（win/lose/draw）
        RPS->>State: result記録
        
        alt 勝利の場合
            RPS->>State: consecutiveWins++
        else その他
            RPS->>State: consecutiveWins = 0
        end
        
        RPS->>Logic: calculateScore(result, consecutiveWins, difficulty)
        Logic-->>RPS: roundScore
        RPS->>State: score += roundScore
        
        RPS->>RPS: 結果アニメーション表示
        RPS->>User: ラウンド結果画面（3秒）
        
        RPS->>State: currentRound++
        
        alt ゲーム終了条件
            Note over RPS: currentRound >= totalRounds
            RPS->>Logic: calculateReward(result, consecutiveWins, difficulty)
            Logic-->>RPS: finalReward
            RPS->>RPS: ゲーム終了処理
        else ゲーム継続
            RPS->>User: 次ラウンド開始
        end
    end
```

### 4. 数当てゲーム - 詳細処理フロー

```mermaid
sequenceDiagram
    participant User as ユーザー  
    participant NG as NumberGuessingGame
    participant Logic as NG Logic
    participant State as ゲーム状態
    participant Input as 入力システム
    participant Hint as ヒントシステム

    NG->>Logic: generateTargetNumber(difficulty)
    Logic-->>NG: targetNumber
    NG->>State: 初期状態設定
    Note over State: attemptsLeft, hints=[], targetNumber
    
    NG->>User: ゲーム画面表示
    Note over User: 範囲・試行回数の説明表示

    loop 推測ループ
        User->>Input: 数字入力
        Input->>Logic: validateGuess(guess, difficulty)
        
        alt 入力値検証失敗
            Logic-->>Input: 検証エラー
            Input->>User: エラーメッセージ表示
            Note over User: "数字を入力してください"<br/>"範囲外です" など
        else 入力値有効
            Logic-->>Input: 検証成功
            Input->>NG: 有効な推測値
            
            NG->>Logic: evaluateGuess(guess, targetNumber)
            Logic-->>NG: evaluation（correct/too-high/too-low）
            
            alt 正解
                NG->>Logic: calculateScore(attempts, maxAttempts, difficulty, true)
                Logic-->>NG: finalScore
                NG->>Logic: calculateReward(attempts, maxAttempts, difficulty, true)
                Logic-->>NG: reward
                NG->>Logic: getResultMessage(true, attempts, maxAttempts, target)
                Logic-->>NG: successMessage
                NG->>NG: ゲーム成功終了
                NG->>User: 成功画面表示
            else 不正解
                NG->>State: attemptsLeft--
                NG->>Logic: generateHint(guess, targetNumber)
                Logic-->>Hint: hintMessage
                Hint->>State: hints.push(hintMessage)
                
                NG->>Logic: getWarningMessage(attemptsLeft)
                Logic-->>NG: warningMessage（nullまたは警告）
                
                alt 試行回数残り
                    NG->>User: ヒント・警告表示
                    Note over User: "もっと大きい数字です"<br/>"残り3回です"
                else 試行回数終了
                    NG->>Logic: calculateReward(attempts, maxAttempts, difficulty, false)
                    Logic-->>NG: failureReward（20%）
                    NG->>Logic: getResultMessage(false, attempts, maxAttempts, target)
                    Logic-->>NG: failureMessage
                    NG->>NG: ゲーム失敗終了
                    NG->>User: 失敗画面表示
                end
            end
        end
    end
```

### 5. 報酬適用とペット状態更新フロー

```mermaid
sequenceDiagram
    participant Game as ゲーム
    participant Engine as GameEngine
    participant Pet as usePet
    participant Storage as LocalStorage
    participant UI as UI通知

    Game->>Engine: submitGameResult(result)
    
    Engine->>Engine: ゲーム統計更新
    activate Engine
    Note over Engine: totalGamesPlayed++<br/>recentResults.push()<br/>bestScores更新
    deactivate Engine
    
    Engine->>Pet: onRewardGiven(reward)
    
    Pet->>Pet: 現在のステータス取得
    activate Pet
    
    Pet->>Pet: updateExperience(reward.experience)
    Note over Pet: 経験値加算・レベルアップチェック
    
    Pet->>Pet: updateHappiness(reward.happiness)
    Note over Pet: 幸福度更新（0-100範囲チェック）
    
    Pet->>Pet: updateEnergy(reward.energy)
    Note over Pet: エネルギー更新（疲労蓄積）
    
    opt コイン報酬がある場合
        Pet->>Pet: updateCoins(reward.coins)
        Note over Pet: コイン残高更新
    end
    
    Pet->>Storage: saveToLocalStorage(newState)
    Storage-->>Pet: 保存完了
    
    Pet->>Pet: checkLevelUp()
    alt レベルアップ発生
        Pet->>UI: showLevelUpNotification()
        UI->>UI: レベルアップアニメーション
        Pet->>Pet: onLevelUp処理（体力回復等）
    end
    
    deactivate Pet
    
    Engine->>Game: onGameComplete(result)
    Game->>Game: 報酬表示アニメーション
    Game->>UI: ゲーム完了画面表示
```

### 6. エラーハンドリングフロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant UI as UI層
    participant Logic as Logic層  
    participant Error as エラー処理
    participant Fallback as フォールバック

    User->>UI: 無効な操作
    UI->>Logic: 処理リクエスト
    
    Logic->>Logic: バリデーション実行
    alt バリデーション失敗
        Logic->>Error: ValidationError生成
        Error->>UI: エラー情報返却
        UI->>User: エラーメッセージ表示
        Note over User: "入力値が無効です"
    else 予期しないエラー
        Logic->>Error: UnexpectedError
        Error->>Fallback: フォールバック処理実行
        Fallback->>UI: デフォルト状態復元
        UI->>User: "問題が発生しました。再試行してください"
    else 正常処理
        Logic->>UI: 処理結果返却
        UI->>User: 正常な結果表示
    end
```

## 🔄 状態管理フロー

### 7. ゲーム状態ライフサイクル

```mermaid
stateDiagram-v2
    [*] --> idle: アプリ起動
    idle --> ready: ゲーム選択
    ready --> playing: ゲーム開始
    playing --> playing: ユーザー操作
    playing --> completed: 成功終了
    playing --> failed: 失敗終了
    completed --> idle: 結果確認後
    failed --> idle: 結果確認後
    
    note left of playing
        ・ユーザー入力受付
        ・リアルタイム状態更新
        ・アニメーション実行
    end note
    
    note right of completed
        ・報酬計算・適用
        ・統計情報更新
        ・成功アニメーション
    end note
```

### 8. データフロー概要

```mermaid
flowchart TD
    A[ユーザー操作] --> B[UI コンポーネント]
    B --> C[ゲームロジック]
    C --> D[スコア計算]
    D --> E[報酬計算]
    E --> F[GameEngine]
    F --> G[ペット状態更新]
    G --> H[LocalStorage保存]
    F --> I[統計情報更新]
    I --> J[UI フィードバック]
    J --> K[ユーザー通知]
    
    style A fill:#e1f5fe
    style C fill:#f3e5f5
    style F fill:#fff3e0
    style G fill:#e8f5e8
```

---

## 🛠️ 技術実装ポイント

### パフォーマンス最適化
- **React.memo**: 不要な再レンダリング防止
- **useCallback**: イベントハンドラー最適化
- **状態の最小化**: 必要最小限のstate管理

### エラー境界
- **Error Boundary**: コンポーネントレベルでのエラー捕捉
- **Fallback UI**: エラー時の代替表示
- **ログ収集**: エラー情報の記録・分析

### アクセシビリティ
- **ARIA属性**: スクリーンリーダー対応
- **キーボード操作**: マウス不要の操作体系
- **フォーカス管理**: 適切なタブオーダー

---

**📚 関連ドキュメント**
- [メイン技術仕様書](./MINI-GAMES-DOCUMENTATION.md)
- [テスト戦略](./TESTING-STRATEGY.md)
- [開発ガイドライン](./PHASE-4-IMPLEMENTATION-GUIDE.md)