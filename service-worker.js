// 本音日誌 — Service Worker
// バージョンを上げると古いキャッシュが自動で更新されます
const CACHE = 'honne-nikki-v1';

const ASSETS = [
  './honne_nikki.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;500;600&family=Zen+Kaku+Gothic+New:wght@300;400;500&display=swap'
];

// インストール時：全アセットをキャッシュ
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// アクティベート時：古いキャッシュを削除
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// フェッチ時：キャッシュ優先、なければネット
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(res => {
        // ネットから取得できたらキャッシュにも保存
        if (res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
