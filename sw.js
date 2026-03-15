// Health Tracker PWA service worker
const CACHE = 'health-tracker-v1'; // bump to force updates
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './sw.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './version.json' // optional – if you publish one
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(CORE_ASSETS.filter(Boolean)).catch(() => {})
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // SPA fallback for navigations
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }

  // Cache-first for same-origin GET assets
  if (req.method === 'GET' && new URL(req.url).origin === location.origin) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
            return res;
          })
      )
    );
  }
});

// Messaging (matches your index.html logic)
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'GET_VERSION') {
    event.source?.postMessage({ type: 'VERSION', cache: CACHE });
  }
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
