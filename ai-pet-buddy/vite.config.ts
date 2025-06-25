import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    // Enable React Fast Refresh optimizations
    fastRefresh: true,
  })],
  base: '/my-vibe-coding/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'esnext',
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          vendor: ['react', 'react-dom'],
          // Chart.js library (heavy)
          charts: ['chart.js', 'react-chartjs-2'],
          // Date utilities (if used heavily)
          utils: ['date-fns'],
          // HTML canvas utilities
          canvas: ['html2canvas'],
        },
        // Optimize asset file names for better caching
        assetFileNames: (assetInfo) => {
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
})
