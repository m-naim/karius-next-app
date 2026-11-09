import config from './config'
import http from './http'

export type EarningsScope = 'all' | 'portfolio' | 'watchlist'

export interface EarningsContext {
  type: 'PORTFOLIO' | 'WATCHLIST'
  id: string
  name: string
}

export interface EarningsCalendarEvent {
  symbol: string
  name: string
  date: string
  time: 'BMO' | 'AMC' | 'UNKNOWN' | string
  estimated: boolean
  source: 'FMP' | 'YAHOO_FINANCE' | string
  epsEstimated?: number | null
  epsActual?: number | null
  revenueEstimated?: number | null
  revenueActual?: number | null
  fetchedAt: string
  contexts: EarningsContext[]
}

export function getEarningsCalendar(
  from: string,
  to: string,
  scope: EarningsScope = 'all',
  options: { signal?: AbortSignal } = {}
): Promise<EarningsCalendarEvent[]> {
  const params = new URLSearchParams({ from, to, scope })
  return http.get(
    `${config.API_URL}/api/v1/earnings-calendar?${params}`,
    options
  )
}
