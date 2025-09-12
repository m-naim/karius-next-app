const config = {
  development: {
    API_URL: 'http://127.0.0.1:8080',
    QWANTAPI_URL: 'http://127.0.0.1:8080',
    features: {
      watchlist: true,
      portfolio: true,
      explore: true,
    },
  },
  test: {
    API_URL: 'http://localhost:8000',
    QWANTAPI_URL: 'https://qwantapi.herokuapp.com',
    features: {
      watchlist: true,
      portfolio: true,
      explore: true,
    },
  },
  production: {
    API_URL: 'https://api.boursehorus.com',
    amqpUrl: 'amqp://localhost:5672',
    QWANTAPI_URL: 'https://api.boursehorus.com',
    features: {
      watchlist: true,
      portfolio: true,
      explore: true,
    },
  },
}
export const env = process.env.ENV || process.env.NODE_ENV || 'dev'
export default config[env]
