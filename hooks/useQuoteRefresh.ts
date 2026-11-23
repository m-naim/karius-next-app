'use client'

import { useEffect, useRef } from 'react'

const QUOTE_REFRESH_INTERVAL_MS = 60_000

export function useQuoteRefresh(
  refresh: (signal: AbortSignal) => Promise<void>,
  scope: string,
  enabled = true
) {
  const latestRefresh = useRef(refresh)
  useEffect(() => {
    latestRefresh.current = refresh
  }, [refresh])

  useEffect(() => {
    if (!enabled) return

    const controller = new AbortController()
    let refreshing = false
    let lastStartedAt = 0
    const revalidate = async () => {
      if (document.visibilityState !== 'visible' || refreshing || Date.now() - lastStartedAt < 5000) return
      refreshing = true
      lastStartedAt = Date.now()
      try {
        await latestRefresh.current(controller.signal)
      } catch (error) {
        if (!controller.signal.aborted) console.warn('Échec du rafraîchissement des cotations', error)
      } finally {
        refreshing = false
      }
    }

    const timer = window.setInterval(revalidate, QUOTE_REFRESH_INTERVAL_MS)
    document.addEventListener('visibilitychange', revalidate)
    window.addEventListener('focus', revalidate)
    return () => {
      controller.abort()
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', revalidate)
      window.removeEventListener('focus', revalidate)
    }
  }, [enabled, scope])
}
