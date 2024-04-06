import http from './http'
import config from './config'
import { format } from 'date-fns/format'
import { fr } from 'date-fns/locale'

const host = config.API_URL
const qwantHost = config.QWANTAPI_URL

function getAll() {
  return http.get(`${host}/api/v1/portfolios`)
}

function getStocksNameByName(name) {
  return http.get(`${host}/api/v1/stocks/search/${name}`)
}

function getStocksContains(name) {
  return http.get(`${host}/api/v1/stocks/contains/${name}`)
}

function get(portfolioID = 'curent') {
  return http.get(`${host}/api/v1/portfolios/${portfolioID}`)
}

function getData(portfolioName = 'curent') {
  return http.get(`${host}/api/v1/portfolios/${portfolioName}`)
}

function follow(id) {
  return http.post(`${host}/api/v1/portfolios/${id}/follow`, {})
}

function unfollow(id) {
  return http.post(`${host}/api/v1/portfolios/${id}/unfollow`, {})
}

function post(state) {
  return http.post(`${host}/api/v1/portfolios/`, state)
}

function add(payload) {
  const body = {
    name: payload.name,
    isPublic: payload.visibility,
  }
  return http.post(`${host}/api/v1/portfolios`, body)
}

function AddTransaction(idPft, body) {
  const { type, ticker, prix, quantity, date } = body
  const coef = 'Acheter' === type ? 1 : -1

  const apiBody = {
    symbol: ticker,
    date: format(date, 'yyyy-MM-dd', { locale: fr }),
    price: prix,
    qty: quantity * coef,
  }
  return http.post(`${host}/api/v1/portfolios/${idPft}/transaction`, apiBody)
}

function deletePortfolio(id) {
  return http.deleteReq(`${host}/api/v1/portfolios/${id}`)
}

function getPerformances(id) {
  return http.get(`${host}/api/v1/portfolios/${id}/performance/`)
}
function getDividends(id) {
  return http.get(`${qwantHost}/api/v1/portfolios/${id}/dividends`)
}

function getMetrics(id) {
  return http.get(`${qwantHost}/api/v1/portfolios/${id}/stats`)
}

const portfolioService = {
  getAll,
  get,
  getData,
  post,
  getStocksNameByName,
  getStocksContains,
  add,
  AddTransaction,
  follow,
  unfollow,
  deletePortfolio,
  getPerformances,
  getMetrics,
  getDividends,
}

export default portfolioService
