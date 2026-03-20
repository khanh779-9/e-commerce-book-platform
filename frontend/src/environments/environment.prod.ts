import { baseEnvironment } from './environment.base';

export const environment = {
  ...baseEnvironment,
  production: true,
  // Override for production if needed:
  // frontendUrl: 'https://bookzone.vn',
  // backendUrl: 'https://api.bookzone.vn',
  features: {
    enablePwa: true,
    enableAnalytics: true,
    enableErrorReporting: true
  }
};