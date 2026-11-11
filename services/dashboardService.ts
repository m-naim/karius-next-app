import config from './config'
import http from './http'

export interface DashboardMover {
  symbol: string
  name: string
  dayChangePercent: number | null
  weekChangePercent: number | null
  monthChangePercent: number | null
  contexts: { type: 'PORTFOLIO' | 'WATCHLIST'; id: string; name: string }[]
}

export interface DashboardMovers {
  movers: DashboardMover[]
  trackedCount: number
  incompleteCount: number
}

export function getDashboardMovers(
  options: { signal?: AbortSignal } = {}
): Promise<DashboardMovers> {
  return http.get(`${config.API_URL}/api/v1/dashboard/movers`, options)
}
