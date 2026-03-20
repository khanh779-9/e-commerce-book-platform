import { baseEnvironment } from './environment.base';

export const environment = {
  ...baseEnvironment,
  production: false,
  features: {
    enablePwa: false,
    enableAnalytics: false,
    enableErrorReporting: false
  }
};