self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('pdf-fill-sign-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/service-worker.js',
        '/icon-192.png',
        '/icon-512.png',
        '/styles.css',
        '/app.js'
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
