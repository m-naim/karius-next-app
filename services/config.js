const config = {
  development: {
    API_URL: 'http://localhost:8000',
    QWANTAPI_URL: 'http://127.0.0.1:8080',
  },
  test: {
    API_URL: 'http://localhost:8000',
    QWANTAPI_URL: 'https://qwantapi.herokuapp.com',
  },
  production: {
    API_URL: 'https://kareus.vercel.app/',
    amqpUrl: 'amqp://localhost:5672',
    QWANTAPI_URL: 'https://qwantapi.herokuapp.com',
  },
};
export const env = process.env.NODE_ENV || 'dev';
export default config[env];
