import config from './config'
import http from './http'
import { clearSession, decodeSession, storedToken, saveSession } from '@/lib/auth-session'

const host = config.API_URL

const register = (username, email, password) => {
  return http
    .post(`${host}/auth/register`, {
      name: username,
      email,
      password,
    })
    .then((response) => {
      if (response) {
        saveSession(response.accessToken)
      }
      return response
    })
}

const login = (email, password) => {
  return http
    .post(`${host}/auth/login`, {
      email,
      password,
    })
    .then((response) => {
      if (response) {
        saveSession(response.accessToken)
      }
      return response
    })
}
const logOut = () => clearSession()

const getCurrentUser = () => {
  const user = decodeSession(storedToken())
  return user ? { authentificated: true, user } : { authentificated: false }
}

const getProfile = () => {
  return http.get(`${host}/api/v1/profile/`)
}

const updateProfile = (data: {
  name?: string
  telegramChatId?: string
  notificationsEnabled?: boolean
  portfolioNotifFreq?: string
  watchlistNotifFreq?: string
  notificationChannel?: string
}) => {
  return http.post(`${host}/api/v1/profile/update`, data)
}

const changePassword = (data: { oldPassword: string; newPassword: string }) => {
  return http.post(`${host}/api/v1/profile/change-password`, data)
}

const deleteAccount = () => {
  return http.deleteReq(`${host}/api/v1/profile/delete-account`)
}

const testNotification = (chatId: string) => {
  return http.post(`${host}/api/v1/profile/test-notification`, chatId)
}

const getDisabledEntities = () => {
  return http.get(`${host}/api/v1/profile/preferences/disabled-entities`)
}

const updateDisabledEntities = (data: string[]) => {
  return http.post(`${host}/api/v1/profile/preferences/disabled-entities`, data)
}

const authService = {
  register,
  login,
  logOut,
  getCurrentUser,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  testNotification,
  getDisabledEntities,
  updateDisabledEntities,
}

export default authService
