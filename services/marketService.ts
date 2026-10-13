import config from './config'
import http from './http'

const host = config.API_URL

export interface IndexComposition {
  symbol: string
  name: string
  holdings: any[]
  totalHoldings?: number
  hasMore?: boolean
  net_assets?: string
  net_expense_ratio?: string
  dividend_yield?: string
  sectors?: any[]
}

const memoryCache = new Map<string, { data: IndexComposition; timestamp: number; isComplete: boolean }>()
type InFlightProgressive = {
  promise: Promise<IndexComposition>
  controller: AbortController
  consumers: number
}

const inFlightProgressive = new Map<string, InFlightProgressive>()
const CACHE_TTL_MS = 60 * 1000 // 1 minute fresh cache
const CHUNK_SIZE = 100
const MAX_PAGINATION_PAGES = 100
const PREFETCH_DELAY_MS = 350

let activePrefetchKey: string | null = null

function isAbortError(error: unknown): boolean {
  return (error as { name?: string } | null)?.name === 'AbortError'
}

function createAbortError(): Error {
  if (typeof DOMException !== 'undefined') {
    return new DOMException('The request was aborted', 'AbortError')
  }

  const error = new Error('The request was aborted')
  error.name = 'AbortError'
  return error
}

function withAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise
  if (signal.aborted) return Promise.reject(createAbortError())

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      cleanup()
      reject(createAbortError())
    }

    const cleanup = () => signal.removeEventListener('abort', onAbort)

    signal.addEventListener('abort', onAbort, { once: true })
    promise.then(
      (value) => {
        cleanup()
        resolve(value)
      },
      (error) => {
        cleanup()
        reject(error)
      }
    )
  })
}

function subscribeToProgressiveRequest(entry: InFlightProgressive, signal?: AbortSignal) {
  entry.consumers += 1
  let released = false

  const release = () => {
    if (released) return
    released = true
    entry.consumers -= 1
    if (entry.consumers === 0 && !entry.controller.signal.aborted) {
      entry.controller.abort()
    }
  }

  return withAbort(entry.promise, signal).finally(release)
}

function getNumericPageValue(page: any, keys: string[], fallback: number): number {
  for (const key of keys) {
    const value = Number(page?.[key])
    if (Number.isFinite(value) && value >= 0) return value
  }
  return fallback
}

function pageHasMore(page: any, offset: number, requestedLimit: number, totalHoldings: number): boolean {
  const explicitHasMore = page?.hasMore ?? page?.has_more
  const pageLimit = getNumericPageValue(page, ['limit', 'pageSize', 'page_size'], requestedLimit)
  const pageOffset = getNumericPageValue(page, ['offset', 'start'], offset)
  const inferredHasMore = totalHoldings > 0 && pageOffset + pageLimit < totalHoldings

  // Keep pagination working even when an older API response omits hasMore or
  // returns fewer enriched holdings than the requested page size.
  return explicitHasMore === true || explicitHasMore === 'true' || inferredHasMore
}

export async function getChunk(
  symbol: string,
  offset = 0,
  limit = CHUNK_SIZE,
  signal?: AbortSignal
): Promise<any> {
  return http.get(
    `${host}/api/v1/index?symbol=${encodeURIComponent(symbol)}&offset=${offset}&limit=${limit}`,
    { signal }
  )
}

export async function getProgressive(
  symbol: string,
  onProgress?: (data: IndexComposition, isComplete: boolean) => void,
  forceRefresh = false,
  signal?: AbortSignal
): Promise<IndexComposition> {
  const cacheKey = symbol.toUpperCase()
  const cached = memoryCache.get(cacheKey)

  if (signal?.aborted) {
    throw createAbortError()
  }

  // Return fresh full data from memory cache immediately (0ms)
  if (!forceRefresh && cached && cached.isComplete && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    if (onProgress) onProgress(cached.data, true)
    return cached.data
  }

  // Prevent duplicate concurrent requests (deduplication)
  const activeRequest = inFlightProgressive.get(cacheKey)
  if (activeRequest) {
    if (cached && onProgress) {
      onProgress(cached.data, cached.isComplete)
    }
    return subscribeToProgressiveRequest(activeRequest, signal)
  }

  const controller = new AbortController()
  const promise = (async () => {
    try {
      // 1. Fetch initial chunk fast (e.g. first 100 holdings)
      const firstChunk = await getChunk(symbol, 0, CHUNK_SIZE, controller.signal)
      const firstHoldings = Array.isArray(firstChunk.holdings) ? firstChunk.holdings : []
      const firstPageOffset = getNumericPageValue(firstChunk, ['offset', 'start'], 0)
      const firstPageLimit = getNumericPageValue(firstChunk, ['limit', 'pageSize', 'page_size'], CHUNK_SIZE)
      const totalHoldings = getNumericPageValue(
        firstChunk,
        ['totalHoldings', 'total_holdings', 'total', 'count'],
        firstHoldings.length
      )
      const hasMore = pageHasMore(firstChunk, firstPageOffset, CHUNK_SIZE, totalHoldings)

      const composition: IndexComposition = {
        symbol: symbol.toUpperCase(),
        name: firstChunk.name || symbol,
        holdings: firstHoldings,
        totalHoldings,
        hasMore,
        net_assets: firstChunk.net_assets,
        net_expense_ratio: firstChunk.net_expense_ratio,
        dividend_yield: firstChunk.dividend_yield,
        sectors: firstChunk.sectors,
      }

      const isComplete = !hasMore || composition.holdings.length >= totalHoldings
      memoryCache.set(cacheKey, { data: composition, timestamp: Date.now(), isComplete })

      // Immediately notify frontend with initial 100 constituents (fast first paint < 50ms)
      if (onProgress) {
        onProgress(composition, isComplete)
      }

      // 2. If there are more holdings, stream remaining chunks in the background invisibly
      if (!isComplete) {
        let currentOffset = firstPageOffset + firstPageLimit
        const seenSymbols = new Set(composition.holdings.map((h: any) => h.symbol))
        let pagesFetched = 1

        while (hasMore && currentOffset < totalHoldings && pagesFetched < MAX_PAGINATION_PAGES) {
          try {
            const nextChunk = await getChunk(symbol, currentOffset, CHUNK_SIZE, controller.signal)
            const newHoldings = (nextChunk.holdings || []).filter(
              (h: any) => h && h.symbol && !seenSymbols.has(h.symbol)
            )

            newHoldings.forEach((h: any) => {
              seenSymbols.add(h.symbol)
              composition.holdings.push(h)
            })

            const nextHasMore = pageHasMore(nextChunk, currentOffset, CHUNK_SIZE, totalHoldings)
            const complete = !nextHasMore || currentOffset + getNumericPageValue(nextChunk, ['limit', 'pageSize', 'page_size'], CHUNK_SIZE) >= totalHoldings
            composition.hasMore = !complete
            memoryCache.set(cacheKey, { data: composition, timestamp: Date.now(), isComplete: complete })

            // Progressively update the UI with newly appended holdings
            if (onProgress) {
              onProgress(composition, complete)
            }

            pagesFetched += 1
            if (complete) {
              break
            }

            const nextPageOffset = getNumericPageValue(nextChunk, ['offset', 'start'], currentOffset)
            const nextPageLimit = getNumericPageValue(nextChunk, ['limit', 'pageSize', 'page_size'], CHUNK_SIZE)
            const nextOffset = nextPageOffset + nextPageLimit
            currentOffset = nextOffset > currentOffset ? nextOffset : currentOffset + CHUNK_SIZE
          } catch (chunkErr) {
            if (isAbortError(chunkErr)) throw chunkErr
            console.warn(`Failed to fetch chunk at offset ${currentOffset} for ${symbol}:`, chunkErr)
            break
          }
        }
      }

      return composition
    } finally {
      const currentRequest = inFlightProgressive.get(cacheKey)
      if (currentRequest?.controller === controller) {
        inFlightProgressive.delete(cacheKey)
      }
    }
  })()

  const request: InFlightProgressive = { promise, controller, consumers: 0 }
  inFlightProgressive.set(cacheKey, request)
  return subscribeToProgressiveRequest(request, signal)
}

export async function get(symbol: string, forceRefresh = false, signal?: AbortSignal): Promise<IndexComposition> {
  return getProgressive(symbol, undefined, forceRefresh, signal)
}

export function getCached(symbol: string): IndexComposition | null {
  const cached = memoryCache.get(symbol.toUpperCase())
  return cached ? cached.data : null
}

export function prefetch(symbol: string): void {
  const cacheKey = symbol.toUpperCase()
  const cached = memoryCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) return
  if (activePrefetchKey && activePrefetchKey !== cacheKey) return

  activePrefetchKey = cacheKey
  getProgressive(symbol)
    .catch(() => {})
    .finally(() => {
      if (activePrefetchKey === cacheKey) activePrefetchKey = null
    })
}

export { PREFETCH_DELAY_MS }

const marketService = {
  get,
  getChunk,
  getProgressive,
  getCached,
  prefetch,
}

export default marketService
