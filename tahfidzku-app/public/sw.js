// Service Worker for TahfidzKu PWA
// Versi manual untuk kompatibilitas TanStack Start (SSR)

const CACHE_NAME = 'tahfidzku-v1'
const STATIC_ASSETS = [
  '/manifest.webmanifest',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-512x512-maskable.png',
  '/favicon.ico',
]

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  // Activate immediately, don't wait for old SW to die
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  // Take control of all clients immediately
  self.clients.claim()
})

// Fetch: Network First untuk navigasi, cache for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Jangan cache request ke server functions / API
  if (
    url.pathname.startsWith('/_server') ||
    url.pathname.startsWith('/api') ||
    url.search.includes('_data=')
  ) {
    return // Biarkan browser handle langsung (NetworkOnly)
  }

  // Navigasi: Network First (agar selalu dapat halaman terbaru dari server)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response
        })
        .catch(() => {
          // Jika offline, kembalikan response yang di-cache jika ada
          return caches.match(request)
        })
    )
    return
  }

  // Asset statis (JS, CSS, gambar): Cache First
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
      })
    )
    return
  }
})
