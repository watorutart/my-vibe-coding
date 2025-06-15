# 実績・統計システム シーケンス図詳細版

このドキュメントでは、AI Pet Buddy実績・統計システムの詳細なシーケンス図とフローチャートを提供します。

## 📋 目次

1. [システム全体フロー](#システム全体フロー)
2. [詳細シーケンス図](#詳細シーケンス図)
3. [エラーハンドリングフロー](#エラーハンドリングフロー)
4. [データフローダイアグラム](#データフローダイアグラム)
5. [状態遷移図](#状態遷移図)

---

## システム全体フロー

### 実績システム全体アーキテクチャ

```mermaid
graph LR
    subgraph "Frontend Layer"
        UI[User Interface]
        BD[BadgeDisplay]
        AN[Achievement Notifications]
    end
    
    subgraph "State Management Layer"
        UA[useAchievements Hook]
        LS[localStorage Service]
        NS[Notification State]
    end
    
    subgraph "Business Logic Layer"
        AE[Achievement Engine]
        PC[Progress Calculator]
        AC[Achievement Checker]
        VC[Validation Controller]
    end
    
    subgraph "Data Layer"
        TD[Type Definitions]
        PD[Predefined Data]
        SS[Statistics Store]
    end
    
    subgraph "Integration Layer"
        GM[Game Module]
        PM[Pet Module]
        EM[Evolution Module]
        CM[Care Module]
    end
    
    UI --> BD
    UI --> AN
    BD --> UA
    AN --> UA
    UA --> LS
    UA --> NS
    UA --> AE
    AE --> PC
    AE --> AC
    AE --> VC
    PC --> TD
    AC --> PD
    VC --> SS
    
    GM --> UA
    PM --> UA
    EM --> UA
    CM --> UA
```

---

## 詳細シーケンス図

### 1. システム起動・初期化の詳細フロー

```mermaid
sequenceDiagram
    participant Browser as ブラウザ
    participant App as App Component
    participant UA as useAchievements Hook
    participant LS as localStorage Service
    participant AE as Achievement Engine
    participant VC as Validation Controller
    participant TD as Type Definitions
    participant PD as Predefined Data
    
    Note over Browser,PD: アプリケーション起動
    Browser->>App: ページロード
    App->>UA: useAchievements(pet, options)
    
    Note over UA,PD: Hook初期化処理
    UA->>UA: useState() 初期化
    UA->>UA: useEffect() 開始
    
    Note over UA,PD: データ読み込み試行
    UA->>LS: loadAchievementData(STORAGE_KEY)
    LS->>LS: JSON.parse(localStorage.getItem())
    
    alt データが存在し有効な場合
        LS-->>UA: return savedData
        UA->>VC: validateAchievementData(savedData)
        VC->>TD: type checking
        TD-->>VC: validation result
        VC->>VC: checkDataIntegrity()
        VC-->>UA: return validatedData
        UA->>AE: migrateDataIfNeeded(validatedData)
        AE-->>UA: return migratedData
    else データが存在しないか無効な場合
        LS-->>UA: return null
        UA->>AE: initializeAchievementState(pet)
        AE->>PD: PREDEFINED_BADGES
        PD-->>AE: return badge definitions
        AE->>PD: PREDEFINED_TITLES  
        PD-->>AE: return title definitions
        AE->>TD: DEFAULT_ACHIEVEMENT_PROGRESS
        TD-->>AE: return default progress
        AE->>AE: createInitialState()
        AE-->>UA: return initialState
    end
    
    Note over UA,PD: 状態設定とセッション開始
    UA->>UA: setAchievementState(data)
    UA->>UA: setIsLoading(false)
    UA->>UA: startSessionTracking()
    UA->>UA: scheduleAutoSave()
    UA-->>App: hook ready
    
    Note over Browser,PD: レンダリング完了
    App->>App: render with achievement data
    App-->>Browser: 表示完了
```

### 2. ゲーム結果記録の詳細フロー

```mermaid
sequenceDiagram
    participant Game as Game Component
    participant UA as useAchievements Hook
    participant AE as Achievement Engine
    participant PC as Progress Calculator
    participant AC as Achievement Checker
    participant NC as Notification Creator
    participant LS as localStorage Service
    participant UI as UI Components
    
    Note over Game,UI: ゲーム完了から実績更新まで
    Game->>UA: recordGameResult(gameData)
    UA->>UA: validateGameData(gameData)
    
    alt データが有効な場合
        UA->>AE: updateGameProgress(gameData, currentState)
        
        Note over AE,NC: 進捗計算処理
        AE->>PC: calculateWinStreak(gameData, history)
        PC->>PC: analyzeGameHistory()
        PC-->>AE: return { currentStreak, maxStreak }
        
        AE->>PC: calculateTotalGames(gameData, statistics)
        PC-->>AE: return totalGameCount
        
        AE->>PC: calculateWinRate(gameData, statistics)
        PC-->>AE: return winRateData
        
        Note over AE,NC: 実績チェック処理
        AE->>AC: checkAllAchievements(updatedProgress)
        
        loop 各バッジをチェック
            AC->>AC: checkBadgeRequirement(badge, progress)
            alt 解除条件を満たす場合
                AC->>AC: markBadgeAsUnlocked(badge)
                AC->>NC: createBadgeNotification(badge)
                NC-->>AC: return notification
            end
        end
        
        loop 各称号をチェック
            AC->>AC: checkTitleRequirement(title, progress)
            alt 解除条件を満たす場合
                AC->>AC: markTitleAsUnlocked(title)
                AC->>NC: createTitleNotification(title)
                NC-->>AC: return notification
            end
        end
        
        AC-->>AE: return { updatedState, notifications }
        AE-->>UA: return processedResult
        
        Note over UA,UI: 状態更新と永続化
        UA->>UA: setState(updatedState)
        UA->>UA: addNotifications(newNotifications)
        UA->>LS: saveAchievementData(newState)
        LS-->>UA: save completed
        
        UA-->>Game: operation successful
        
        Note over Game,UI: UI更新とアニメーション
        UA->>UI: trigger re-render
        UI->>UI: updateBadgeDisplay()
        UI->>UI: showUnlockAnimations()
        UI->>UI: displayNotifications()
    else データが無効な場合
        UA->>UA: logError('Invalid game data')
        UA-->>Game: operation failed
    end
```

### 3. 進化記録の詳細フロー

```mermaid
sequenceDiagram
    participant Evolution as Evolution System
    participant UA as useAchievements Hook
    participant AE as Achievement Engine
    participant PC as Progress Calculator
    participant AC as Achievement Checker
    participant TM as Title Manager
    participant AN as Animation Controller
    participant LS as localStorage Service
    
    Note over Evolution,LS: ペット進化時の実績処理
    Evolution->>UA: recordEvolution(evolutionData)
    UA->>UA: validateEvolutionData(evolutionData)
    UA->>AE: updateEvolutionProgress(evolutionData, state)
    
    Note over AE,TM: 進化統計の更新
    AE->>PC: incrementEvolutionCount(currentCount)
    PC-->>AE: return newCount
    AE->>PC: updateEvolutionHistory(evolutionData)
    PC-->>AE: return updatedHistory
    
    Note over AE,TM: 進化関連実績のチェック
    AE->>AC: checkEvolutionAchievements(newCount, history)
    
    alt 初回進化の場合 (count == 1)
        AC->>AC: unlockBadge("first-evolution")
        AC->>AN: createSparkleEffect("first-evolution")
        AC->>UA: queueNotification("🌟 初めての進化！")
    end
    
    alt 進化回数マイルストーン (5, 10, 20回)
        AC->>AC: checkEvolutionMilestones(newCount)
        AC->>AC: unlockBadge("evolution-master")
        AC->>AN: createGoldenEffect("evolution-master")
        AC->>UA: queueNotification("🦋 進化マスター称号獲得！")
    end
    
    Note over AE,TM: 称号チェックと管理
    AE->>TM: checkEvolutionTitles(newCount, petLevel)
    TM->>TM: evaluateTitleRequirements()
    
    alt 称号解除条件達成
        TM->>TM: unlockTitle("evolution-expert")
        TM->>TM: autoActivateTitle(title)
        TM-->>AE: return titleUpdates
    end
    
    Note over AE,LS: 結果の統合と保存
    AE->>AE: combineAllUpdates(badges, titles, progress)
    AE-->>UA: return completeUpdate
    UA->>UA: applyStateChanges(update)
    UA->>LS: saveToStorage(newState)
    LS-->>UA: save confirmed
    
    Note over Evolution,LS: UI反映
    UA-->>Evolution: evolution recorded
    UA->>AN: triggerUnlockAnimations()
    AN->>AN: showBadgeUnlockEffects()
    AN->>AN: showTitleAcquisitionModal()
```

### 4. セッション管理の詳細フロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant App as App Component
    participant UA as useAchievements Hook
    participant ST as Session Tracker
    participant AS as Auto Saver
    participant LS as localStorage Service
    participant PT as Playtime Tracker
    participant AC as Achievement Checker
    
    Note over User,AC: セッション開始
    User->>App: アプリ起動
    App->>UA: useAchievements() マウント
    UA->>ST: initializeSession()
    ST->>ST: sessionId = generateUUID()
    ST->>ST: startTime = Date.now()
    ST->>PT: startPlaytimeTracking()
    
    Note over UA,AC: 自動保存スケジュール
    UA->>AS: scheduleAutoSave(interval: 30000)
    AS->>AS: setInterval(saveFunction, 30000)
    
    Note over User,AC: ユーザーアクティビティ
    loop ユーザー操作中
        User->>App: 各種操作 (ゲーム、ケア等)
        App->>UA: record*() メソッド呼び出し
        UA->>UA: updateInternalState()
        UA->>ST: recordActivity(activityType)
        
        Note over UA,AC: 定期自動保存
        AS->>AS: 保存タイマー発火
        AS->>LS: saveCurrentState()
        LS->>LS: JSON.stringify(state)
        LS->>LS: localStorage.setItem()
        LS-->>AS: 保存完了
        
        Note over UA,AC: プレイ時間チェック
        PT->>PT: updatePlaytime()
        PT->>AC: checkPlaytimeAchievements()
        alt プレイ時間マイルストーン達成
            AC->>UA: notifyPlaytimeAchievement()
        end
    end
    
    Note over User,AC: セッション終了
    User->>App: アプリ終了/非アクティブ
    App->>UA: useEffect cleanup
    UA->>ST: endSession()
    ST->>ST: endTime = Date.now()
    ST->>ST: duration = endTime - startTime
    ST->>PT: finalizePlaytime(duration)
    
    Note over UA,AC: 最終データ保存
    UA->>ST: generateSessionSummary()
    ST-->>UA: return sessionData
    UA->>UA: updateSessionStatistics(sessionData)
    UA->>LS: finalSave(completeState)
    LS-->>UA: 最終保存完了
    
    Note over User,AC: クリーンアップ
    UA->>AS: clearAutoSaveTimer()
    AS->>AS: clearInterval(timer)
    UA-->>App: cleanup完了
```

---

## エラーハンドリングフロー

### localStorage エラーハンドリング

```mermaid
sequenceDiagram
    participant UA as useAchievements Hook
    participant LS as localStorage Service
    participant EH as Error Handler
    participant FB as Fallback Service
    participant User as ユーザー
    
    Note over UA,User: localStorage操作でのエラー処理
    UA->>LS: saveAchievementData(state)
    LS->>LS: JSON.stringify(state)
    LS->>LS: localStorage.setItem()
    
    alt localStorage使用不可 (プライベートモード等)
        LS->>EH: catch StorageError
        EH->>FB: activateMemoryFallback()
        FB->>FB: store in memory only
        EH->>User: showStorageWarning()
        EH-->>UA: return fallback_success
    else 容量不足エラー
        LS->>EH: catch QuotaExceededError  
        EH->>LS: clearOldData()
        LS->>LS: remove old sessions
        LS->>LS: retry save
        alt 再試行成功
            LS-->>UA: return success
        else 再試行失敗
            EH->>FB: activateMemoryFallback()
            EH->>User: showQuotaWarning()
            EH-->>UA: return fallback_success
        end
    else その他のエラー
        LS->>EH: catch Error
        EH->>EH: logError(error)
        EH->>FB: activateTemporaryMode()
        EH-->>UA: return error_handled
    else 正常保存
        LS-->>UA: return success
    end
```

### データ整合性チェックフロー

```mermaid
sequenceDiagram
    participant UA as useAchievements Hook
    participant VC as Validation Controller
    participant DM as Data Migrator
    participant TD as Type Definitions
    participant RB as Rollback Manager
    
    Note over UA,RB: データ読み込み時の検証処理
    UA->>VC: validateAchievementData(loadedData)
    VC->>TD: checkTypeDefinitions(data)
    
    alt 型定義エラー
        TD-->>VC: type_mismatch
        VC->>RB: initiateDataRollback()
        RB->>RB: clearCorruptedData()
        RB-->>UA: return null (初期化必要)
    end
    
    VC->>VC: checkDataIntegrity(data)
    alt データ破損検出
        VC->>DM: attemptDataRepair(data)
        DM->>DM: repairMissingFields()
        DM->>DM: fixInconsistencies()
        alt 修復成功
            DM-->>VC: return repairedData
        else 修復失敗
            DM-->>VC: return repair_failed
            VC->>RB: initiateDataRollback()
            RB-->>UA: return null
        end
    end
    
    VC->>VC: checkVersionCompatibility(data)
    alt バージョン不整合
        VC->>DM: migrateToCurrentVersion(data)
        DM->>DM: applyMigrations()
        DM-->>VC: return migratedData
    end
    
    VC-->>UA: return validatedData
```

---

## データフローダイアグラム

### 実績データの変換フロー

```mermaid
flowchart TD
    A[User Action] --> B{Action Validation}
    B -->|Valid| C[Data Processing]
    B -->|Invalid| D[Error Handler]
    
    C --> E[Progress Calculation]
    E --> F[Achievement Check]
    F --> G{New Achievement?}
    
    G -->|Yes| H[Create Notification]
    G -->|No| I[Update Progress Only]
    
    H --> J[Update UI State]
    I --> J
    J --> K[Auto Save]
    K --> L{Save Success?}
    
    L -->|Success| M[Confirm State]
    L -->|Failure| N[Fallback Storage]
    
    N --> O[Memory Storage]
    M --> P[Re-render UI]
    O --> P
    
    P --> Q[Animation Effects]
    Q --> R[User Feedback]
    
    D --> S[Log Error]
    S --> T[Show Error Message]
    T --> U[Recovery Options]
```

### 統計データ集計フロー

```mermaid
flowchart LR
    A[Raw Action Data] --> B[Data Categorization]
    
    B --> C[Game Statistics]
    B --> D[Care Statistics]  
    B --> E[Evolution Statistics]
    B --> F[Session Statistics]
    
    C --> G[Win Rate Calculation]
    C --> H[Streak Analysis]
    D --> I[Action Frequency]
    D --> J[Care Pattern Analysis]
    E --> K[Evolution Timeline]
    F --> L[Playtime Analysis]
    
    G --> M[Achievement Progress Update]
    H --> M
    I --> M
    J --> M
    K --> M
    L --> M
    
    M --> N[Badge/Title Check]
    N --> O[Notification Generation]
    O --> P[UI Update]
```

---

## 状態遷移図

### バッジ状態の遷移

```mermaid
stateDiagram-v2
    [*] --> Locked: Initial State
    
    Locked --> InProgress: Action Recorded
    InProgress --> InProgress: Progress Updated
    InProgress --> Unlocked: Requirement Met
    
    Unlocked --> Displayed: UI Rendered
    Displayed --> Celebrated: Animation Triggered
    Celebrated --> Completed: Animation Finished
    
    Completed --> [*]: State Persisted
    
    note right of InProgress
        Progress: 0.0 - 0.99
        Visual: Progress Bar
    end note
    
    note right of Unlocked
        Progress: 1.0
        Visual: Unlock Effect
    end note
```

### 称号状態の遷移

```mermaid
stateDiagram-v2
    [*] --> Hidden: Initial State
    
    Hidden --> Available: Requirement Met
    Available --> Unlocked: User Notification
    Unlocked --> Inactive: Default State
    Unlocked --> Active: User Activated
    
    Active --> Inactive: User Deactivated
    Inactive --> Active: User Reactivated
    
    Active --> Displayed: UI Show
    Displayed --> [*]: Session End
    
    note right of Active
        Only one title can be
        active at a time
    end note
```

### セッション状態の遷移

```mermaid
stateDiagram-v2
    [*] --> Initializing: Hook Mount
    
    Initializing --> Loading: Data Fetch
    Loading --> Ready: Data Loaded
    Loading --> Error: Load Failed
    
    Ready --> Tracking: Session Started
    Tracking --> Tracking: Activity Recorded
    Tracking --> Saving: Auto Save
    Saving --> Tracking: Save Complete
    Saving --> Error: Save Failed
    
    Error --> Recovery: Error Handler
    Recovery --> Tracking: Recovery Success
    Recovery --> Offline: Recovery Failed
    
    Tracking --> Finalizing: Session End
    Finalizing --> Completed: Final Save
    Completed --> [*]: Cleanup
```

---

## パフォーマンス最適化フロー

### メモ化による計算最適化

```mermaid
sequenceDiagram
    participant Component as React Component
    participant Hook as useAchievements
    participant Cache as Calculation Cache
    participant Engine as Achievement Engine
    
    Component->>Hook: getSummary()
    Hook->>Cache: checkCache(dependencies)
    
    alt キャッシュヒット
        Cache-->>Hook: return cached result
        Hook-->>Component: return summary
    else キャッシュミス
        Hook->>Engine: calculateSummary(state)
        Engine->>Engine: heavy calculations
        Engine-->>Hook: return fresh result
        Hook->>Cache: storeCache(result, dependencies)
        Hook-->>Component: return summary
    end
```

### バッチ更新による描画最適化

```mermaid
sequenceDiagram
    participant Actions as Multiple Actions
    participant Hook as useAchievements
    participant Batch as Batch Processor
    participant UI as UI Components
    
    Note over Actions,UI: 複数アクション同時実行
    Actions->>Hook: recordGameResult()
    Actions->>Hook: recordCareAction()
    Actions->>Hook: recordEvolution()
    
    Hook->>Batch: queueUpdate(gameUpdate)
    Hook->>Batch: queueUpdate(careUpdate)
    Hook->>Batch: queueUpdate(evolutionUpdate)
    
    Batch->>Batch: wait for batch timeout
    Batch->>Batch: combineUpdates()
    Batch->>Hook: processBatchedUpdates()
    
    Hook->>UI: single re-render with all updates
    UI->>UI: updateAllComponents()
```

---

*このドキュメントは AI Pet Buddy Phase 4 実装の詳細シーケンス図仕様書です。*
*システムの動作フローを正確に理解するための技術資料として活用してください。*