/* VetPath service worker — app-shell caching for installed/offline use.
   Network-first for pages (fresh content when online), cache fallback offline. */
const CACHE = "vetpath-v2";
const CORE = [
  "/", "/dashboard/", "/pathfinder/", "/benefits/", "/tools/", "/plan/",
  "/relocate/", "/family/", "/updates/", "/onboarding/", "/goals/",
  "/resume/", "/transcript/", "/network/", "/profile/",
  "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => Promise.allSettled(CORE.map((u) => c.add(u)))).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  // Video/audio stream via Range requests; Cache.put rejects partial (206)
  // responses and a cache-stitched reply breaks <video> decoding. Let the
  // browser fetch media natively.
  if (req.headers.has("range") || /\.(mp4|webm|mp3|m4a)$/i.test(url.pathname)) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => hit || (req.mode === "navigate" ? caches.match("/") : undefined))
      )
  );
});
