'use client'

import { useContext, useEffect } from 'react'
import { User } from './useUser'
import { useLocalStorage } from './useLocalStorage'
import { AuthContext } from './authContext'

export const useAuth = () => {
  const { getItem, removeItem } = useLocalStorage()

  const { user, addUser, removeUser } = useContext(AuthContext)

  useEffect(() => {
    const userItem = getItem('user')

    if (userItem) {
      const user = JSON.parse(userItem)

      if (user.exp * 1000 < Date.now()) {
        logout()
      } else {
        addUser(user)
      }
    } else {
      logout()
    }
  }, [])

  const login = (token: String) => {
    if (token != null && token.length > 2) {
      const decodedJwt: User = JSON.parse(atob(token.split('.')[1]))
      addUser(decodedJwt)
    }
  }

  const logout = () => {
    removeUser()
    removeItem('accessToken')
    removeItem('user')
  }

  return { user, login, logout }
}
