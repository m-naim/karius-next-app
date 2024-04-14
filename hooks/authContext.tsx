'use client'
import { createContext } from 'react'
import { User } from './useUser'

interface AuthContext {
  user: User | null
  addUser: (user: User | null) => void
  removeUser: () => void
}

export const AuthContext = createContext<AuthContext>({
  user: null,
  addUser: () => {
    console.log('hello')
  },
  removeUser: () => {
    console.log('hello')
  },
})
