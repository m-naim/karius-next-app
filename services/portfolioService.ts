import http from './http'
import config from './config'
import { format } from 'date-fns/format'
import { fr } from 'date-fns/locale'

const host = config.API_URL
const qwantHost = config.QWANTAPI_URL

export function getAll() {
  return http.get(`${host}/api/v1/portfolios`)
}

export function getStocksNameByName(name) {
  return http.get(`${host}/api/v1/stocks/search/${name}`)
}

export function getStocksContains(name) {
  return http.get(`${host}/api/v1/stocks/contains/${name}`)
}

export function get(portfolioID = 'curent') {
  return http.get(`${host}/api/v1/portfolios/${portfolioID}`)
}

export function getData(portfolioName = 'curent') {
  return http.get(`${host}/api/v1/portfolios/${portfolioName}`)
}

export function follow(id) {
  return http.post(`${host}/api/v1/portfolios/${id}/follow`, {})
}

export function unfollow(id) {
  return http.post(`${host}/api/v1/portfolios/${id}/unfollow`, {})
}

export function post(state) {
  return http.post(`${host}/api/v1/portfolios/`, state)
}

export function add(payload) {
  const body = {
    name: payload.name,
    isPublic: payload.visibility,
  }
  return http.post(`${host}/api/v1/portfolios`, body)
}

export function AddTransaction(idPft, body) {
  const { id, type, ticker, prix, quantity, date } = body
  const coef = 'Acheter' === type ? 1 : -1

  const apiBody = {
    id,
    symbol: ticker,
    date: format(date, 'yyyy-MM-dd', { locale: fr }),
    price: prix,
    qty: quantity * coef,
  }
  return http.post(`${host}/api/v1/portfolios/${idPft}/transaction`, apiBody)
}

export function addMouvementService(idPft, body) {
  const { id, type, amount, date } = body
  const apiBody = {
    id,
    date: format(date, 'yyyy-MM-dd', { locale: fr }),
    amount: amount,
    type: type,
  }
  return http.post(`${host}/api/v1/portfolios/${idPft}/movement`, apiBody)
}

export function addTransactions(idPft, transactions) {
  return http.post(`${host}/api/v1/portfolios/${idPft}/transaction/import`, {
    transactions: transactions,
  })
}

export function modifyTransactionApi(idPft, body) {
  const { id, type, ticker, prix, quantity, date } = body
  const coef = 'Acheter' === type ? 1 : -1

  const apiBody = {
    id,
    symbol: ticker,
    date: format(date, 'yyyy-MM-dd', { locale: fr }),
    price: prix,
    qty: quantity * coef,
  }
  return http.put(`${host}/api/v1/portfolios/${idPft}/transaction`, apiBody)
}

export function deleteTransaction(id, idTransaction) {
  return http.deleteReq(`${host}/api/v1/portfolios/${id}/transaction/${idTransaction}`)
}

export function deletePortfolio(id) {
  return http.deleteReq(`${host}/api/v1/portfolios/${id}`)
}

export function getPerformances(id, benchmarks, period) {
  const encodedBenchmarks = encodeURIComponent(benchmarks.join(','))
  return http.get(
    `${host}/api/v1/portfolios/${id}/performance/?benchmarks=${encodedBenchmarks}&period=${period}`
  )
}

export function getPerformancesSummary(id: string) {
  return http.get(`${host}/api/v1/portfolios/${id}/performance/summary`)
}

export function getDividends(id) {
  return http.get(`${qwantHost}/api/v1/portfolios/${id}/dividends`)
}

export function getMetrics(id) {
  return http.get(`${qwantHost}/api/v1/portfolios/${id}/stats`)
}

export function getStockInfo(symbol: string) {
  return http.get(`${host}/api/v1/stocks/${symbol}/info`)
}
