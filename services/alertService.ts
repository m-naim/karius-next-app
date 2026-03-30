import config from './config'
import http from './http'

const host = config.API_URL

export const alertService = {
  getMyAlerts: () => http.get(`${host}/api/v1/alerts/`),
  createAlert: (data: { symbol: string; type: string; operator: string; value: number }) =>
    http.post(`${host}/api/v1/alerts/`, data),
  deleteAlert: (id: string) => http.deleteReq(`${host}/api/v1/alerts/${id}`),
  updateTelegram: (chatId: string) => http.post(`${host}/api/v1/alerts/telegram`, { chatId }),
}

export default alertService
