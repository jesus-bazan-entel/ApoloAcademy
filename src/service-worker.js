import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute } from 'workbox-precaching';

// Precargar recursos críticos
precacheAndRoute(self.__WB_MANIFEST);

// Cache de la página principal
registerRoute(
    ({ request }) => request.mode === 'navigate',
    new NetworkFirst({
        cacheName: 'pages',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60, // 24 horas
            }),
        ],
    })
);

// Cache de recursos estáticos (CSS, JS, imágenes)
registerRoute(
    ({ request }) =>
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'image',
    new StaleWhileRevalidate({
        cacheName: 'static-resources',
    })
);

// Cache de fuentes
registerRoute(
    ({ request }) => request.destination === 'font',
    new CacheFirst({
        cacheName: 'fonts',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
            }),
        ],
    })
);

// Cache de API calls (Supabase)
registerRoute(
    ({ url }) => url.origin.includes('supabase'),
    new StaleWhileRevalidate({
        cacheName: 'api-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 5 * 60, // 5 minutos
            }),
        ],
    })
);

// Cache de imágenes de cursos
registerRoute(
    ({ request }) =>
        request.destination === 'image' &&
        request.url.pathname.includes('/courses/'),
    new CacheFirst({
        cacheName: 'course-images',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 días
            }),
        ],
    })
);

// Manejo de offline
self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            caches.match('/').then((cachedResponse) => {
                return cachedResponse || fetch(event.request);
            })
        );
    }
});

// Notificación de actualización
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
