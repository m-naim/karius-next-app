import config from './config'
import http from './http'

const host = config.API_URL
function getAll() {
  return http.get(`${host}/api/v1/watchlists/`)
}

function get(name = 'curent') {
  return http.get(`${host}/api/v1/watchlists/${name}`)
}

function add(name) {
  return http.post(`${host}/api/v1/watchlists/`, { name })
}

function addStock(id, payload) {
  return http.put(`${host}/api/v1/watchlists/${id}`, payload)
}

function removeStock(id, symbol) {
  return http.deleteReq(`${host}/api/v1/watchlists/${id}/security/${symbol}`)
}

const watchListService = {
  getAll,
  get,
  add,
  addStock,
  removeStock,
}

export default watchListService
