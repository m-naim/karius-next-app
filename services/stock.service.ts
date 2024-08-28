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
