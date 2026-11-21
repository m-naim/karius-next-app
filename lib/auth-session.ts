export interface SessionUser {
  sub: string
  exp: number
  roles?: string[]
}

export type SessionEndReason = 'expired' | 'rejected' | 'logout' | 'required'
export const SESSION_EVENT = 'boursehorus:session'
export const TOKEN_KEY = 'accessToken'
let pendingEndReason: SessionEndReason | undefined

export function takeSessionEndReason() {
  const reason = pendingEndReason
  pendingEndReason = undefined
  return reason
}

// Decoding only drives the UI. The API remains responsible for signature verification.
export function decodeSession(token: string | null, now = Date.now()): SessionUser | null {
  try {
    if (!token || token.split('.').length !== 3) return null
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(payload), (character) => character.charCodeAt(0))
    const user = JSON.parse(new TextDecoder().decode(bytes))
    if (typeof user.sub !== 'string' || !user.sub || !Number.isFinite(user.exp) || user.exp * 1000 <= now)
      return null
    return user
  } catch {
    return null
  }
}

export function storedToken(): string | null {
  if (typeof window === 'undefined') return null
  try { return window.localStorage.getItem(TOKEN_KEY) } catch { return null }
}

export function clearSession(reason: SessionEndReason = 'logout', expectedToken?: string | null) {
  if (typeof window === 'undefined') return
  // A response from an older request must never disconnect a newly established session.
  if (expectedToken !== undefined && storedToken() !== expectedToken) return
  pendingEndReason = reason
  try {
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem('user')
  } catch {
    // Storage can be disabled; the in-memory session must still be cleared.
  } finally {
    window.dispatchEvent(new CustomEvent(SESSION_EVENT, { detail: { reason } }))
  }
}

export function saveSession(token: string) {
  if (!decodeSession(token)) throw new Error('La session reçue est invalide. Veuillez réessayer.')
  pendingEndReason = undefined
  window.localStorage.setItem(TOKEN_KEY, token)
  window.localStorage.removeItem('user')
  window.dispatchEvent(new CustomEvent(SESSION_EVENT))
}

export function accessToken(): string | null {
  const token = storedToken()
  if (token && !decodeSession(token)) {
    clearSession('expired', token)
    return null
  }
  return token
}
