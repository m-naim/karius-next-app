import config from './config'
import http from './http'
import { accessToken, decodeSession, storedToken } from '@/lib/auth-session'

const host = config.API_URL
type RequestOptions = { signal?: AbortSignal }

const watchlistCache = new Map<string, { data: any; timestamp: number }>()
const inFlightWatchlists = new Map<string, Promise<any>>()
const CACHE_TTL_MS = 60 * 1000 // 1 minute

let allWatchlistsCache: { data: any; timestamp: number } | null = null
let inFlightAllWatchlists: Promise<any> | null = null

let cacheSession: string | null = null
function ensureSessionCache() {
  const token = storedToken()
  const currentSession = decodeSession(token) ? token : null
  if (cacheSession !== currentSession) {
    cacheSession = currentSession
    watchlistCache.clear()
    inFlightWatchlists.clear()
    allWatchlistsCache = null
    inFlightAllWatchlists = null
  }
  return currentSession
}

export async function getAll(forceRefresh = false, options: RequestOptions = {}) {
  const token = accessToken()
  const session = ensureSessionCache()
  if (!token) {
    return []
  }

  if (!forceRefresh && allWatchlistsCache && Date.now() - allWatchlistsCache.timestamp < CACHE_TTL_MS) {
    return allWatchlistsCache.data
  }

  if (inFlightAllWatchlists) {
    return inFlightAllWatchlists
  }

  inFlightAllWatchlists = (async () => {
    try {
      const data = await http.get(`${host}/api/v1/watchlists/`, options)
      if (storedToken() === session) allWatchlistsCache = { data, timestamp: Date.now() }
      return data
    } finally {
      if (storedToken() === session) inFlightAllWatchlists = null
    }
  })()

  return inFlightAllWatchlists
}

export function getAllCached() {
  ensureSessionCache()
  return allWatchlistsCache?.data || null
}

export async function get(name = 'curent', forceRefresh = false) {
  const session = ensureSessionCache()
  const cacheKey = name.toLowerCase()
  const cached = watchlistCache.get(cacheKey)

  if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  if (inFlightWatchlists.has(cacheKey)) {
    return inFlightWatchlists.get(cacheKey)!
  }

  const promise = (async () => {
    try {
      const data = await http.get(`${host}/api/v1/watchlists/${name}`)
      if (storedToken() === session) watchlistCache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } finally {
      if (storedToken() === session) inFlightWatchlists.delete(cacheKey)
    }
  })()

  inFlightWatchlists.set(cacheKey, promise)
  return promise
}

export function getCached(name: string) {
  ensureSessionCache()
  const cached = watchlistCache.get(name.toLowerCase())
  return cached ? cached.data : null
}

export function prefetch(name: string) {
  ensureSessionCache()
  const cacheKey = name.toLowerCase()
  const cached = watchlistCache.get(cacheKey)
  if (!cached || Date.now() - cached.timestamp >= CACHE_TTL_MS) {
    get(name).catch(() => {})
  }
}

export function invalidateCache(name?: string) {
  if (name) {
    watchlistCache.delete(name.toLowerCase())
  } else {
    watchlistCache.clear()
  }
  allWatchlistsCache = null
}

export function getPublic() {
  return http.get(`${host}/api/v1/watchlists/public`)
}

export function add(payload: any) {
  const body = {
    name: payload.name,
    isPublic: payload.visibility,
  }
  invalidateCache()
  return http.post(`${host}/api/v1/watchlists/`, body)
}

export function addStock(id: string, payload: any) {
  invalidateCache(id)
  return http.put(`${host}/api/v1/watchlists/${id}`, payload)
}

export function updateList(id: string, payload: any) {
  invalidateCache(id)
  return http.put(`${host}/api/v1/watchlists/${id}`, payload)
}

export function removeStock(id: string, symbol: string) {
  invalidateCache(id)
  return http.deleteReq(`${host}/api/v1/watchlists/${id}/security/${symbol}`)
}

export function removeList(id: string) {
  invalidateCache(id)
  return http.deleteReq(`${host}/api/v1/watchlists/${id}`)
}

const watchListService = {
  getAll,
  getAllCached,
  get,
  getCached,
  prefetch,
  invalidateCache,
  getPublic,
  add,
  addStock,
  updateList,
  removeStock,
  removeList,
}

export default watchListService
