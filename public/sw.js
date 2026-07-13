/* VetPath service worker — hardened, self-updating app-shell cache.

   Why this shape: the built HTML lives at stable URLs ("/", "/pathfinder/", …) served with
   Cache-Control: max-age=600, while JS/CSS under /_next/static/ are content-hashed (immutable).
   A plain network-first worker still reads stale HTML from the HTTP cache for up to the TTL
   after a deploy — the HTML then points at old asset hashes, so users saw the previous build
   until a hard refresh. Fixes:
     - HTML / navigations: network-first with the HTTP cache BYPASSED (cache:"no-store"), so a
       fresh deploy is visible on the next load while online; cached shell is the offline fallback.
     - /_next/static/ (hashed, immutable): cache-first — fast, and never stale (new build → new URL).
     - skipWaiting + clients.claim so a new worker takes over at once; the page reloads once on
       controllerchange (see the registration in app/layout.tsx) to pick up the new build.
   Bump VERSION on any change so the activate step purges older caches. */
const VERSION = "v3";
const CACHE = "vetpath-" + VERSION;
const CORE = [
  "/", "/dashboard/", "/pathfinder/", "/benefits/", "/tools/", "/plan/",
  "/relocate/", "/family/", "/updates/", "/timeline/", "/onboarding/", "/goals/",
  "/resume/", "/transcript/", "/network/", "/profile/", "/trust/",
  "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      // cache:"reload" so the precached shell is fetched fresh from the server, not the HTTP cache.
      .then((c) => Promise.allSettled(CORE.map((u) => c.add(new Request(u, { cache: "reload" })))))
      .then(() => self.skipWaiting())
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
  // Media served via Range requests: Cache.put rejects 206s and a stitched reply breaks
  // <video> decoding — let the browser fetch these natively.
  if (req.headers.has("range") || /\.(mp4|webm|mp3|m4a|ogg)$/i.test(url.pathname)) return;

  // Immutable, content-hashed build assets → cache-first (fast; a new build ships new URLs).
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      caches.match(req).then((hit) =>
        hit || fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
      )
    );
    return;
  }

  // HTML pages + everything else → network-first with the HTTP cache bypassed, so deploys show
  // up immediately when online; the cached shell is the offline fallback.
  e.respondWith(
    fetch(req, { cache: "no-store" })
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
