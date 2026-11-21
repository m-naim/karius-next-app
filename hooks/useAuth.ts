'use client'

import { useContext } from 'react'
import { AuthContext } from './authContext'
import { clearSession, saveSession } from '@/lib/auth-session'

export const useAuth = () => {
  const { user, sessionStatus, sessionEndReason, retrySession } = useContext(AuthContext)
  return { user, sessionStatus, sessionEndReason, retrySession, login: saveSession, logout: () => clearSession() }
}
