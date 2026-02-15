import { getQuotes } from './stock.service'
import config from './config'
import http from './http'

const host = config.API_URL
export function get(symbol: string): Promise<IndexComposition> {
  return http.get(`${host}/api/v1/index?symbol=${encodeURIComponent(symbol)}`)
}
export interface IndexComposition {
  symbol: string
  name: string
  holdings: any[]
}

const marketService = {
  get,
}

export default marketService
