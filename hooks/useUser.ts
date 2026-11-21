'use client'
import { useEffect, useState } from 'react'
import {
  clearSession, decodeSession, SESSION_EVENT, storedToken, TOKEN_KEY, takeSessionEndReason,
  type SessionUser, type SessionEndReason,
} from '@/lib/auth-session'

export type User = SessionUser

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    let redirecting = false
    const synchronize = (event?: Event) => {
      clearTimeout(timer)
      const token = storedToken()
      const currentUser = decodeSession(token)
      setUser(currentUser)
      if (token && !currentUser) {
        clearSession('expired', token)
        return
      }
      const pendingReason = takeSessionEndReason()
      const reason = (event as CustomEvent<{ reason?: SessionEndReason }>)?.detail?.reason ?? pendingReason
      if (!currentUser && reason && window.location.pathname.startsWith('/app') && !redirecting) {
        redirecting = true
        const redirect = window.location.pathname + window.location.search + window.location.hash
        window.location.replace(`/login?reason=${reason}&redirect=${encodeURIComponent(redirect)}`)
      }
      if (currentUser) {
        // Reschedule long sessions rather than overflowing the browser's signed 32-bit timer.
        timer = setTimeout(synchronize, Math.min(currentUser.exp * 1000 - Date.now(), 2_147_483_647))
      }
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === TOKEN_KEY || event.key === null) {
        synchronize(new CustomEvent(SESSION_EVENT, { detail: { reason: 'logout' } }))
      }
    }
    window.addEventListener(SESSION_EVENT, synchronize)
    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', synchronize)
    document.addEventListener('visibilitychange', synchronize)
    synchronize()
    return () => {
      clearTimeout(timer)
      window.removeEventListener(SESSION_EVENT, synchronize)
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', synchronize)
      document.removeEventListener('visibilitychange', synchronize)
    }
  }, [])

  return { user, addUser: setUser, removeUser: () => clearSession(), setUser }
}
