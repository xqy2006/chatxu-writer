const cacheName = 'my-app-cache';
const filesToCache = [
  '/',
  '/model_1.bin',
  '/model_2.bin',
  '/tokenizer.bin'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('缓存文件');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});