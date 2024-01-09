import http from './http'
import config from './config'

const host = config.API_URL
const qwantHost = config.QWANTAPI_URL

function getAll() {
  return http.get(`${host}/api/v1/portfolios/public`)
}

function getMyPortfolios() {
  return http.get(`${host}/api/v1/portfolios/`)
}

function getStocksNameByName(name) {
  return http.get(`${host}/api/v1/stocks/search/${name}`)
}

function getStocksContains(name) {
  return http.get(`${host}/api/v1/stocks/contains/${name}`)
}

function get(portfolioID = 'curent') {
  console.log(portfolioID)
  return http.get(`${host}/api/v1/portfolios/${portfolioID}`)
}

function getData(portfolioName = 'curent') {
  return http.get(`${host}/api/v1/portfolio/${portfolioName}`)
}

function follow(id) {
  return http.put(`${host}/api/v1/portfolio/follow/${id}`, {})
}

function post(state) {
  return http.post(`${host}/api/v1/portfolios/`, state)
}

function add(payload) {
  const body = {
    name: payload.name,
    public: payload.visibility === 'public' ? true : false,
    transactions: [],
    cash_flow: [
      {
        action: 'deposit',
        amount: payload.value,
        date: new Date(),
      },
    ],
    allocatio: [],
    last_perfs_update: new Date(),
  }
  return http.post(`${host}/api/v1/portfolio/`, body)
}

function AddTransaction(idPft, sense, ticker, prix, qty, date) {
  const coef = 'buy' === sense ? 1 : -1
  const body = {
    id: idPft,
    transaction: {
      symbol: ticker,
      date: date,
      price: prix,
      qty: qty * coef,
    },
  }
  return http.put(`${host}/api/v1/transaction/portfolio`, body)
}

function deletePortfolio(id) {
  return http.deleteReq(`${host}/api/v1/portfolio/${id}`)
}

function getPerformances(id) {
  return http.get(`${host}/api/v1/portfolio/${id}/performance`)
}
function getDividends(id) {
  return http.get(`${qwantHost}/api/v1/portfolio/${id}/dividends`)
}

function getMetrics(id) {
  return http.get(`${qwantHost}/api/v1/portfolio/${id}/stats`)
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
  getMyPortfolios,
  follow,
  deletePortfolio,
  getPerformances,
  getMetrics,
  getDividends,
}

export default portfolioService
