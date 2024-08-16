import config from './config'
import http from './http'

const host = config.API_URL

const register = (username, email, password) => {
  return http
    .post(`${host}/auth/register`, {
      displayName: username,
      email,
      password,
      passwordCheck: password,
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

const authService = {
  register,
  login,
  logOut,
  getCurrentUser,
}

export default authService
