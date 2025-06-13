# 🚀 Issue #6: デプロイ・本番対応

## 📋 基本情報
- **Priority**: High
- **Labels**: `deployment`, `production`, `devops`, `Phase4`
- **Milestone**: Phase 4 - Production Ready
- **Assignee**: GitHub Copilot Coding Agent
- **Estimated Time**: 2-3日

## 📝 Description
AI Pet Buddyを本番環境にデプロイし、エンドユーザーが安定してアクセスできる状態を実現する。パフォーマンス最適化、SEO対応、監視体制の構築を含む包括的な本番対応を行う。

## 🎯 Acceptance Criteria

### 🌐 デプロイメント・ホスティング
- [ ] **Vercel デプロイ設定**
  - Vercel CLI セットアップ
  - 本番・プレビュー環境の構築
  - カスタムドメイン設定（オプション）
  - 自動デプロイパイプライン構築

- [ ] **GitHub Pagesデプロイ（代替）**
  - GitHub Actions ワークフロー構築
  - gh-pages ブランチ自動更新
  - カスタムドメイン対応
  - HTTPS強制設定

- [ ] **Netlify デプロイ（代替）**
  - ビルド設定最適化
  - フォーム処理・関数設定
  - リダイレクト・リワード設定
  - 環境変数管理

### ⚡ パフォーマンス最適化
- [ ] **Lighthouse スコア最適化**
  - Performance: 90+
  - Accessibility: 95+
  - Best Practices: 95+
  - SEO: 95+

- [ ] **バンドルサイズ最適化**
  - 初期バンドルサイズ: 500KB以下
  - 遅延読み込み最適化
  - Tree Shaking適用
  - 不要ライブラリ除去

- [ ] **画像・アセット最適化**
  - WebP形式画像使用
  - 画像遅延読み込み
  - アイコンSVG化
  - キャッシュ戦略最適化

- [ ] **レンダリング最適化**
  - Virtual DOM最適化
  - メモ化適切適用
  - 不要な再レンダリング防止
  - バンドル分割戦略

### 🔍 SEO・メタデータ対応
- [ ] **基本SEO設定**
  - タイトル・ディスクリプション最適化
  - Open Graph メタタグ
  - Twitter Card対応
  - JSON-LD構造化データ

- [ ] **サイトマップ・robots.txt**
  - XMLサイトマップ生成
  - robots.txt作成
  - meta robots適切設定
  - canonical URL設定

- [ ] **多言語対応準備**
  - hreflang属性設定
  - 言語切り替え基盤
  - 文字列外部化
  - i18n準備

### 🛡️ セキュリティ・プライバシー
- [ ] **セキュリティヘッダー**
  - Content Security Policy
  - X-Frame-Options
  - X-Content-Type-Options
  - Referrer-Policy

- [ ] **プライバシー対応**
  - Cookie使用ポリシー
  - データ保護方針
  - GDPR準拠準備
  - 利用規約・プライバシーポリシー

- [ ] **データ保護**
  - ローカルストレージ暗号化
  - 機密データ処理方針
  - セキュリティ監査
  - 脆弱性スキャン

### 📊 監視・分析・エラー追跡
- [ ] **Google Analytics 4設定**
  - 基本トラッキング設定
  - イベント追跡設定
  - コンバージョン設定
  - ユーザー行動分析

- [ ] **エラー追跡システム**
  - Sentry統合（推奨）
  - エラーレポート自動化
  - パフォーマンス監視
  - アラート設定

- [ ] **アップタイム監視**
  - 死活監視設定
  - パフォーマンス監視
  - アラート通知設定
  - ダッシュボード構築

### 🔄 CI/CD・自動化
- [ ] **GitHub Actions ワークフロー**
  - テスト自動実行
  - ビルド自動化
  - デプロイ自動化
  - 品質チェック自動化

- [ ] **品質ゲート設定**
  - テストカバレッジ閾値
  - Lighthouse スコア閾値
  - ESLint/Prettier チェック
  - TypeScript型チェック

- [ ] **環境管理**
  - 開発・ステージング・本番環境
  - 環境変数管理
  - シークレット管理
  - 設定ファイル分離

## 🛠️ Technical Requirements

### 📦 追加ライブラリ・ツール
```json
{
  "devDependencies": {
    "@sentry/vite-plugin": "^2.14.0",
    "vite-plugin-pwa": "^0.17.0",
    "workbox-precaching": "^7.0.0",
    "web-vitals": "^3.5.0",
    "lighthouse": "^11.4.0"
  },
  "dependencies": {
    "@sentry/react": "^7.99.0",
    "gtag": "^1.0.1"
  }
}
```

### ⚙️ ビルド設定最適化
```typescript
// vite.config.ts optimizations
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['chart.js', 'react-chartjs-2']
        }
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true
      }
    })
  ]
});
```

### 🌐 Vercel設定ファイル
```json
// vercel.json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## 📁 File Structure
```
ai-pet-buddy/
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI/CDワークフロー
│       ├── deploy.yml          # デプロイワークフロー
│       └── lighthouse.yml      # Lighthouse監査
├── public/
│   ├── robots.txt              # SEO crawler指示
│   ├── sitemap.xml             # サイトマップ
│   ├── manifest.json           # PWAマニフェスト
│   └── _headers                # Netlifyヘッダー設定
├── src/
│   ├── config/
│   │   ├── analytics.ts        # GA4設定
│   │   ├── sentry.ts           # エラー追跡設定
│   │   └── environment.ts      # 環境設定
│   ├── utils/
│   │   ├── performance.ts      # パフォーマンス監視
│   │   ├── seo.ts              # SEOユーティリティ
│   │   └── errorBoundary.ts    # エラー境界
│   └── components/
│       ├── ErrorBoundary.tsx   # エラー境界コンポーネント
│       ├── LoadingSpinner.tsx  # ローディング表示
│       └── PrivacyBanner.tsx   # プライバシー通知
├── netlify.toml               # Netlify設定
├── vercel.json                # Vercel設定
├── lighthouse.config.js       # Lighthouse設定
└── deployment-docs/
    ├── DEPLOYMENT.md          # デプロイ手順書
    ├── MONITORING.md          # 監視設定手順
    └── TROUBLESHOOTING.md     # トラブルシューティング
```

## 🚀 Deployment Platforms

### 🎯 推奨: Vercel
**メリット**:
- React/Vite最適化
- 自動スケーリング
- エッジ配信
- プレビューデプロイ

**設定手順**:
1. Vercel CLI インストール
2. プロジェクト接続
3. 環境変数設定
4. カスタムドメイン設定

### 🔄 代替: GitHub Pages
**メリット**:
- 完全無料
- GitHub統合
- 自動デプロイ
- 簡単設定

**制限事項**:
- 静的サイトのみ
- カスタムヘッダー制限
- 帯域制限あり

### ⚡ 代替: Netlify
**メリット**:
- フォーム処理
- 関数サポート
- プラグインエコシステム
- 高度なリダイレクト

## 📊 監視・分析設定

### 📈 Google Analytics 4設定
```typescript
// analytics.ts
import { gtag } from 'gtag';

export const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

export const initGA = () => {
  gtag('config', GA_MEASUREMENT_ID, {
    page_title: 'AI Pet Buddy',
    page_location: window.location.href
  });
};

export const trackEvent = (action: string, category: string, label?: string) => {
  gtag('event', action, {
    event_category: category,
    event_label: label
  });
};
```

### 🔍 Sentry エラー追跡
```typescript
// sentry.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing()
  ]
});
```

## 🧪 Testing Strategy

### 🎯 本番テスト要件
- **E2E Tests**: Playwright使用
- **Performance Tests**: Lighthouse CI
- **Security Tests**: OWASP ZAP
- **Load Tests**: Artillery.js

### 📋 テストケース
```typescript
// e2e/production.spec.ts
test('本番環境基本動作確認', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/AI Pet Buddy/);
  
  // PWA機能確認
  const serviceWorker = await page.evaluate(() => 
    'serviceWorker' in navigator
  );
  expect(serviceWorker).toBeTruthy();
  
  // パフォーマンス確認
  const metrics = await page.evaluate(() => 
    performance.getEntriesByType('navigation')[0]
  );
  expect(metrics.loadEventEnd).toBeLessThan(3000);
});
```

## 🔧 Implementation Steps

### Phase 1: 基盤設定 (Day 1)
1. **デプロイ環境選択・設定**
   - Vercel/Netlify/GitHub Pages選択
   - アカウント設定・プロジェクト接続

2. **ビルド設定最適化**
   - Vite設定チューニング
   - バンドル分割設定

### Phase 2: パフォーマンス最適化 (Day 2)
3. **Lighthouse スコア改善**
   - 各項目90+達成
   - 自動監査設定

4. **SEO・メタデータ設定**
   - 基本SEO設定
   - 構造化データ追加

### Phase 3: 監視・分析設定 (Day 2-3)
5. **分析ツール統合**
   - Google Analytics設定
   - Sentry統合

6. **CI/CD構築**
   - GitHub Actions設定
   - 自動デプロイパイプライン

### Phase 4: セキュリティ・最終調整 (Day 3)
7. **セキュリティ強化**
   - セキュリティヘッダー設定
   - 脆弱性スキャン

8. **本番リリース**
   - 最終テスト実行
   - 本番デプロイ実行

## 📋 Definition of Done
- [ ] 本番環境にデプロイ完了
- [ ] Lighthouse全項目90+達成
- [ ] SEO基本設定完了
- [ ] 監視・分析システム稼働
- [ ] CI/CD パイプライン構築完了
- [ ] セキュリティ設定完了
- [ ] エラー追跡システム稼働
- [ ] パフォーマンス監視稼働
- [ ] 全E2Eテスト成功
- [ ] 本番動作確認完了

## 🎯 Performance Targets

### 📊 Lighthouse スコア目標
- **Performance**: 90+ (目標: 95+)
- **Accessibility**: 95+ (目標: 100)
- **Best Practices**: 95+ (目標: 100)
- **SEO**: 95+ (目標: 100)

### ⚡ Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### 📦 バンドルサイズ目標
- **Initial Bundle**: < 500KB
- **Total Size**: < 2MB
- **Critical CSS**: < 50KB
- **Images**: WebP < 100KB each

## 🔗 関連Issue・依存関係
- **依存**: Issue #1-5完了後に実行
- **関連**: 全てのPhase 4 Issues
- **後続**: なし（最終フェーズ）

## 📚 参考資料
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Performance Auditing](https://developers.google.com/web/tools/lighthouse)
- [React Performance Best Practices](https://react.dev/learn/render-and-commit)

---

## 💡 実装ヒント

### 🚀 Vercel最適化設定
```typescript
// next.config.js (if using Next.js) or vite.config.ts
export default {
  images: {
    formats: ['image/webp', 'image/avif']
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false
};
```

### 📊 Core Web Vitals監視
```typescript
// performance.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals';

function getConnectionSpeed() {
  return 'connection' in navigator &&
    navigator.connection &&
    'effectiveType' in navigator.connection
    ? navigator.connection.effectiveType
    : '';
}

function sendToAnalytics(metric: any, options: any) {
  const body = {
    dsn: options.analyticsId,
    id: metric.id,
    page: window.location.pathname,
    href: window.location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed()
  };

  if (options.debug) {
    console.log('[Web Vitals]', metric.name, JSON.stringify(body, null, 2));
  }

  const blob = new Blob([new URLSearchParams(body).toString()], {
    type: 'application/x-www-form-urlencoded'
  });
  
  if (navigator.sendBeacon) {
    navigator.sendBeacon(vitalsUrl, blob);
  } else {
    fetch(vitalsUrl, {
      body: blob,
      method: 'POST',
      credentials: 'omit',
      keepalive: true
    });
  }
}

export function webVitals(options: any) {
  try {
    getFID((metric) => sendToAnalytics(metric, options));
    getTTFB((metric) => sendToAnalytics(metric, options));
    getLCP((metric) => sendToAnalytics(metric, options));
    getCLS((metric) => sendToAnalytics(metric, options));
    getFCP((metric) => sendToAnalytics(metric, options));
  } catch (err) {
    console.error('[Web Vitals]', err);
  }
}
```

### 🛡️ セキュリティヘッダー設定
```javascript
// _headers (Netlify) or vercel.json
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; object-src 'none';
```

---

**重要注意事項**:
- 本番デプロイ前に全てのセキュリティチェックを実行
- パフォーマンス目標未達成の場合は他Issueに遡って最適化
- 監視システムの正常動作を必ず確認
- バックアップ・復旧手順を事前に準備
