'use client'
import { useState } from 'react'
import { useLocalStorage } from './useLocalStorage'

export interface User {
  sub: string
  exp: number
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null)
  const { setItem } = useLocalStorage()

  const addUser = (user: User) => {
    setUser(user)
    setItem('user', JSON.stringify(user))
  }

  const removeUser = () => {
    setUser(null)
    setItem('user', '')
  }

  return { user, addUser, removeUser, setUser }
}
