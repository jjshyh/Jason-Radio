const CACHE_NAME = "jason-radio-shell-v2";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  // 라디오 스트리밍과 외부 요청은 캐시하지 않고, 앱 화면 파일만 오프라인 캐시합니다.
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (request.destination === "audio" || url.pathname.includes("/stream/")) return;
  event.respondWith(fetch(request).then(response => {
    if (response && response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
    }
    return response;
  }).catch(() => caches.match(request).then(cached => cached || caches.match("./index.html"))));
});
