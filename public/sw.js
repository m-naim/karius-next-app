self.addEventListener('install', () => {
  console.log('Service Worker installed')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated')
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  // A minimum fetch handler is required by some browsers to trigger the PWA install prompt.
  // We simply bypass the service worker for all requests.
  return
})
