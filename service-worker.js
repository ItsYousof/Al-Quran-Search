const CACHE_NAME = 'v2-quiz-update-1.2'; 
// List of files to cache
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/styles/style.css',
    '/js/script.js',
    '/pwa.js',
    '/quiz.html',
    '/icons/android-icon-36x36.png',
    '/icons/android-icon-48x48.png',
    '/icons/android-icon-72x72.png',
    '/icons/android-icon-96x96.png',
    '/icons/android-icon-144x144.png',
    '/icons/android-icon-192x192.png',
    '/js/quiz.js',
    '/css/quiz.css'
];

// Install event - caching files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(FILES_TO_CACHE);
            })
            .catch(error => {
                console.error('Failed to cache files on install:', error);
            })
    );
    self.skipWaiting(); // Force the waiting service worker to become the active service worker
});

// Activate event - cleaning up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Immediately control clients with the new service worker
});

// Fetch event - serving cached content
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).catch(error => {
                console.error('Fetch failed:', error);
            });
        })
    );
});
