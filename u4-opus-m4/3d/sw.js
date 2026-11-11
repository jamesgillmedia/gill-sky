/* 3d/ only. Narrower scope than m4's sw.js, so it owns this folder: network first, cache as a fallback when offline.
   Bump REV with every save. Video and audio are never stored. */
var REV = '3d-2';
var CACHE = 'shell-' + (new URL('./', self.location).pathname) + '-' + REV;
self.addEventListener('install', function (e) { self.skipWaiting() });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('shell-' + new URL('./', self.location).pathname) === 0 && k !== CACHE }).map(function (k) { return caches.delete(k) })) }).then(function () { return self.clients.claim() }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request; if (req.method !== 'GET') return; var url = new URL(req.url);
  if (url.origin !== self.location.origin || /\.(mp4|webm|m4v|mov|mp3|m4a|ogg|wav|aac)(\?|$)/i.test(url.pathname) || req.headers.get('range')) return;
  e.respondWith(fetch(req).then(function (res) { if (res && res.ok) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, cp) }) } return res })
    .catch(function () { return caches.match(req) }));
});
