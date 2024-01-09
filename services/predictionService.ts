import config from './config'
import http from './http'

const host = config.API_URL
function get() {
  return http.get(`${host}/api/v1/predictions`)
}
const predictionService = {
  get,
}
export default predictionService
