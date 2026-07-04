import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface AppConfig {
  apiBaseUrl: string;
  appName: string;
  version: string;
  features: {
    enablePwa: boolean;
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config: AppConfig = {
    apiBaseUrl: environment.apiBaseUrl,
    appName: environment.appName,
    version: environment.version,
    features: environment.features
  };

  get apiBaseUrl(): string { return this.config.apiBaseUrl; }
  get appName(): string { return this.config.appName; }
  get version(): string { return this.config.version; }
  get features() { return this.config.features; }

  get<T>(key: keyof AppConfig): T {
    return this.config[key] as T;
  }

  buildApiUrl(endpoint: string): string {
    const base = this.config.apiBaseUrl.replace(/\/$/, '');
    const ep = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${ep}`;
  }
}