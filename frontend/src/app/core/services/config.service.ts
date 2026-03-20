import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface AppConfig {
  frontendUrl: string;
  backendUrl: string;
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
    frontendUrl: environment.frontendUrl,
    backendUrl: environment.backendUrl,
    appName: environment.appName,
    version: environment.version,
    features: environment.features
  };

  get frontendUrl(): string { return this.config.frontendUrl; }
  get backendUrl(): string { return this.config.backendUrl; }
  get appName(): string { return this.config.appName; }
  get version(): string { return this.config.version; }
  get features() { return this.config.features; }

  get<T>(key: keyof AppConfig): T {
    return this.config[key] as T;
  }

  buildApiUrl(endpoint: string): string {
    const base = this.config.backendUrl.replace(/\/$/, '');
    const ep = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${ep}`;
  }
}