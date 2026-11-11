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
    } catch {
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

// Open the notification's actual destination, including in an existing app window.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  let target = new URL('/app/alerts', self.location.origin)
  try {
    const requested = new URL(event.notification.data?.url || '/app/alerts', self.location.origin)
    if (requested.origin === self.location.origin &&
        (requested.pathname === '/app' || requested.pathname.startsWith('/app/'))) target = requested
  } catch {
    // Fall back to alerts for malformed notification URLs.
  }

  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true })
    const app = windows.find((client) => {
      const url = new URL(client.url)
      return url.origin === self.location.origin &&
        (url.pathname === '/app' || url.pathname.startsWith('/app/'))
    })
    if (app && 'navigate' in app) {
      const navigated = await app.navigate(target.href)
      if (navigated) return navigated.focus()
    }
    return clients.openWindow(target.href)
  })())
})
