/**
 * File         : docs/sw.js
 * Description  : Service Worker for offline caching
 */

const CACHE_NAME = "strivers-opensheet";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./topic.html",
  "./settings.html",

  "./styles/main.css",
  "./styles/index.css",
  "./styles/topic.css",
  "./styles/settings.css",

  "./scripts/main.js",
  "./scripts/index.js",
  "./scripts/topic.js",
  "./scripts/header.js",
  "./scripts/settings.js",

  "./data/topics.json",
];

/* ---------- Install ---------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

/* ---------- Activate ---------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
});

/* ---------- Fetch ---------- */
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((res) => {
          // cache topic JSON dynamically
          if (event.request.url.includes("/data/topics/")) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy);
            });
          }
          return res;
        })
      );
    })
  );
});
