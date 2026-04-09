import config from './config'
import http from './http'

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
        if (typeof window !== 'undefined') localStorage.setItem('accessToken', response.accessToken)
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
        if (typeof window !== 'undefined') localStorage.setItem('accessToken', response.accessToken)
      }
      return response
    })
}
const logOut = () => {
  if (typeof window !== 'undefined') localStorage.removeItem('accessToken')
}

const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    let token = localStorage.getItem('accessToken')

    if (token != null && token.length > 2) {
      const decodedJwt = JSON.parse(atob(token.split('.')[1]))
      if (decodedJwt.exp * 1000 < Date.now()) {
        authService.logOut()
      }
      return {
        authentificated: true,
        user: decodedJwt,
      }
    }
  }
  return {
    authentificated: false,
  }
}

const getProfile = () => {
  return http.get(`${host}/api/v1/profile/`)
}

const updateProfile = (data: {
  name: string
  telegramChatId: string
  notificationsEnabled: boolean
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
}

export default authService
