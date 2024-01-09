import http from './http'
import config from './config'

const host = config.API_URL
const qwantHost = config.QWANTAPI_URL

function update(id) {
  return http.get(`${qwantHost}/api/v1/update/stocks/${id}/`)
}

function getAll(id) {
  return http.get(`${host}/api/v1/stocks/`)
}

function search(query) {
  return http.get(`${host}/api/v1/stocks/search?query=${query}`)
}

const stockService = {
  update,
  getAll,
  search,
}

export default stockService
