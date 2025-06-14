# PWA技術アーキテクチャ詳細

## システム全体のアーキテクチャ

### 1. コンポーネント間の相互作用

```mermaid
graph TD
    A[main.tsx] --> B[App.tsx]
    B --> C[PWAProvider]
    C --> D[usePWA Hook]
    C --> E[useNotification Hook]
    
    D --> F[Service Worker Utils]
    D --> G[PWA Utils]
    E --> H[Push Notification Utils]
    
    C --> I[InstallPrompt]
    C --> J[OfflineIndicator]  
    C --> K[UpdateNotification]
    C --> L[NotificationSettings]
    
    M[Service Worker] --> N[Cache Management]
    M --> O[Background Sync]
    M --> P[Push Events]
    
    Q[Manifest] --> R[Platform Integration]
    
    style C fill:#ff6b6b
    style M fill:#4ecdc4
    style Q fill:#45b7d1
```

### 2. データフロー アーキテクチャ

```mermaid
flowchart LR
    A[User Action] --> B[React Components]
    B --> C[PWA Hooks]
    C --> D[PWA Utils]
    D --> E[Service Worker]
    E --> F[Cache/Network]
    F --> G[Response]
    G --> H[State Update]
    H --> I[UI Re-render]
    
    J[Pet State] --> K[Notification System]
    K --> L[Push Notifications]
    L --> M[User Interaction]
    M --> N[App Activation]
```

## 詳細シーケンス図

### 1. アプリケーション起動時のPWA初期化

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Main as main.tsx
    participant App as App.tsx
    participant PWAProvider as PWAProvider
    participant usePWA as usePWA Hook
    participant useNotification as useNotification Hook
    participant SW as Service Worker
    participant Cache as Cache Storage
    participant Notification as Notification API

    User->>Browser: アプリケーションアクセス
    Browser->>Main: スクリプト実行
    
    alt 本番環境
        Main->>SW: registerServiceWorker()
        SW->>Cache: 静的リソースキャッシュ
        Cache-->>SW: キャッシュ完了
        SW-->>Main: 登録完了
    else 開発環境
        Main->>Main: Service Worker スキップ
    end
    
    Main->>App: App コンポーネント初期化
    App->>PWAProvider: PWAProvider 初期化
    PWAProvider->>usePWA: usePWA() 実行
    PWAProvider->>useNotification: useNotification() 実行
    
    usePWA->>usePWA: initializePWA()
    usePWA->>SW: Service Worker 状態確認
    SW-->>usePWA: 登録・制御状態
    
    usePWA->>Browser: プラットフォーム検出
    Browser-->>usePWA: プラットフォーム情報
    
    usePWA->>Browser: インストール状態確認
    Browser-->>usePWA: インストール状態
    
    useNotification->>Notification: 通知サポート確認
    Notification-->>useNotification: サポート状態
    
    PWAProvider-->>App: PWA初期化完了
    App-->>Browser: アプリケーション表示
    Browser-->>User: PWA対応アプリ起動
```

### 2. ペット状態変更による通知システム

```mermaid
sequenceDiagram
    participant Pet as Pet State
    participant PWAProvider as PWAProvider
    participant useNotification as useNotification Hook
    participant NotificationAPI as Notification API
    participant SW as Service Worker
    participant User as ユーザー
    participant Browser as ブラウザ

    Pet->>PWAProvider: ペット状態更新 (hunger: 25)
    PWAProvider->>useNotification: monitorPetStats(petStats)
    
    useNotification->>useNotification: スケジュール済み通知チェック
    useNotification->>useNotification: 閾値判定 (25 < 30)
    useNotification->>useNotification: 通知間隔チェック (最後の通知から30分経過)
    useNotification->>useNotification: 静音時間チェック
    
    alt 通知条件すべて満足
        useNotification->>NotificationAPI: 通知許可状態確認
        
        alt 通知許可済み
            useNotification->>SW: 通知データ送信
            Note over useNotification,SW: {title: "お腹が空いています", body: "ペットにご飯をあげましょう"}
            
            SW->>NotificationAPI: showNotification()
            NotificationAPI-->>User: プッシュ通知表示
            
            User->>NotificationAPI: 通知をクリック
            NotificationAPI->>SW: notificationclick イベント
            SW->>Browser: clients.openWindow() / clients.focus()
            Browser->>PWAProvider: アプリをフォーカス
            PWAProvider->>PWAProvider: ペット画面に遷移
            
            useNotification->>useNotification: 通知履歴記録
            useNotification->>useNotification: 次回通知時間設定
            
        else 通知未許可
            useNotification->>PWAProvider: 通知許可要求UI表示
            PWAProvider-->>User: "通知を有効にしてペットの世話を忘れないようにしましょう"
            
            User->>PWAProvider: 通知許可ボタンクリック
            PWAProvider->>useNotification: requestPermission()
            useNotification->>NotificationAPI: Notification.requestPermission()
            NotificationAPI-->>User: ブラウザ通知許可ダイアログ
            User->>NotificationAPI: 許可/拒否
            NotificationAPI-->>useNotification: 許可結果
            
            alt 許可された場合
                useNotification->>useNotification: 通知設定有効化
                useNotification->>SW: テスト通知送信
                SW->>NotificationAPI: "通知が有効になりました"
                NotificationAPI-->>User: テスト通知表示
            else 拒否された場合
                useNotification->>useNotification: 通知設定無効化
                useNotification->>PWAProvider: 通知無効状態を通知
            end
        end
    else 通知条件不満足
        useNotification->>useNotification: 通知スキップ
        Note over useNotification: 静音時間中 または 間隔不足 または 閾値未満
    end
```

### 3. オフライン/オンライン状態の詳細管理

```mermaid
sequenceDiagram
    participant Network as ネットワーク
    participant Browser as ブラウザ
    participant usePWA as usePWA Hook
    participant SW as Service Worker
    participant Cache as Cache Storage
    participant OfflineIndicator as OfflineIndicator UI
    participant User as ユーザー
    participant App as App Components

    Network->>Browser: ネットワーク切断
    Browser->>usePWA: 'offline' イベント
    usePWA->>usePWA: オフライン開始時刻記録
    usePWA->>usePWA: オフライン時間カウンター開始
    usePWA-->>OfflineIndicator: isOffline: true, offlineDuration: 0
    OfflineIndicator-->>User: オフライン状態バナー表示
    
    loop 1秒ごと
        usePWA->>usePWA: オフライン時間更新
        usePWA-->>OfflineIndicator: offlineDuration更新
        OfflineIndicator-->>User: "オフライン: XXX秒"
    end
    
    User->>App: アプリ操作（ペットにご飯をあげる）
    App->>SW: データ保存要求
    
    alt キャッシュ可能なデータ
        SW->>Cache: ローカルストレージに保存
        Cache-->>SW: 保存完了
        SW-->>App: オフライン保存完了
        App-->>User: 操作完了（オフライン動作）
        SW->>SW: 同期待ちキューに追加
    else ネットワーク必須データ
        SW-->>App: オフラインエラー
        App-->>User: "この操作はオンライン時に実行されます"
    end
    
    Network->>Browser: ネットワーク復旧
    Browser->>usePWA: 'online' イベント
    usePWA->>usePWA: オフライン時間計算・タイマー停止
    usePWA-->>OfflineIndicator: isOffline: false, lastOnline: new Date()
    OfflineIndicator-->>User: "オンラインに復帰しました"
    
    usePWA->>SW: オンライン復帰通知
    SW->>SW: 同期待ちキュー確認
    
    alt 同期待ちデータあり
        SW->>Network: 蓄積されたデータを同期
        Network-->>SW: 同期完了
        SW->>usePWA: 同期完了通知
        usePWA-->>OfflineIndicator: hasPendingSync: false
        OfflineIndicator-->>User: "同期が完了しました"
    else 同期待ちデータなし
        SW-->>usePWA: 同期不要
    end
    
    User->>OfflineIndicator: 再接続テストボタン
    OfflineIndicator->>SW: RETRY_CONNECTION メッセージ
    SW->>Network: 接続テスト要求
    
    alt 接続成功
        Network-->>SW: 接続OK
        SW-->>OfflineIndicator: 接続確認完了
        OfflineIndicator-->>User: "接続が安定しています"
    else 接続失敗
        Network-->>SW: 接続エラー
        SW-->>OfflineIndicator: 接続不安定
        OfflineIndicator-->>User: "接続が不安定です"
    end
```

### 4. キャッシュ戦略の詳細フロー

```mermaid
sequenceDiagram
    participant App as Application
    participant SW as Service Worker
    participant Cache as Cache Storage
    participant Network as Network
    participant Browser as Browser

    App->>SW: リソース要求 (fetch event)
    SW->>SW: URL解析・戦略決定
    
    alt 静的リソース (Cache-First)
        SW->>Cache: キャッシュ確認
        
        alt キャッシュHIT
            Cache-->>SW: キャッシュされたリソース
            SW-->>App: 即座にレスポンス
            Note over SW,App: 高速レスポンス
        else キャッシュMISS
            SW->>Network: ネットワーク要求
            
            alt ネットワーク成功
                Network-->>SW: 新しいリソース
                SW->>Cache: 新しいリソースをキャッシュ
                Cache-->>SW: キャッシュ完了
                SW-->>App: リソース返却
            else ネットワーク失敗
                SW-->>App: エラーレスポンス
            end
        end
        
    else 動的コンテンツ (Network-First)
        SW->>Network: ネットワーク要求
        
        alt ネットワーク成功
            Network-->>SW: 最新データ
            SW->>Cache: 最新データをキャッシュ
            Cache-->>SW: キャッシュ完了
            SW-->>App: 最新データ返却
            Note over SW,App: 常に最新データ
        else ネットワーク失敗
            SW->>Cache: キャッシュ確認
            
            alt キャッシュあり
                Cache-->>SW: キャッシュされたデータ
                SW-->>App: 古いデータ返却
                Note over SW,App: オフライン時の継続動作
            else キャッシュなし
                SW-->>App: オフライン専用レスポンス
                Note over SW,App: オフライン画面表示
            end
        end
        
    else その他リソース (Stale-While-Revalidate)
        SW->>Cache: キャッシュ確認
        
        par キャッシュレスポンス
            alt キャッシュあり
                Cache-->>SW: キャッシュされたリソース
                SW-->>App: 即座にレスポンス
            else キャッシュなし
                SW->>Network: ネットワーク要求（同期）
                Network-->>SW: リソース取得
                SW-->>App: リソース返却
            end
        and バックグラウンド更新
            SW->>Network: バックグラウンド更新要求
            
            alt ネットワーク成功
                Network-->>SW: 新しいリソース
                SW->>Cache: キャッシュ更新
                Cache-->>SW: 更新完了
                Note over SW: 次回アクセス時により新しいデータが利用可能
            else ネットワーク失敗
                SW->>SW: バックグラウンド更新失敗
                Note over SW: 現在のキャッシュを維持
            end
        end
    end
```

### 5. インストールプロンプトの高度な制御

```mermaid
sequenceDiagram
    participant Browser as ブラウザ
    participant usePWA as usePWA Hook
    participant InstallManager as Install Manager
    participant InstallPrompt as InstallPrompt UI
    participant User as ユーザー
    participant LocalStorage as Local Storage

    Browser->>usePWA: beforeinstallprompt イベント
    usePWA->>usePWA: e.preventDefault()
    usePWA->>usePWA: deferredPrompt = e
    usePWA->>InstallManager: プロンプト利用可能を記録
    
    usePWA->>InstallManager: shouldShowPrompt()
    InstallManager->>LocalStorage: 表示履歴確認
    LocalStorage-->>InstallManager: 過去の表示回数・拒否状況
    
    InstallManager->>InstallManager: プロンプト表示判定
    Note over InstallManager: - 1日の最大表示回数チェック<br/>- 前回拒否からの経過時間<br/>- 永続的拒否状態の確認
    
    alt 表示条件満足
        InstallManager-->>usePWA: shouldShow: true
        usePWA-->>InstallPrompt: プロンプト表示指示
        
        InstallPrompt->>InstallPrompt: 5秒遅延後表示
        InstallPrompt-->>User: インストール提案UI
        
        alt ユーザーが「インストール」選択
            User->>InstallPrompt: インストールボタン
            InstallPrompt->>usePWA: showInstallPrompt()
            usePWA->>Browser: deferredPrompt.prompt()
            Browser-->>User: ブラウザネイティブプロンプト
            
            User->>Browser: インストール承認
            Browser->>usePWA: userChoice: 'accepted'
            usePWA->>InstallManager: recordPromptShown('accepted')
            InstallManager->>LocalStorage: インストール成功記録
            
            Browser->>usePWA: appinstalled イベント
            usePWA->>usePWA: isInstalled = true
            usePWA-->>InstallPrompt: インストール完了
            InstallPrompt-->>User: "インストールが完了しました！"
            
        else ユーザーが「後で」選択
            User->>InstallPrompt: 後でボタン
            InstallPrompt->>usePWA: dismissInstallPrompt(false)
            usePWA->>InstallManager: recordPromptDismissed(false)
            InstallManager->>LocalStorage: 一時的拒否記録
            Note over InstallManager: 24時間後に再表示可能
            
        else ユーザーが「今後表示しない」選択
            User->>InstallPrompt: 今後表示しないボタン
            InstallPrompt->>usePWA: dismissInstallPrompt(true)
            usePWA->>InstallManager: recordPromptDismissed(true)
            InstallManager->>LocalStorage: 永続的拒否記録
            Note over InstallManager: 今後プロンプト表示なし
            
        else ユーザーが無視
            Note over User,InstallPrompt: 30秒後自動非表示
            InstallPrompt->>InstallPrompt: タイムアウト
            InstallPrompt->>usePWA: dismissInstallPrompt(false)
        end
        
    else 表示条件不満足
        InstallManager-->>usePWA: shouldShow: false
        Note over InstallManager: 以下の理由で非表示：<br/>- 1日の最大表示回数超過<br/>- 前回拒否から24時間未満<br/>- 永続的拒否状態<br/>- 既にインストール済み
    end
```

## パフォーマンス最適化

### キャッシュサイズ管理

```mermaid
graph TD
    A[Cache Management] --> B[Static Cache]
    A --> C[Dynamic Cache]
    A --> D[Data Cache]
    
    B --> E[JS/CSS Files<br/>Max: 50MB]
    C --> F[Images/Assets<br/>Max: 100MB]
    D --> G[API Responses<br/>Max: 10MB]
    
    E --> H[LRU Eviction]
    F --> H
    G --> H
    
    H --> I[Cache Cleanup]
    I --> J[Old Version Removal]
    I --> K[Size Limit Enforcement]
```

### 通知のバッチ処理

```mermaid
sequenceDiagram
    participant Timer as Timer
    participant NotificationQueue as Notification Queue
    participant SW as Service Worker
    participant User as User

    loop 5分間隔
        Timer->>NotificationQueue: バッチ処理開始
        NotificationQueue->>NotificationQueue: 通知キュー確認
        
        alt 複数通知あり
            NotificationQueue->>NotificationQueue: 通知をグループ化
            NotificationQueue->>SW: まとめて通知
            SW-->>User: "ペットの世話が必要です（3件）"
        else 単一通知
            NotificationQueue->>SW: 単一通知
            SW-->>User: 個別通知
        else 通知なし
            NotificationQueue->>NotificationQueue: 何もしない
        end
    end
```

## エラーハンドリング

### Service Worker エラー対応

```mermaid
flowchart TD
    A[Service Worker Error] --> B{Error Type}
    
    B -->|Registration Failed| C[Fallback to Normal Mode]
    B -->|Cache Error| D[Clear Corrupted Cache]
    B -->|Network Error| E[Return Cached Version]
    B -->|Notification Error| F[Disable Notifications]
    
    C --> G[Log Error & Continue]
    D --> H[Rebuild Cache]
    E --> I[Show Offline Indicator]
    F --> J[Show Permission Request]
    
    G --> K[User Experience Maintained]
    H --> L[Background Sync When Online]
    I --> M[Retry Connection Button]
    J --> N[Manual Permission Request]
```

この技術アーキテクチャドキュメントは、PWA機能の実装における詳細な処理フローと技術的な側面を包括的に説明しています。開発者がシステムの動作を理解し、機能拡張や問題解決を行う際の技術的な指針として活用できます。