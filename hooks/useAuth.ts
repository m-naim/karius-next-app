'use client'

import { useContext } from 'react'
import { AuthContext } from './authContext'
import { clearSession, saveSession } from '@/lib/auth-session'

export const useAuth = () => {
  const { user } = useContext(AuthContext)
  return { user, login: saveSession, logout: () => clearSession() }
}
