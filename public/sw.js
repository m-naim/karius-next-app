self.addEventListener('install', () => {
  console.log('[PWA SW] Service Worker installed')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[PWA SW] Service Worker activated')
  event.waitUntil(self.clients.claim())
})

// Web Push Event Handler (Native Smartphone Notifications)
self.addEventListener('push', (event) => {
  console.log('[PWA SW] Push Notification event received')
  let data = {
    title: '📊 Bourse Horus - Alerte Prix',
    body: 'Une alerte s`est déclenchée sur votre compte.',
    url: '/app/alerts',
    icon: '/static/favicons/android-icon-192x192.png',
  }

  if (event.data) {
    try {
      const json = event.data.json()
      data = { ...data, ...json }
    } catch (e) {
      data.body = event.data.text()
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: '/static/favicons/favicon-32x32.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url,
    },
    actions: [
      { action: 'open', title: 'Ouvrir L`Alerte' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification Click Handler (opens or focuses app on /app/alerts)
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/app/alerts'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i]
        if (client.url.includes('/app') && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
