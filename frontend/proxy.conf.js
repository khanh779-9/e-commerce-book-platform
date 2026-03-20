/**
 * Angular Dev Server Proxy Configuration
 * Reads backend URL from environment variable BACKEND_URL or defaults to http://localhost:5132
 */
const BACKEND_URL = process.env['BACKEND_URL'] || 'http://localhost:5132';

const createProxy = (target) => ({
  target,
  secure: false,
  changeOrigin: true,
  logLevel: 'error',
});

module.exports = {
  '/api': createProxy(BACKEND_URL),
  '/uploads': createProxy(BACKEND_URL),
};