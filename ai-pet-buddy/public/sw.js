// AI Pet Buddy Service Worker
// Progressive Web App functionality for offline support and caching

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAMES = {
  static: `ai-pet-buddy-static-${CACHE_VERSION}`,
  dynamic: `ai-pet-buddy-dynamic-${CACHE_VERSION}`,
  data: `ai-pet-buddy-data-${CACHE_VERSION}`
};

// Static resources to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css',
  // Vite assets will be added dynamically
];

// Dynamic cache patterns
const DYNAMIC_CACHE_PATTERNS = [
  /\/assets\//,
  /\.js$/,
  /\.css$/,
  /\.png$/,
  /\.jpg$/,
  /\.svg$/,
  /\.woff2?$/
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then((cache) => {
        console.log('[SW] Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS.filter(url => url !== '/'));
      })
      .then(() => {
        console.log('[SW] Static resources cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return !Object.values(CACHE_NAMES).includes(cacheName);
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

/**
 * Main fetch handler with different strategies
 */
async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Cache-first for static assets
    if (shouldCacheFirst(request)) {
      return await cacheFirst(request);
    }
    
    // Strategy 2: Network-first for API calls and dynamic content
    if (shouldNetworkFirst(request)) {
      return await networkFirst(request);
    }
    
    // Strategy 3: Stale-while-revalidate for other resources
    return await staleWhileRevalidate(request);
    
  } catch (error) {
    console.error('[SW] Fetch error:', error);
    return await handleFetchError(request);
  }
}

/**
 * Cache-first strategy for static resources
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  const cache = await caches.open(CACHE_NAMES.static);
  cache.put(request, networkResponse.clone());
  return networkResponse;
}

/**
 * Network-first strategy for dynamic content
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAMES.dynamic);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

/**
 * Stale-while-revalidate strategy
 */
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(CACHE_NAMES.dynamic);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  });
  
  return cachedResponse || fetchPromise;
}

/**
 * Handle fetch errors - return offline page or cached content
 */
async function handleFetchError(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Return offline indicator for navigation requests
  if (request.mode === 'navigate') {
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>オフライン - AI Pet Buddy</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              text-align: center; 
              padding: 50px;
              background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
              color: white;
              margin: 0;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            .offline-icon { font-size: 64px; margin-bottom: 20px; }
            h1 { margin: 20px 0; }
            p { margin: 10px 0; }
            button {
              background: rgba(255,255,255,0.2);
              border: 2px solid white;
              color: white;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="offline-icon">🐾</div>
          <h1>オフラインです</h1>
          <p>インターネット接続を確認してください</p>
          <p>ペットは待っています！</p>
          <button onclick="location.reload()">再接続を試す</button>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  return new Response('Network error', { status: 503 });
}

/**
 * Determine if request should use cache-first strategy
 */
function shouldCacheFirst(request) {
  const url = new URL(request.url);
  
  // Static assets
  if (DYNAMIC_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    return true;
  }
  
  // Manifest and service worker
  if (url.pathname.includes('manifest.json') || url.pathname.includes('sw.js')) {
    return true;
  }
  
  return false;
}

/**
 * Determine if request should use network-first strategy
 */
function shouldNetworkFirst(request) {
  const url = new URL(request.url);
  
  // API calls (if any in the future)
  if (url.pathname.startsWith('/api/')) {
    return true;
  }
  
  // Dynamic content
  if (url.search.includes('timestamp') || url.search.includes('random')) {
    return true;
  }
  
  return false;
}

// Background sync (for future implementation)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'pet-data-sync') {
    event.waitUntil(syncPetData());
  }
});

/**
 * Sync pet data when connection is restored
 */
async function syncPetData() {
  try {
    console.log('[SW] Syncing pet data...');
    // Future implementation: sync local pet data with server
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Failed to sync pet data:', error);
    throw error;
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'ペットがあなたを待っています！',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'ペットに会いに行く',
        icon: '/icons/shortcut-play.png'
      },
      {
        action: 'close',
        title: '閉じる'
      }
    ]
  };
  
  const title = event.data ? event.data.text() : 'AI Pet Buddy';
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise open new window
      if (clients.openWindow) {
        const url = event.action === 'explore' ? '/?action=play' : '/';
        return clients.openWindow(url);
      }
    })
  );
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

console.log('[SW] Service Worker loaded successfully');