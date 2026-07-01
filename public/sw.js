const CACHE_NAME = 'monaguillos-react-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './icon-192.png',
  './icon-512.png'
];

// Solo cacheamos peticiones GET del mismo origen
const isCacheableRequest = (request) => {
  return request.method === 'GET' && request.url.startsWith(self.location.origin);
};

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache).catch(err => {
          console.error('Error en cache inicial:', err);
          return Promise.allSettled(
            urlsToCache.map(url => cache.add(url).catch(e => console.warn(`No se pudo cachear ${url}`, e)))
          );
        });
      })
  );
});

self.addEventListener('fetch', event => {
  if (!isCacheableRequest(event.request)) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Estrategia Stale-While-Revalidate: servir de caché si está, pero actualizar en background
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(error => {
          console.warn('Fetch falló, usando caché:', error);
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
