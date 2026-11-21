'use client'
import { useEffect, useState } from 'react'
import {
  clearSession, decodeSession, SESSION_EVENT, storedToken, TOKEN_KEY, takeSessionEndReason,
  verifySessionToken, type SessionUser, type SessionEndReason,
} from '@/lib/auth-session'
import config from '@/services/config'

export type User = SessionUser
export type SessionStatus = 'checking' | 'authenticated' | 'anonymous' | 'unavailable'

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null)
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('checking')
  const [sessionEndReason, setSessionEndReason] = useState<SessionEndReason>()

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    let redirecting = false
    let active = true
    let validatedToken: string | null = null
    let validatedAt = 0
    const queryReason = window.location.pathname === '/login'
      ? new URLSearchParams(window.location.search).get('reason') : null
    let initialReason = queryReason && ['expired', 'rejected', 'logout', 'required'].includes(queryReason)
      ? queryReason as SessionEndReason : undefined
    let pendingToken: string | null = null
    let controller: AbortController | undefined

    const synchronize = (event?: Event) => {
      clearTimeout(timer)
      const token = storedToken()
      const currentUser = decodeSession(token)
      if (token && !currentUser) {
        clearSession('expired', token)
        return
      }
      const pendingReason = takeSessionEndReason()
      const reason = (event as CustomEvent<{ reason?: SessionEndReason }>)?.detail?.reason ?? pendingReason ?? initialReason
      initialReason = undefined
      if (!token || !currentUser) {
        controller?.abort()
        pendingToken = null
        validatedToken = null
        setUser(null)
        setSessionStatus('anonymous')
        if (reason) setSessionEndReason(reason)
        if (reason && window.location.pathname.startsWith('/app') && !redirecting) {
          redirecting = true
          const redirect = window.location.pathname + window.location.search + window.location.hash
          window.location.replace(`/login?reason=${reason}&redirect=${encodeURIComponent(redirect)}`)
        }
        return
      }

      setSessionEndReason(undefined)
      if (validatedToken === token && Date.now() - validatedAt < 60_000) {
        setUser(currentUser)
        setSessionStatus('authenticated')
      } else if (pendingToken !== token) {
        controller?.abort()
        controller = new AbortController()
        const validationController = controller
        pendingToken = token
        setUser(null)
        setSessionStatus('checking')
        const timeout = setTimeout(() => validationController.abort(), 8_000)
        verifySessionToken(token, `${config.API_URL.replace(/\/$/, '')}/api/v1/profile/`, validationController.signal)
          .then((result) => {
            if (!active || storedToken() !== token || controller !== validationController) return
            pendingToken = null
            if (result === 'rejected') {
              clearSession('rejected', token)
            } else if (result === 'valid') {
              validatedToken = token
              validatedAt = Date.now()
              synchronize()
            } else {
              setUser(null)
              setSessionStatus('unavailable')
            }
          })
          .finally(() => clearTimeout(timeout))
      }
      timer = setTimeout(synchronize, Math.max(1, Math.min(currentUser.exp * 1000 - Date.now(), 60_000)))
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
      active = false
      controller?.abort()
      clearTimeout(timer)
      window.removeEventListener(SESSION_EVENT, synchronize)
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', synchronize)
      document.removeEventListener('visibilitychange', synchronize)
    }
  }, [])

  return {
    user, sessionStatus, sessionEndReason,
    retrySession: () => window.dispatchEvent(new CustomEvent(SESSION_EVENT)),
    addUser: setUser, removeUser: () => clearSession(), setUser,
  }
}
