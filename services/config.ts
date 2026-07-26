const getDynamicApiUrl = (defaultUrl: string) => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:8080`
  }
  return defaultUrl
}

export const env = process.env.ENV || process.env.NODE_ENV || 'development'
console.log(`Current environment: ${env}`)
const config = {
  get development() {
    const url = getDynamicApiUrl('http://127.0.0.1:8080')
    return {
      API_URL: url,
      QWANTAPI_URL: url,
      features: {
        watchlist: true,
        portfolio: true,
        explore: true,
      },
    }
  },
  get test() {
    const url = getDynamicApiUrl('http://100.112.119.0:8000')
    return {
      API_URL: url,
      QWANTAPI_URL: url,
      features: {
        watchlist: true,
        portfolio: true,
        explore: true,
      },
    }
  },
  production: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.boursehorus.com',
    amqpUrl: 'amqp://localhost:5672',
    QWANTAPI_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.boursehorus.com',
    features: {
      watchlist: true,
      portfolio: true,
      explore: true,
    },
  },
}

const currentConfig = {
  get API_URL() {
    const active = config[env] || config.development
    return active.API_URL
  },
  get QWANTAPI_URL() {
    const active = config[env] || config.development
    return active.QWANTAPI_URL
  },
  get features() {
    const active = config[env] || config.development
    return active.features
  },
  get amqpUrl() {
    const active = config[env] || config.development
    return (active as any).amqpUrl
  },
}

export default currentConfig

