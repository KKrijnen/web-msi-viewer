const CACHE_NAME = "web-msi-viewer-v3";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.webmanifest"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        CORE_ASSETS.map(asset =>
          cache.add(new Request(asset, { cache: "reload" })).catch(() => undefined)
        )
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./", cloned).catch(() => {}));
          return response;
        })
        .catch(() => caches.match(request).then(res => res || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        return cached;
      }
      return fetch(request).then(response => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, cloned).catch(() => {});
        });
        return response;
      }).catch(() => cached);
    })
  );
});
