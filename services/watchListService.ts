import config from './config'
import http from './http'

const host = config.API_URL

const watchlistCache = new Map<string, { data: any; timestamp: number }>()
const inFlightWatchlists = new Map<string, Promise<any>>()
const CACHE_TTL_MS = 60 * 1000 // 1 minute

let allWatchlistsCache: { data: any; timestamp: number } | null = null
let inFlightAllWatchlists: Promise<any> | null = null

export async function getAll(forceRefresh = false) {
  if (typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
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
      const data = await http.get(`${host}/api/v1/watchlists/`)
      allWatchlistsCache = { data, timestamp: Date.now() }
      return data
    } finally {
      inFlightAllWatchlists = null
    }
  })()

  return inFlightAllWatchlists
}

export function getAllCached() {
  return allWatchlistsCache?.data || null
}

export async function get(name = 'curent', forceRefresh = false) {
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
      watchlistCache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } finally {
      inFlightWatchlists.delete(cacheKey)
    }
  })()

  inFlightWatchlists.set(cacheKey, promise)
  return promise
}

export function getCached(name: string) {
  const cached = watchlistCache.get(name.toLowerCase())
  return cached ? cached.data : null
}

export function prefetch(name: string) {
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
