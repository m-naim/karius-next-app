'use client'

/**
 * Lightweight Persistent & In-Memory SWR Cache for Market Dashboard
 * Enables 0ms instantaneous rendering on page load & tab switching.
 */

const OVERVIEW_STORAGE_KEY = 'bh_market_overview_v1'
const TOPFLOP_STORAGE_PREFIX = 'bh_market_tf_'
const HISTORY_STORAGE_PREFIX = 'bh_market_hist_'

export function getStoredMarketOverview(): {
  quotes: Record<string, any>
  variations: Record<string, Record<string, number>>
} | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(OVERVIEW_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Accept cache if less than 5 minutes old
    if (parsed && parsed.timestamp && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
      return parsed.data
    }
  } catch {
    // Ignore storage parse errors
  }
  return null
}

export function saveStoredMarketOverview(
  quotes: Record<string, any>,
  variations: Record<string, Record<string, number>>
) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(
      OVERVIEW_STORAGE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data: { quotes, variations },
      })
    )
  } catch {
    // Ignore storage quota errors
  }
}

export function getStoredTopFlop(symbol: string, period: string) {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(`${TOPFLOP_STORAGE_PREFIX}${symbol.toUpperCase()}_${period}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && parsed.timestamp && Date.now() - parsed.timestamp < 10 * 60 * 1000) {
      return parsed.data
    }
  } catch {
    // Ignore storage errors
  }
  return null
}

export function saveStoredTopFlop(symbol: string, period: string, data: any) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(
      `${TOPFLOP_STORAGE_PREFIX}${symbol.toUpperCase()}_${period}`,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      })
    )
  } catch {
    // Ignore quota errors
  }
}

export function getStoredHistory(symbol: string, period: string) {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(`${HISTORY_STORAGE_PREFIX}${symbol.toUpperCase()}_${period}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && parsed.timestamp && Date.now() - parsed.timestamp < 10 * 60 * 1000) {
      return parsed.data
    }
  } catch {
    // Ignore storage errors
  }
  return null
}

export function saveStoredHistory(symbol: string, period: string, data: any[]) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(
      `${HISTORY_STORAGE_PREFIX}${symbol.toUpperCase()}_${period}`,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      })
    )
  } catch {
    // Ignore quota errors
  }
}
