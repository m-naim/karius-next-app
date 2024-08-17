import config from './config'
import http from './http'

const host = config.API_URL
export function getAll() {
  return http.get(`${host}/api/v1/watchlists/`)
}

export function get(name = 'curent') {
  return http.get(`${host}/api/v1/watchlists/${name}`)
}

export function add(payload) {
  const body = {
    name: payload.name,
    isPublic: payload.visibility,
  }
  return http.post(`${host}/api/v1/watchlists/`, body)
}

export function addStock(id, payload) {
  return http.put(`${host}/api/v1/watchlists/${id}`, payload)
}

export function removeStock(id, symbol) {
  return http.deleteReq(`${host}/api/v1/watchlists/${id}/security/${symbol}`)
}

export function removeList(id) {
  return http.deleteReq(`${host}/api/v1/watchlists/${id}`)
}

const watchListService = {
  getAll,
  get,
  add,
  addStock,
  removeStock,
}

export default watchListService
