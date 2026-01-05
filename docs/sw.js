const CACHE = `striveropensheet`;

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",

  "./styles/main.css",
  "./styles/index.css",
  "./styles/header.css",
  "./styles/settings.css",
  "./styles/topic.css",

  "./scripts/main.js",
  "./scripts/index.js",
  "./scripts/header.js",
  "./scripts/settings.js",
  "./scripts/topic.js",

  "./assets/guest.png",
  "./data/topics.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request);
    })
  );
});
