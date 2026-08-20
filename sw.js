/* Service worker — the house may have no usable cell signal with 400 people
   in it. Everything a visitor needs is cached on first load. Submissions are
   queued by core.js and retried when signal comes back.                      */
const CACHE = "mf-buildfile-v1";
const SHELL = [
  "index.html", "station.html", "plan.html",
  "assets/css/app.css",
  "assets/js/content.js", "assets/js/pricing.js", "assets/js/core.js", "assets/js/plan.js",
  "assets/img/logo.png",
  "assets/img/home-1.jpg", "assets/img/home-2.jpg", "assets/img/home-3.jpg",
  "assets/img/home-4.jpg", "assets/img/home-5.jpg", "assets/img/home-6.jpg",
  "assets/img/home-7.jpg", "assets/img/home-8.jpg",
  "assets/img/skyridge-2.jpg",
  "assets/img/team/curtis.jpg", "assets/img/team/dave.jpg"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;                       // never cache lead POSTs
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;             // fonts, endpoint: straight to network

  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      const net = fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;                                  // cache-first, refresh behind
    })
  );
});
