import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// PWA Service Worker登録
import { registerServiceWorker } from './utils/serviceWorker'

// Service Workerを登録
if (import.meta.env.PROD) {
  // 本番環境でのみService Workerを登録
  registerServiceWorker()
    .then(state => {
      console.log('[PWA] Service Worker registration state:', state);
    })
    .catch(error => {
      console.error('[PWA] Service Worker registration failed:', error);
    });
} else {
  console.log('[PWA] Service Worker registration skipped in development mode');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
