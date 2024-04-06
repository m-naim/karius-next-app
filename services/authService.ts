import { getLocalStorageItem } from '@/lib/utils'
import config from './config'
import http from './http'

const host = config.API_URL

const register = (username, email, password) => {
  return http.post(`${host}/auth/register`, {
    displayName: username,
    email,
    password,
    passwordCheck: password,
  })
}

const login = (email, password) => {
  return http
    .post(`${host}/auth/login`, {
      email,
      password,
    })
    .then((response) => {
      console.log(response)
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
  if (typeof window !== 'undefined') return getLocalStorageItem('accessToken')
  return
}

const authService = {
  register,
  login,
  logOut,
  getCurrentUser,
}

export default authService
