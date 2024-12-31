// service-worker.js
import { precacheAndRoute } from 'workbox-precaching';

// تأكد من أن __WB_MANIFEST يتم تضمينه بشكل صحيح
precacheAndRoute(this.__WB_MANIFEST);


const CACHE_NAME = "app-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/static/css/main.css",
  "/static/js/bundle.js",
  "/static/js/0.chunk.js",
  "/static/js/main.chunk.js",
];

this.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

this.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});

this.addEventListener("activate", (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName); // يجب إرجاع قيمة هنا
            }
            return Promise.resolve(); // إرجاع قيمة فارغة أو resolved promise
          })
        );
      })
    );
  });
  
