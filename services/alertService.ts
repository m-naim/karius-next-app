import config from './config'
import http from './http'

const host = config.API_URL

const syncCurrentBrowserSubscription = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Les notifications Push ne sont pas disponibles dans ce navigateur.')
  }

  const registration = await navigator.serviceWorker.register('/sw.js')
  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    throw new Error('Aucun abonnement navigateur actif sur cet appareil. Activez d’abord les notifications.')
  }

  await http.post(`${host}/api/v1/alerts/browser/subscription`, subscription.toJSON())
  return subscription
}

export const alertService = {
  getMyAlerts: () => http.get(`${host}/api/v1/alerts/`),
  createAlert: (data: { symbol: string; type: string; operator: string; value: number }) =>
    http.post(`${host}/api/v1/alerts/`, data),
  deleteAlert: (id: string) => http.deleteReq(`${host}/api/v1/alerts/${id}`),
  restartAlert: (id: string) => http.post(`${host}/api/v1/alerts/${id}/restart`, {}),
  updateTelegram: (chatId: string) => http.post(`${host}/api/v1/alerts/telegram`, { chatId }),
  getTelegramActivationLink: () => http.get(`${host}/api/v1/alerts/telegram/activation-link`),
  updateNtfy: (topic: string) => http.post(`${host}/api/v1/alerts/ntfy`, { topic }),
  getNotificationSettings: () => http.get(`${host}/api/v1/alerts/settings`),
  updateNotificationChannel: (channel: 'telegram' | 'ntfy' | 'browser') =>
    http.put(`${host}/api/v1/alerts/settings/channel`, { channel }),
  getBrowserConfig: () => http.get(`${host}/api/v1/alerts/browser/config`),
  saveBrowserSubscription: (subscription: PushSubscriptionJSON) =>
    http.post(`${host}/api/v1/alerts/browser/subscription`, subscription),
  syncCurrentBrowserSubscription,
  removeBrowserSubscription: (endpoint?: string) =>
    endpoint
      ? http.deleteReq(`${host}/api/v1/alerts/browser/subscription?endpoint=${encodeURIComponent(endpoint)}`)
      : http.deleteReq(`${host}/api/v1/alerts/browser/subscription`),
  testBrowserNotification: () => http.post(`${host}/api/v1/alerts/browser/test`, {}),
  testLastNotification: () => http.post(`${host}/api/v1/alerts/test-last`, {}),
  testLastBatchNotification: () => http.post(`${host}/api/v1/alerts/test-batch`, {}),
  trackEvent: (event: string, channel: 'telegram' | 'ntfy' | 'browser' = 'telegram', metadata: Record<string, string> = {}) =>
    http.post(`${host}/api/v1/alerts/events`, { event, channel, metadata }),
}

export default alertService
