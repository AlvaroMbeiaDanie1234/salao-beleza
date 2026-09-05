const CACHE_NAME = 'sgs-salons-v1'
const urlsToCache = [
  '/',
  '/manifest.json',
  '/assets/videos/WhatsApp%20Video%202026-09-04%20at%2018.21.28.mp4',
  '/assets/hero/WhatsApp%20Image%202026-09-04%20at%2018.21.29.jpeg',
  '/assets/hero/WhatsApp%20Image%202026-09-04%20at%2018.21.30.jpeg',
  '/assets/hero/WhatsApp%20Image%202026-09-04%20at%2018.21.32.jpeg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }
      return fetch(event.request).catch(() => {
        return caches.match('/')
      })
    })
  )
})
