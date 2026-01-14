import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh optimizations
      fastRefresh: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
      includeAssets: ['icons/*.png', 'robots.txt', 'sitemap.xml'],
      manifest: {
        name: 'AI Pet Buddy',
        short_name: 'Pet Buddy',
        description:
          '可愛いペットと一緒に遊ぼう！AI Pet Buddyは、バーチャルペットを育成・カスタマイズして楽しむWebアプリケーションです。',
        theme_color: '#FF6B6B',
        background_color: '#FFFFFF',
        display: 'standalone',
        scope: '/my-vibe-coding/',
        start_url: '/my-vibe-coding/',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  base: '/my-vibe-coding/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'esnext',
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: id => {
          // Core React libraries
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor';
          }
          // Chart.js library (heavy)
          if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
            return 'charts';
          }
          // HTML canvas utilities (used only for sharing)
          if (id.includes('html2canvas')) {
            return 'canvas';
          }
          // Date utilities
          if (id.includes('date-fns')) {
            return 'utils';
          }
          // Group game components together
          if (id.includes('/games/')) {
            return 'games';
          }
          // Achievement related components
          if (id.includes('/achievements/')) {
            return 'achievements';
          }
          // Default: Let Vite handle automatic chunking for other modules
          return undefined;
        },
        // Optimize asset file names for better caching
        assetFileNames: assetInfo => {
          const info = assetInfo.name?.split('.') || [];
          const extType = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType || '')) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    // Improve build performance
    reportCompressedSize: false,
    // Enable advanced optimizations
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'chart.js', 'react-chartjs-2'],
    exclude: ['html2canvas'], // Let this be bundled separately if needed
  },
  // Performance optimizations for development
  server: {
    hmr: {
      overlay: false,
    },
  },
});
