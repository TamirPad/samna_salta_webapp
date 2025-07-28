const CACHE_NAME = 'samna-salta-v2';
const STATIC_CACHE = 'samna-salta-static-v2';
const DYNAMIC_CACHE = 'samna-salta-dynamic-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other unsupported schemes
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'moz-extension:' || 
      url.protocol === 'ms-browser-extension:') {
    return;
  }

  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (url.pathname.startsWith('/static/') || 
      url.pathname.includes('.js') || 
      url.pathname.includes('.css') ||
      url.pathname.includes('.png') ||
      url.pathname.includes('.jpg') ||
      url.pathname.includes('.ico')) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle navigation requests (SPA routes)
  event.respondWith(handleNavigationRequest(request));
});

// Handle API requests - network first, cache fallback
async function handleApiRequest(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      try {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, response.clone());
      } catch (cacheError) {
        console.warn('Failed to cache API response:', cacheError);
      }
    }
    return response;
  } catch (error) {
    console.warn('API request failed, trying cache:', error);
    try {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    } catch (cacheError) {
      console.warn('Cache lookup failed:', cacheError);
    }
    
    // Return a fallback response for API failures
    return new Response(JSON.stringify({ 
      error: 'Network error', 
      message: 'Unable to connect to server' 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle static assets - cache first, network fallback
async function handleStaticRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await fetch(request);
    if (response.ok) {
      try {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, response.clone());
      } catch (cacheError) {
        console.warn('Failed to cache static asset:', cacheError);
      }
    }
    return response;
  } catch (error) {
    console.warn('Static asset fetch failed:', error);
    // Return a fallback response for critical assets
    if (request.url.includes('bundle.js')) {
      return new Response('// Fallback for bundle.js', {
        headers: { 'Content-Type': 'application/javascript' }
      });
    }
    throw error;
  }
}

// Handle navigation requests - network first, cache fallback
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      try {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, response.clone());
      } catch (cacheError) {
        console.warn('Failed to cache navigation response:', cacheError);
      }
    }
    return response;
  } catch (error) {
    console.warn('Navigation request failed, trying cache:', error);
    try {
      const cachedResponse = await caches.match('/index.html');
      if (cachedResponse) {
        return cachedResponse;
      }
    } catch (cacheError) {
      console.warn('Cache lookup failed:', cacheError);
    }
    throw error;
  }
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Handle any pending offline actions
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Samna Salta',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Samna Salta', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
}); 