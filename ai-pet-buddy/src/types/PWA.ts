/**
 * @file PWA.ts
 * @description PWA関連の型定義
 * 
 * Progressive Web App機能に関連する型定義を提供します。
 * Service Worker、プッシュ通知、インストールプロンプトなどの型が含まれます。
 */

// =============================================================================
// Service Worker 関連の型
// =============================================================================

export interface ServiceWorkerRegistrationState {
  /** Service Workerが登録されているか */
  isRegistered: boolean;
  /** Service Workerが制御中か */
  isControlling: boolean;
  /** 更新可能なService Workerがあるか */
  hasUpdate: boolean;
  /** 登録エラー */
  error: string | null;
}

export interface ServiceWorkerUpdateInfo {
  /** 現在のバージョン */
  currentVersion: string;
  /** 新しいバージョン */
  newVersion: string;
  /** 更新サイズ（概算KB） */
  updateSize: number;
  /** 更新内容の説明 */
  description: string;
}

// =============================================================================
// インストールプロンプト関連の型
// =============================================================================

export interface InstallPromptState {
  /** インストール可能か */
  canInstall: boolean;
  /** インストール済みか */
  isInstalled: boolean;
  /** インストールプロンプトが表示中か */
  isPromptShowing: boolean;
  /** プラットフォーム */
  platform: 'ios' | 'android' | 'desktop';
  /** インストールプロンプトイベント */
  deferredPrompt: BeforeInstallPromptEvent | null;
}

export interface InstallPromptEvent extends Event {
  /** インストールプロンプトを表示 */
  prompt(): Promise<void>;
  /** ユーザーの選択を取得 */
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

// BeforeInstallPromptEventの型定義（TypeScriptで標準提供されていない場合）
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
  
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{
      outcome: 'accepted' | 'dismissed';
      platform: string;
    }>;
  }
}

// =============================================================================
// プッシュ通知関連の型
// =============================================================================

export interface NotificationPermissionState {
  /** 通知許可状態 */
  permission: NotificationPermission;
  /** プッシュ通知が利用可能か */
  isSupported: boolean;
  /** Service Workerによる通知が利用可能か */
  isServiceWorkerSupported: boolean;
  /** 最後に許可を求めた時刻 */
  lastRequested?: Date;
}

export interface PetNotificationConfig {
  /** 通知が有効か */
  enabled: boolean;
  /** 空腹通知 */
  hunger: {
    enabled: boolean;
    threshold: number; // 0-100
    interval: number; // 分
  };
  /** エネルギー通知 */
  energy: {
    enabled: boolean;
    threshold: number; // 0-100
    interval: number; // 分
  };
  /** 幸福度通知 */
  happiness: {
    enabled: boolean;
    threshold: number; // 0-100
    interval: number; // 分
  };
  /** レベルアップ通知 */
  levelUp: {
    enabled: boolean;
  };
  /** 進化通知 */
  evolution: {
    enabled: boolean;
  };
  /** 静音時間 */
  quietHours: {
    enabled: boolean;
    start: string; // "HH:MM"
    end: string; // "HH:MM"
  };
}

export interface NotificationData {
  /** 通知タイトル */
  title: string;
  /** 通知本文 */
  body: string;
  /** アイコンURL */
  icon?: string;
  /** バッジURL */
  badge?: string;
  /** 通知タグ（重複防止） */
  tag?: string;
  /** バイブレーションパターン */
  vibrate?: number[];
  /** 通知データ */
  data?: Record<string, unknown>;
  /** アクションボタン */
  actions?: NotificationAction[];
}

export interface NotificationAction {
  /** アクション識別子 */
  action: string;
  /** ボタンテキスト */
  title: string;
  /** アイコンURL */
  icon?: string;
}

// =============================================================================
// オフライン機能関連の型
// =============================================================================

export interface OfflineState {
  /** オフライン状態か */
  isOffline: boolean;
  /** 最後にオンラインだった時刻 */
  lastOnline: Date | null;
  /** オフライン継続時間（ミリ秒） */
  offlineDuration: number;
  /** 同期待ちのデータがあるか */
  hasPendingSync: boolean;
}

export interface CacheStatus {
  /** キャッシュサイズ（KB） */
  size: number;
  /** キャッシュされたリソース数 */
  resourceCount: number;
  /** 最後の更新時刻 */
  lastUpdated: Date;
  /** キャッシュの種類別情報 */
  caches: {
    static: CacheInfo;
    dynamic: CacheInfo;
    data: CacheInfo;
  };
}

export interface CacheInfo {
  /** キャッシュ名 */
  name: string;
  /** サイズ（KB） */
  size: number;
  /** リソース数 */
  count: number;
}

// =============================================================================
// PWA統合状態の型
// =============================================================================

export interface PWAState {
  /** Service Worker状態 */
  serviceWorker: ServiceWorkerRegistrationState;
  /** インストール状態 */
  install: InstallPromptState;
  /** 通知状態 */
  notification: NotificationPermissionState;
  /** オフライン状態 */
  offline: OfflineState;
  /** キャッシュ状態 */
  cache: CacheStatus;
  /** PWA機能が利用可能か */
  isSupported: boolean;
  /** PWAが有効に動作しているか */
  isActive: boolean;
}

// =============================================================================
// PWAイベント関連の型
// =============================================================================

export type PWAEventType = 
  | 'sw-registered'
  | 'sw-updated'
  | 'sw-error'
  | 'install-available'
  | 'install-completed'
  | 'install-failed'
  | 'notification-granted'
  | 'notification-denied'
  | 'offline'
  | 'online'
  | 'cache-updated';

export interface PWAEvent {
  /** イベントタイプ */
  type: PWAEventType;
  /** イベントデータ */
  data?: Record<string, unknown>;
  /** イベント発生時刻 */
  timestamp: Date;
}

// =============================================================================
// PWA設定関連の型
// =============================================================================

export interface PWAConfig {
  /** Service Worker設定 */
  serviceWorker: {
    /** Service Workerを有効にするか */
    enabled: boolean;
    /** 更新チェック間隔（ミリ秒） */
    updateCheckInterval: number;
    /** キャッシュ有効期限（ミリ秒） */
    cacheExpiry: number;
  };
  /** 通知設定 */
  notifications: PetNotificationConfig;
  /** インストール設定 */
  install: {
    /** インストールプロンプトを表示するか */
    showPrompt: boolean;
    /** プロンプト表示の遅延（ミリ秒） */
    promptDelay: number;
    /** 1日に表示する最大回数 */
    maxPromptsPerDay: number;
  };
  /** オフライン設定 */
  offline: {
    /** オフライン表示を有効にするか */
    showIndicator: boolean;
    /** 自動同期を有効にするか */
    autoSync: boolean;
  };
}

// =============================================================================
// ユーティリティ型
// =============================================================================

export type PWACapabilities = {
  /** Service Workerサポート */
  serviceWorker: boolean;
  /** プッシュ通知サポート */
  pushNotifications: boolean;
  /** インストールプロンプトサポート */
  installPrompt: boolean;
  /** バックグラウンド同期サポート */
  backgroundSync: boolean;
  /** Web Share APIサポート */
  webShare: boolean;
};

export type PWAMetrics = {
  /** インストール率 */
  installationRate: number;
  /** 通知許可率 */
  notificationPermissionRate: number;
  /** オフライン使用率 */
  offlineUsageRate: number;
  /** キャッシュヒット率 */
  cacheHitRate: number;
};

// =============================================================================
// エクスポート用のデフォルト設定
// =============================================================================

export const DEFAULT_PWA_CONFIG: PWAConfig = {
  serviceWorker: {
    enabled: true,
    updateCheckInterval: 60000, // 1分
    cacheExpiry: 86400000, // 24時間
  },
  notifications: {
    enabled: false, // ユーザーが手動で有効化
    hunger: {
      enabled: true,
      threshold: 30,
      interval: 30, // 30分
    },
    energy: {
      enabled: true,
      threshold: 20,
      interval: 60, // 1時間
    },
    happiness: {
      enabled: true,
      threshold: 40,
      interval: 45, // 45分
    },
    levelUp: {
      enabled: true,
    },
    evolution: {
      enabled: true,
    },
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
    },
  },
  install: {
    showPrompt: true,
    promptDelay: 5000, // 5秒
    maxPromptsPerDay: 3,
  },
  offline: {
    showIndicator: true,
    autoSync: true,
  },
};