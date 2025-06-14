# PWA機能実装ドキュメント

## 概要

AI Pet BuddyのProgressive Web App (PWA) 機能の包括的な実装ドキュメントです。本機能により、Webアプリケーションがネイティブアプリのような体験を提供し、オフライン対応、プッシュ通知、ホーム画面へのインストールなどの機能を実現しています。

## アーキテクチャ概要

### コンポーネント構成

```
PWA Architecture
├── Service Worker (public/sw.js)
│   ├── キャッシュ戦略管理
│   ├── オフライン機能提供
│   └── バックグラウンド同期
├── PWA Provider (src/components/PWAProvider.tsx)
│   ├── PWA状態統合管理
│   ├── UI コンポーネント制御
│   └── ペット状態監視
├── PWA Hook (src/hooks/usePWA.ts)  
│   ├── PWA状態管理
│   ├── イベント処理
│   └── インストール管理
├── 通知システム (src/hooks/useNotification.ts)
│   ├── プッシュ通知管理
│   ├── ペット状態監視
│   └── 通知設定管理
└── UI Components
    ├── InstallPrompt - インストールプロンプト
    ├── OfflineIndicator - オフライン状態表示
    ├── UpdateNotification - 更新通知
    └── NotificationSettings - 通知設定
```

### 主要機能

1. **Service Worker による高度なキャッシュ戦略**
2. **オフライン対応とデータ同期**
3. **プラットフォーム対応インストールプロンプト**
4. **ペット状態連動プッシュ通知**
5. **自動アップデート機能**

## 処理フロー - シーケンス図

### 1. PWA初期化フロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant App as App.tsx
    participant PWAProvider as PWAProvider
    participant usePWA as usePWA Hook
    participant SW as Service Worker
    participant Utils as PWA Utils

    User->>App: アプリケーション起動
    App->>PWAProvider: PWAProvider初期化
    PWAProvider->>usePWA: usePWA() 呼び出し
    
    usePWA->>Utils: detectPlatform()
    Utils-->>usePWA: プラットフォーム情報
    
    usePWA->>SW: registerServiceWorker()
    SW-->>usePWA: 登録状態
    
    usePWA->>Utils: isPWAInstalled()
    Utils-->>usePWA: インストール状態
    
    usePWA->>Utils: canInstallPWA()
    Utils-->>usePWA: インストール可能性
    
    usePWA-->>PWAProvider: PWA状態
    PWAProvider-->>App: PWA機能有効化
    App-->>User: PWA対応アプリ表示
```

### 2. Service Worker ライフサイクル

```mermaid
sequenceDiagram
    participant Browser as ブラウザ
    participant SW as Service Worker
    participant Cache as キャッシュ
    participant Network as ネットワーク

    Browser->>SW: install イベント
    SW->>Cache: 静的リソースキャッシュ
    Cache-->>SW: キャッシュ完了
    SW->>SW: skipWaiting()
    
    Browser->>SW: activate イベント  
    SW->>Cache: 古いキャッシュ削除
    SW->>Browser: clients.claim()
    
    Browser->>SW: fetch イベント
    
    alt 静的リソース (Cache-First)
        SW->>Cache: キャッシュ確認
        alt キャッシュ存在
            Cache-->>SW: キャッシュ応答
            SW-->>Browser: キャッシュから返却
        else キャッシュ不存在
            SW->>Network: ネットワーク要求
            Network-->>SW: リソース取得
            SW->>Cache: キャッシュ保存
            SW-->>Browser: ネットワークから返却
        end
    else 動的コンテンツ (Network-First)
        SW->>Network: ネットワーク要求
        alt ネットワーク成功
            Network-->>SW: リソース取得
            SW->>Cache: キャッシュ更新
            SW-->>Browser: ネットワークから返却
        else ネットワーク失敗
            SW->>Cache: キャッシュ確認
            Cache-->>SW: キャッシュ応答
            SW-->>Browser: キャッシュから返却
        end
    end
```

### 3. インストールプロンプト管理

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant usePWA as usePWA Hook
    participant InstallPrompt as InstallPrompt UI
    participant PWAProvider as PWAProvider
    participant Utils as Install Manager

    Browser->>usePWA: beforeinstallprompt イベント
    usePWA->>usePWA: preventDefault()
    usePWA->>usePWA: deferredPrompt 保存
    usePWA-->>PWAProvider: canInstall: true
    
    PWAProvider->>Utils: shouldShowPrompt()
    Utils-->>PWAProvider: プロンプト表示判定
    
    alt プロンプト表示条件満足
        PWAProvider->>InstallPrompt: プロンプト表示
        InstallPrompt-->>User: インストール提案UI
        
        alt ユーザーがインストール選択
            User->>InstallPrompt: インストールボタン
            InstallPrompt->>usePWA: showInstallPrompt()
            usePWA->>Browser: deferredPrompt.prompt()
            Browser-->>User: ブラウザ標準プロンプト
            User->>Browser: インストール承認
            Browser->>usePWA: userChoice: 'accepted'
            usePWA->>Utils: recordPromptShown()
            usePWA-->>PWAProvider: インストール成功
            Browser->>usePWA: appinstalled イベント
            usePWA-->>PWAProvider: isInstalled: true
        else ユーザーが拒否
            User->>InstallPrompt: 拒否ボタン
            InstallPrompt->>usePWA: dismissInstallPrompt()
            usePWA->>Utils: recordPromptDismissed()
            usePWA-->>PWAProvider: プロンプト非表示
        end
    end
```

### 4. オフライン状態管理

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Network as ネットワーク
    participant usePWA as usePWA Hook
    participant OfflineIndicator as Offline UI
    participant SW as Service Worker
    participant Cache as キャッシュ

    Network->>usePWA: offline イベント
    usePWA->>usePWA: offlineStartTime 記録
    usePWA->>usePWA: オフライン時間タイマー開始
    usePWA-->>OfflineIndicator: isOffline: true
    OfflineIndicator-->>User: オフライン状態表示
    
    User->>App: 操作要求
    App->>SW: リソース要求
    SW->>Cache: キャッシュ確認
    
    alt キャッシュ存在
        Cache-->>SW: キャッシュ応答
        SW-->>App: オフライン動作継続
        App-->>User: キャッシュから動作
    else キャッシュ不存在
        SW-->>App: オフライン応答
        App-->>User: オフライン専用UI
    end
    
    Network->>usePWA: online イベント
    usePWA->>usePWA: オフライン時間計算
    usePWA->>usePWA: タイマー停止
    usePWA-->>OfflineIndicator: isOffline: false
    OfflineIndicator-->>User: オンライン復帰表示
    
    User->>OfflineIndicator: 再接続ボタン
    OfflineIndicator->>SW: RETRY_CONNECTION メッセージ
    SW->>Network: 接続テスト
    Network-->>SW: 接続状態確認
    SW-->>OfflineIndicator: 接続状態更新
```

### 5. プッシュ通知システム

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Pet as ペット状態
    participant useNotification as 通知Hook
    participant NotificationAPI as Notification API
    participant SW as Service Worker
    participant PWAProvider as PWAProvider

    PWAProvider->>useNotification: ペット状態監視開始
    Pet->>PWAProvider: 状態変更 (hunger: 25)
    PWAProvider->>useNotification: monitorPetStats()
    
    useNotification->>useNotification: 閾値チェック (threshold: 30)
    
    alt 通知条件満足
        useNotification->>useNotification: 静音時間チェック
        
        alt 静音時間外
            useNotification->>NotificationAPI: 通知許可確認
            
            alt 許可済み
                useNotification->>SW: プッシュ通知要求
                SW->>NotificationAPI: showNotification()
                NotificationAPI-->>User: 通知表示 "ペットがお腹を空かせています"
                
                User->>NotificationAPI: 通知クリック
                NotificationAPI->>SW: notificationclick イベント
                SW->>Browser: clients.openWindow()
                Browser-->>User: アプリを前面表示
            else 未許可
                useNotification->>User: 通知許可要求UI
                User->>useNotification: 許可/拒否
                useNotification->>NotificationAPI: requestPermission()
                NotificationAPI-->>useNotification: 許可状態更新
            end
        else 静音時間内
            useNotification->>useNotification: 通知スキップ
        end
    end
    
    Pet->>PWAProvider: レベルアップ (level: 6)
    PWAProvider->>useNotification: sendLevelUp()
    useNotification->>SW: レベルアップ通知
    SW->>NotificationAPI: showNotification()
    NotificationAPI-->>User: "おめでとう！レベル6になりました！"
```

### 6. アプリ更新プロセス

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant SW as Service Worker  
    participant usePWA as usePWA Hook
    participant UpdateNotification as 更新通知UI
    participant Cache as キャッシュ

    SW->>SW: 新しいバージョン検出
    SW->>usePWA: 更新イベント送信
    usePWA-->>UpdateNotification: hasUpdate: true
    UpdateNotification-->>User: 更新通知表示
    
    alt ユーザーが更新選択
        User->>UpdateNotification: 更新ボタン
        UpdateNotification->>usePWA: updatePWA()
        usePWA->>SW: updateServiceWorker()
        SW->>Cache: 新しいリソースキャッシュ
        Cache-->>SW: キャッシュ更新完了
        SW->>SW: skipWaiting()
        SW->>Browser: clients.claim()
        SW-->>usePWA: 更新完了
        usePWA-->>UpdateNotification: 更新成功
        UpdateNotification-->>User: "更新が完了しました"
        UpdateNotification->>Browser: location.reload()
        Browser-->>User: アプリ再読み込み
    else ユーザーが延期選択
        User->>UpdateNotification: 後で更新
        UpdateNotification->>usePWA: 更新延期
        usePWA-->>UpdateNotification: 通知非表示
    else ユーザーが無視選択
        User->>UpdateNotification: 無視
        UpdateNotification->>usePWA: 更新無視
        usePWA-->>UpdateNotification: 通知永続的非表示
    end
```

## 技術仕様

### キャッシュ戦略

| リソースタイプ | 戦略 | 説明 |
|---------------|------|------|
| 静的アセット | Cache-First | JS, CSS, 画像などはキャッシュ優先 |
| 動的コンテンツ | Network-First | APIレスポンスなどはネットワーク優先 |
| その他 | Stale-While-Revalidate | キャッシュを返しつつバックグラウンドで更新 |

### 通知トリガー条件

| 通知タイプ | デフォルト閾値 | デフォルト間隔 |
|-----------|---------------|---------------|
| 空腹通知 | 30以下 | 30分 |
| エネルギー通知 | 20以下 | 60分 |
| 幸福度通知 | 40以下 | 45分 |
| レベルアップ | 即座 | - |
| 進化 | 即座 | - |

### プラットフォーム対応

| プラットフォーム | インストール方法 | 特別対応 |
|-----------------|-----------------|----------|
| iOS Safari | 手動（ホーム画面に追加） | インストール手順ガイド表示 |
| Android Chrome | 自動（Install Prompt） | ブラウザ標準プロンプト |
| Desktop | 自動（Install Prompt） | ブラウザ標準プロンプト |

## ファイル構成

```
PWA関連ファイル
├── public/
│   ├── manifest.json          # PWA マニフェスト
│   ├── sw.js                  # Service Worker
│   └── icons/                 # アイコンファイル群
├── src/
│   ├── types/PWA.ts           # PWA型定義
│   ├── hooks/
│   │   ├── usePWA.ts          # PWA統合フック
│   │   └── useNotification.ts # 通知管理フック
│   ├── utils/
│   │   ├── pwaUtils.ts        # PWAユーティリティ
│   │   ├── serviceWorker.ts   # Service Worker管理
│   │   └── pushNotification.ts # プッシュ通知処理
│   └── components/
│       ├── PWAProvider.tsx    # PWA統合プロバイダー
│       ├── InstallPrompt.tsx  # インストールプロンプト
│       ├── OfflineIndicator.tsx # オフライン表示
│       ├── UpdateNotification.tsx # 更新通知
│       └── NotificationSettings.tsx # 通知設定
```

## 開発者向け情報

### PWA機能の拡張

新しいPWA機能を追加する場合：

1. `src/types/PWA.ts` に型定義を追加
2. `src/hooks/usePWA.ts` にロジックを実装
3. `src/components/PWAProvider.tsx` でUI統合
4. 必要に応じてService Workerに機能追加

### テスト方法

```bash
# PWA関連テストの実行
npm run test -- PWA
npm run test -- pwa
npm run test -- notification

# 特定コンポーネントのテスト
npm run test -- InstallPrompt
npm run test -- OfflineIndicator
```

### デバッグ情報

ブラウザ開発者ツールでPWA状態を確認：

```javascript
// PWA状態の確認
console.log('Service Worker:', navigator.serviceWorker);
console.log('Installation:', window.deferredPrompt);
console.log('Notification:', Notification.permission);
console.log('Online:', navigator.onLine);
```

## まとめ

本PWA実装により、AI Pet Buddyは：

- **ネイティブアプリ級の体験**を提供
- **完全オフライン対応**で安定動作
- **プラットフォーム最適化**で幅広いデバイス対応
- **インテリジェント通知**でユーザーエンゲージメント向上
- **自動更新機能**で常に最新版を提供

これらの機能により、従来のWebアプリケーションの制約を超えた、真のハイブリッドアプリケーションとして動作します。