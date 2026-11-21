'use client'
import { createContext } from 'react'
import { User, SessionStatus } from './useUser'
import type { SessionEndReason } from '@/lib/auth-session'

interface AuthContext {
  user: User | null
  sessionStatus: SessionStatus
  sessionEndReason?: SessionEndReason
  retrySession: () => void
  addUser: (user: User | null) => void
  removeUser: () => void
}

export const AuthContext = createContext<AuthContext>({
  user: null,
  sessionStatus: 'checking',
  retrySession: () => {},
  addUser: () => {
    console.debug('add user hello')
  },
  removeUser: () => {
    console.debug('remove user hello')
  },
})
