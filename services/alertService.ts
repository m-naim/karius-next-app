import config from './config'
import http from './http'

const host = config.API_URL

export const alertService = {
  getMyAlerts: () => http.get(`${host}/api/v1/alerts/`),
  createAlert: (data: { symbol: string; type: string; operator: string; value: number }) =>
    http.post(`${host}/api/v1/alerts/`, data),
  deleteAlert: (id: string) => http.deleteReq(`${host}/api/v1/alerts/${id}`),
  restartAlert: (id: string) => http.post(`${host}/api/v1/alerts/${id}/restart`, {}),
  updateTelegram: (chatId: string) => http.post(`${host}/api/v1/alerts/telegram`, { chatId }),
  updateNtfy: (topic: string) => http.post(`${host}/api/v1/alerts/ntfy`, { topic }),
  getNotificationSettings: () => http.get(`${host}/api/v1/alerts/settings`),
  updateNotificationChannel: (channel: 'telegram' | 'ntfy') => 
    http.put(`${host}/api/v1/alerts/settings/channel`, { channel }),
  testLastNotification: () => http.post(`${host}/api/v1/alerts/test-last`, {}),
  testLastBatchNotification: () => http.post(`${host}/api/v1/alerts/test-batch`, {}),
}

export default alertService
