import { getLocalStorageItem } from '@/lib/utils'
import config from './config'
import http from './http'

const host = config.API_URL

const register = (username, email, password) => {
  return http.post(`${host}/register`, {
    displayName: username,
    email,
    password,
    passwordCheck: password,
  })
}
const login = (email, password) => {
  return http
    .post(`${host}/login`, {
      email,
      password,
    })
    .then((response) => {
      console.log(response)
      if (response) {
        if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(response))
      }
      return response
    })
}
const logout = () => {
  if (typeof window !== 'undefined') localStorage.removeItem('user')
}

const getCurrentUser = () => {
  if (typeof window !== 'undefined') return JSON.parse(getLocalStorageItem('user'))
  return
}

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
}

export default authService
