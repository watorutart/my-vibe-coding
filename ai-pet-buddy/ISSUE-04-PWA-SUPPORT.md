# 📱 Issue #4: PWA対応実装

## 📋 Issue情報
- **Priority**: Medium
- **Labels**: `enhancement`, `pwa`, `performance`, `Phase4`, `mobile`
- **Milestone**: Phase 4-B (Week 2)
- **Assignee**: GitHub Copilot Coding Agent
- **Estimated Time**: 2-3日

---

## 📝 Description
Progressive Web App（PWA）対応を実装し、モバイルでのユーザー体験を大幅に向上させる。オフライン対応、プッシュ通知、ホーム画面追加機能を実装し、ネイティブアプリのような体験を提供する。

## 🎯 Acceptance Criteria

### ✅ Service Worker実装
- [ ] **キャッシュ戦略設定**
  - アプリシェルのキャッシュ
  - 静的リソース（CSS/JS/画像）のキャッシュ
  - API レスポンスのキャッシュ
  - キャッシュ更新戦略（stale-while-revalidate）

- [ ] **オフライン対応**
  - ネットワーク切断時の基本動作保証
  - オフライン時専用UI表示
  - ローカルデータでの継続プレイ
  - 再接続時のデータ同期

- [ ] **自動更新機能**
  - 新バージョン検出
  - バックグラウンド更新
  - ユーザーへの更新通知
  - スムーズな更新体験

### ✅ マニフェストファイル
- [ ] **アプリ情報設定**
  - アプリ名・説明文の設定
  - テーマカラー・背景色設定
  - 表示モード（standalone）設定
  - 起動URL・スコープ設定

- [ ] **アイコン準備**
  - 192x192px アイコン
  - 512x512px アイコン
  - Apple Touch Icon（180x180px）
  - Favicon（32x32px、16x16px）
  - マスカブルアイコン対応

- [ ] **ホーム画面追加**
  - インストールプロンプト表示
  - iOS Safari 対応
  - Android Chrome 対応
  - カスタムインストール誘導

### ✅ プッシュ通知
- [ ] **通知許可システム**
  - 適切なタイミングでの許可要求
  - 通知の価値を説明するUI
  - 許可・拒否状態の管理
  - 設定変更機能

- [ ] **ペット状態通知**
  - 空腹度低下時の通知
  - エネルギー不足時の通知
  - 幸福度低下時の通知
  - カスタマイズ可能な通知間隔

- [ ] **イベント通知**
  - 進化達成通知
  - レベルアップ通知
  - 新しいゲーム解放通知
  - 特別イベント通知

## 🛠️ Technical Requirements

### 📦 実装ファイル構成
```
public/
├── manifest.json                     # PWAマニフェスト
├── sw.js                            # Service Worker
└── icons/                           # アプリアイコン群
    ├── icon-192x192.png
    ├── icon-512x512.png
    ├── apple-touch-icon.png
    ├── favicon-32x32.png
    ├── favicon-16x16.png
    └── maskable-icon.png

src/
├── utils/
│   ├── serviceWorker.ts             # SW登録・管理
│   ├── serviceWorker.test.ts
│   ├── pushNotification.ts          # プッシュ通知
│   ├── pushNotification.test.ts
│   ├── pwaUtils.ts                  # PWAユーティリティ
│   └── pwaUtils.test.ts
├── hooks/
│   ├── usePWA.ts                    # PWA状態管理
│   ├── usePWA.test.ts
│   ├── useNotification.ts           # 通知管理
│   └── useNotification.test.ts
└── components/
    ├── InstallPrompt.tsx            # インストール誘導
    ├── InstallPrompt.test.tsx
    ├── InstallPrompt.css
    ├── NotificationSettings.tsx     # 通知設定
    ├── NotificationSettings.test.tsx
    ├── OfflineIndicator.tsx         # オフライン表示
    └── UpdateNotification.tsx       # 更新通知
```

### 🔧 PWA設定要件
```json
// manifest.json
{
  "name": "AI Pet Buddy",
  "short_name": "Pet Buddy",
  "description": "可愛いペットと一緒に遊ぼう！",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#FF6B6B",
  "background_color": "#FFFFFF",
  "orientation": "portrait-primary",
  "icons": [...]
}
```

### 📊 品質基準
- **Lighthouse PWAスコア**: 90以上
- **オフライン機能**: 完全動作
- **テストカバレッジ**: 85%以上
- **TypeScript**: 100%型安全

## 🔧 Service Worker実装仕様

### 📂 キャッシュ戦略
```typescript
// sw.js のキャッシュ戦略
const CACHE_NAMES = {
  static: 'ai-pet-buddy-static-v1',
  dynamic: 'ai-pet-buddy-dynamic-v1',
  data: 'ai-pet-buddy-data-v1'
};

// キャッシュするリソース
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/static/media/pet-sprites.png',
  // 必要な静的リソース
];

// キャッシュファースト戦略（静的リソース）
const cacheFirst = async (request: Request): Promise<Response> => {
  const cachedResponse = await caches.match(request);
  return cachedResponse || fetch(request);
};

// ネットワークファースト戦略（動的データ）
const networkFirst = async (request: Request): Promise<Response> => {
  try {
    const networkResponse = await fetch(request);
    // キャッシュに保存
    return networkResponse;
  } catch {
    return await caches.match(request);
  }
};
```

### 🔔 プッシュ通知実装
```typescript
// pushNotification.ts
export class PushNotificationManager {
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async schedulePetNotification(petStats: PetStats): Promise<void> {
    if (petStats.hunger < 30) {
      await this.sendNotification({
        title: 'ペットがお腹を空かせています！',
        body: 'ご飯をあげて、元気にしてあげましょう 🍖',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge.png',
        tag: 'pet-hunger'
      });
    }
  }
}
```

## 📱 モバイル最適化

### 🎨 レスポンシブデザイン強化
```css
/* PWA向けビューポート調整 */
.pwa-container {
  /* iOS Safe Area対応 */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  
  /* フルスクリーン対応 */
  height: 100vh;
  height: 100dvh; /* Dynamic Viewport Height */
}

/* インストールプロンプト */
.install-prompt {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
  border-radius: 12px;
  padding: 16px;
  color: white;
  z-index: 1000;
}
```

### 📲 プラットフォーム対応
```typescript
// iOS/Android 判定
export const detectPlatform = (): 'ios' | 'android' | 'desktop' => {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
};

// PWAインストール可能性判定
export const canInstallPWA = (): boolean => {
  return 'serviceWorker' in navigator && 
         'BeforeInstallPromptEvent' in window;
};
```

## 🔄 既存システムとの統合

### 📦 依存関係
- `dataStorage.ts` - オフラインデータ管理
- `usePetProgress.ts` - 通知タイミング判定
- `App.tsx` - PWA状態表示
- 全コンポーネント - オフライン対応

### 🔗 統合ポイント
- `main.tsx`でService Worker登録
- `App.tsx`に接続状態表示
- `ActionButtons.tsx`にインストールボタン
- 全ゲームのオフライン対応

## ✅ Definition of Done

### 🧪 テスト要件
- [ ] 全テストが成功（緑）
- [ ] Service Worker正常動作
- [ ] オフライン機能確認
- [ ] 通知機能確認

### 📱 PWA要件
- [ ] Lighthouse PWAスコア 90+
- [ ] ホーム画面追加可能
- [ ] オフライン動作確認
- [ ] プッシュ通知動作確認

### 🌐 ブラウザ対応
- [ ] Chrome（Android）
- [ ] Safari（iOS）
- [ ] Edge
- [ ] Firefox

## 🚀 実装手順

### Step 1: マニフェスト・アイコン準備
1. `manifest.json`作成
2. 各サイズのアイコン準備
3. meta tag設定

### Step 2: Service Worker実装
1. `sw.js`作成
2. キャッシュ戦略実装
3. オフライン対応

### Step 3: PWA Hook実装
1. `usePWA.ts`作成
2. `useNotification.ts`作成
3. インストール検出

### Step 4: UI実装
1. インストールプロンプト作成
2. オフライン表示作成
3. 通知設定パネル作成

### Step 5: 統合・テスト
1. `main.tsx`への統合
2. 全機能のオフライン確認
3. 通知テスト

## 🔧 アイコン生成要件

### 📐 必要なアイコンサイズ
```bash
# 生成するアイコン一覧
icon-16x16.png       # Favicon
icon-32x32.png       # Favicon
icon-180x180.png     # Apple Touch Icon
icon-192x192.png     # Android Icon
icon-512x512.png     # Android Icon (大)
maskable-icon.png    # Maskable Icon
```

### 🎨 アイコンデザイン
- **ペットキャラクター中心**
- **ブランドカラー使用**
- **シンプルで認識しやすい**
- **マスカブル対応**

## 📊 パフォーマンス目標

### ⚡ 速度目標
- **初回読み込み**: 2秒以内
- **キャッシュ済み読み込み**: 1秒以内
- **オフライン起動**: 0.5秒以内

### 📈 Lighthouse スコア目標
- **Performance**: 90+
- **PWA**: 90+
- **Accessibility**: 90+
- **SEO**: 90+

## 📚 参考資料
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://web.dev/add-manifest/)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)

## 🎊 実装完了後のアクション
1. プルリクエスト作成
2. Lighthouse スコア確認
3. 各デバイスでの動作確認
4. ストアレビュー準備

---

**📱 PWA対応の実装準備完了！GitHub Copilot Coding Agentによる実装をお願いします！**
