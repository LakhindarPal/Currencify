// cache for offline use
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("ccy-v1.0.0").then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/styles.css",
        "/main.js",
        "/icons"
      ]);
    })
  );
});

// Network falling back to cache approach
self.addEventListener("fetch", function(event) {
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});