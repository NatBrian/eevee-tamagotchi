// sw.js — Eevee-Tama service worker (M8)
// Shell + code: network-first (stays fresh in dev; offline = last known)
// Assets (images/fonts/audio): cache-first (immutable by name)
const CACHE = 'eevee-tama-v1';
const CORE = [
  './eevee_tama/index.html',
  './eevee_tama/manifest.webmanifest',
  './eevee_tama/style.css',
  './eevee_tama/src/main.js',
  './eevee_tama/src/config.js',
  './eevee_tama/src/state.js',
  './eevee_tama/src/scene.js',
  './eevee_tama/src/pet.js',
  './eevee_tama/src/casino.js',
  './eevee_tama/src/audio.js',
  './eevee_tama/src/save.js',
  './eevee_tama/src/dev.js',
  './eevee_tama/src/prng.js',
  './eevee_tama/icon/icon-192.png',
  './eevee_tama/icon/icon-512.png',
  './eevee_tama/icon/icon-512-maskable.png',
  './prod/font/PressStart2P-Regular.ttf',
  './prod/font/VT323-Regular.ttf',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(CORE))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;

  // app navigations: network-first, fall back to the cached shell
  if (req.mode === 'navigate' && url.pathname.startsWith('/eevee_tama')) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./eevee_tama/index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches.match('./eevee_tama/index.html').then((r) => r || Response.error())
        )
    );
    return;
  }

  const isCode = /\.(js|css|webmanifest)(\?|$)/.test(url.pathname);
  if (isCode) {
    // code: network-first, refresh cache (fresh dev, offline = last known)
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || Response.error()))
    );
    return;
  }

  // assets: cache-first, fill from network
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res && (res.status === 200 || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      });
    })
  );
});
