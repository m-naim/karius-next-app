import http from './http'
import config from './config'

const host = config.API_URL
const qwantHost = config.QWANTAPI_URL

export function update(id: string) {
  return http.get(`${qwantHost}/api/v1/update/stocks/${id}/`)
}

export function getAll() {
  return http.get(`${host}/api/v1/stocks/`)
}

export function search(query: string) {
  return http.get(`${host}/api/v1/stocks/search?query=${query}`)
}

export function getProductsSymbols(products: any) {
  return http.post(`${host}/api/v1/stocks/search`, products)
}

export function getStockPrixForDate(symbol: string, date: string) {
  return http.get(`${host}/api/v1/stocks/query/history?date=${date}&symbol=${symbol}`)
}

export function getStockHistory(symbols: string[], period: string) {
  const mappedPeriod = period === '1d' ? 'day' : period
  const encodedSymbols = symbols.map((symbol) => encodeURIComponent(symbol)).join(',')
  return http.get(`${host}/api/v1/stocks/history?symbols=${encodedSymbols}&period=${mappedPeriod}`)
}

// In-memory cache for quotes & variations to avoid duplicate calls
const quotesCache = new Map<string, { data: any; timestamp: number }>()
const inFlightQuotes = new Map<string, Promise<any>>()
const QUOTES_TTL_MS = 30 * 1000 // 30 seconds

export async function getQuotes(symbols: string[], forceRefresh = false) {
  if (!symbols || symbols.length === 0) return []
  const cacheKey = symbols.map((s) => s.toUpperCase()).sort().join(',')
  const cached = quotesCache.get(cacheKey)

  if (!forceRefresh && cached && Date.now() - cached.timestamp < QUOTES_TTL_MS) {
    return cached.data
  }

  if (inFlightQuotes.has(cacheKey)) {
    return inFlightQuotes.get(cacheKey)!
  }

  const encodedSymbols = symbols.map((symbol) => encodeURIComponent(symbol)).join(',')
  const promise = (async () => {
    try {
      const data = await http.get(`${host}/api/v1/stocks/quotes?symbols=${encodedSymbols}`)
      quotesCache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } finally {
      inFlightQuotes.delete(cacheKey)
    }
  })()

  inFlightQuotes.set(cacheKey, promise)
  return promise
}

export function getFundamentals(symbol: string) {
  return http.get(`${host}/api/v1/stocks/${encodeURIComponent(symbol)}/fundamentals`)
}

export function getStock(symbol: string) {
  return http.get(`${host}/api/v1/stocks/${encodeURIComponent(symbol)}`)
}

const variationsCache = new Map<string, { data: any; timestamp: number }>()
const inFlightVariations = new Map<string, Promise<any>>()
const VARIATIONS_TTL_MS = 60 * 1000 // 1 minute

export async function getStocksVariations(symbols: string[], forceRefresh = false) {
  if (!symbols || symbols.length === 0) return []
  const cacheKey = symbols.map((s) => s.toUpperCase()).sort().join(',')
  const cached = variationsCache.get(cacheKey)

  if (!forceRefresh && cached && Date.now() - cached.timestamp < VARIATIONS_TTL_MS) {
    return cached.data
  }

  if (inFlightVariations.has(cacheKey)) {
    return inFlightVariations.get(cacheKey)!
  }

  const encodedSymbols = symbols.map((symbol) => encodeURIComponent(symbol)).join(',')
  const promise = (async () => {
    try {
      const data = await http.get(`${host}/api/v1/stocks/variations?symbols=${encodedSymbols}`)
      variationsCache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } finally {
      inFlightVariations.delete(cacheKey)
    }
  })()

  inFlightVariations.set(cacheKey, promise)
  return promise
}
