self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('static-cache').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles/style.css',
        '/js/script.js',
        '/pwa.js',
        '/icons/android-icon-36x36.png',
        '/icons/android-icon-48x48.png',
        '/icons/android-icon-72x72.png',
        '/icons/android-icon-96x96.png',
        '/icons/android-icon-144x144.png',
        '/icons/android-icon-192x192.png'
      ]).catch(error => {
        console.error('Failed to cache files on install:', error);
      });
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(error => {
        console.error('Fetch failed:', error);
      });
    })
  );
});
