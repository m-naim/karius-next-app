'use client'

import { useContext, useEffect } from 'react'
import { useUser, User } from './useUser'
import { useLocalStorage } from './useLocalStorage'
import { AuthContext } from './authContext'

export const useAuth = () => {
  // we can re export the user methods or object from this hook

  const { getItem } = useLocalStorage()

  const { user, addUser, removeUser } = useContext(AuthContext)

  useEffect(() => {
    const userItem = getItem('user')
    if (userItem) {
      const user = JSON.parse(userItem)
      console.log(user)

      if (user.exp * 1000 < Date.now()) {
        logout()
      } else {
        console.log(' useEffect add user', user)
        addUser(user)
      }
    }
  }, [])

  const login = (token: String) => {
    if (token != null && token.length > 2) {
      console.log('login')
      const decodedJwt: User = JSON.parse(atob(token.split('.')[1]))
      addUser(decodedJwt)
    }
  }

  const logout = () => {
    removeUser()
  }

  return { user, login, logout }
}
