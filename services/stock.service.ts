import http from './http'
import config from './config'

const host = config.API_URL
const qwantHost = config.QWANTAPI_URL

export function update(id) {
  return http.get(`${qwantHost}/api/v1/update/stocks/${id}/`)
}

export function getAll(id) {
  return http.get(`${host}/api/v1/stocks/`)
}

export function search(query) {
  return http.get(`${host}/api/v1/stocks/search?query=${query}`)
}

export function getProductsSymbols(products) {
  return http.post(`${host}/api/v1/stocks/search`, products)
}

export function getStockPrixForDate(symbol, date) {
  return http.get(`${host}/api/v1/stocks/query/history?date=${date}&symbol=${symbol}`)
}

export function getStockHistory(symbols: string[], period: string) {
  const encodedSymbols = symbols.map((symbol) => encodeURIComponent(symbol)).join(',')
  return http.get(`${host}/api/v1/stocks/history?symbols=${encodedSymbols}&period=${period}`)
}

export function getQuotes(symbols: string[]) {
    const encodedSymbols = symbols.map((symbol) => encodeURIComponent(symbol)).join(',')

  return http.get(`${host}/api/v1/stocks/quotes?symbols=${encodedSymbols}`)
}
