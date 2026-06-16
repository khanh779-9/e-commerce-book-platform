import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap, of, catchError } from 'rxjs';
import { CustomerResponse, LoginResponse, ApiResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  
  // Signals
  currentUser = signal<CustomerResponse | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    this.checkToken();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  checkToken() {
    if (this.isBrowser()) {
      const token = localStorage.getItem('token');
      if (token) {
        this.isAuthenticated.set(true);
        this.fetchProfile().subscribe({
          error: () => this.logout()
        });
      }
    }
  }

  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem('token');
    }
    return null;
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/v1/auth/login', credentials).pipe(
      tap(response => {
        if (response.token) {
          if (this.isBrowser()) {
            localStorage.setItem('token', response.token);
          }
          this.currentUser.set(response.data || null);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  register(userData: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/v1/auth/register', userData).pipe(
      tap(response => {
        if (response.token) {
          if (this.isBrowser()) {
            localStorage.setItem('token', response.token);
          }
          this.currentUser.set(response.data || null);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  fetchProfile(): Observable<ApiResponse<CustomerResponse>> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
    return this.http.get<ApiResponse<CustomerResponse>>('/api/v1/auth/me', { headers }).pipe(
      tap(response => {
        if (response.data) {
          this.currentUser.set(response.data);
          this.isAuthenticated.set(true);
        }
      }),
      catchError(error => {
        this.logout();
        throw error;
      })
    );
  }

  logout() {
    if (this.isBrowser()) {
      // Best effort to call backend, but always clean local storage
      const token = this.getToken();
      if (token) {
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
        this.http.post('/api/v1/auth/logout', {}, { headers }).subscribe();
      }
      localStorage.removeItem('token');
    }
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }
}
