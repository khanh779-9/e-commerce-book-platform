import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { ApiResponse, CustomerResponse, LoginResponse } from '../models/models';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  private platformId = inject(PLATFORM_ID);
  private readonly tokenKey = 'token';
  private readonly profileKey = 'customer_profile';
  readonly currentUser = signal<CustomerResponse | null>(null);
  readonly isAuthenticated = signal(false);

  constructor() { this.restoreSession(); }
  private isBrowser() { return isPlatformBrowser(this.platformId); }
  private restoreSession() {
    if (!this.isBrowser()) return;
    const token = localStorage.getItem(this.tokenKey);
    const profile = localStorage.getItem(this.profileKey);
    if (token) this.isAuthenticated.set(true);
    if (profile) try { this.currentUser.set(JSON.parse(profile)); this.isAuthenticated.set(!!token); } catch { this.clearSession(); }
  }
  getToken() { return this.isBrowser() ? localStorage.getItem(this.tokenKey) : null; }
  login(body: { email: string; password: string }) { return this.http.post<LoginResponse>(this.config.buildApiUrl('/v1/auth/login'), body).pipe(tap(r => this.persist(r))); }
  register(body: { firstName: string; middleName?: string; lastName: string; email: string; password: string; phone?: string; address?: string }) { return this.http.post<LoginResponse>(this.config.buildApiUrl('/v1/auth/register'), body).pipe(tap(r => this.persist(r))); }
  forgotPassword(email: string) { return this.http.post<ApiResponse<{ code?: string }>>(this.config.buildApiUrl('/v1/auth/forgot-password'), { email }); }
  resetPassword(body: { email: string; code: string; password: string; confirmPassword: string }) { return this.http.post<ApiResponse<unknown>>(this.config.buildApiUrl('/v1/auth/reset-password'), body); }
  fetchProfile(): Observable<ApiResponse<CustomerResponse>> {
    return this.http.get<ApiResponse<CustomerResponse>>(this.config.buildApiUrl('/v1/auth/me')).pipe(tap(r => { if (r.data) this.persistProfile(r.data); }), catchError(err => { this.clearSession(); return throwError(() => err); }));
  }
  logout() {
    if (this.getToken()) this.http.post(this.config.buildApiUrl('/v1/auth/logout'), {}).subscribe({ error: () => undefined });
    this.clearSession();
  }
  clearSession() {
    if (this.isBrowser()) { localStorage.removeItem(this.tokenKey); localStorage.removeItem(this.profileKey); }
    this.currentUser.set(null); this.isAuthenticated.set(false);
  }
  private persist(response: LoginResponse) {
    if (!response.token) return;
    if (this.isBrowser()) localStorage.setItem(this.tokenKey, response.token);
    this.isAuthenticated.set(true);
    if (response.data) this.persistProfile(response.data);
  }
  private persistProfile(user: CustomerResponse) {
    this.currentUser.set(user);
    if (this.isBrowser()) localStorage.setItem(this.profileKey, JSON.stringify(user));
  }
}
