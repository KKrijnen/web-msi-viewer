const CACHE_NAME = "web-msi-viewer-v0.3.0";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.webmanifest",
  "./pwa_icons/icon192x192.png",
  "./pwa_icons/icon512x512.png"
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

  const isNavigation = request.mode === "navigate";
  const url = new URL(request.url);

  // Let the browser handle cross-origin requests without caching.
  if (!isNavigation && url.origin !== self.location.origin) {
    return;
  }

  const cacheKey = isNavigation ? new Request("./") : request;

  event.respondWith((async () => {
    try {
      const response = await fetch(request, { cache: "no-store" });
      const cache = await caches.open(CACHE_NAME);
      cache.put(cacheKey, response.clone()).catch(() => {});
      return response;
    } catch (err) {
      const cached = await caches.match(cacheKey);
      if (cached) {
        return cached;
      }
      if (isNavigation) {
        const fallback = await caches.match("./index.html");
        if (fallback) {
          return fallback;
        }
      }
      throw err;
    }
  })());
});
