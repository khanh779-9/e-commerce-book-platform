import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap, catchError } from 'rxjs';
import { EmployeeResponse, EmployeeLoginResponse } from '../models/models';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeAuthService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'employee_token';

  // Public signals
  readonly currentEmployee = signal<EmployeeResponse | null>(null);
  readonly isAuthenticated = signal<boolean>(false);
  readonly role = signal<string>(''); // admin | quanly | nhanvien

  constructor() {
    this.restoreSession();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /** Restore the employee session from localStorage on app load. */
  private restoreSession() {
    if (this.isBrowser()) {
      const token = localStorage.getItem(this.STORAGE_KEY);
      if (token) {
        this.isAuthenticated.set(true);
      }
      const profile = localStorage.getItem('employee_profile');
      if (profile) {
        try {
          const emp = JSON.parse(profile) as EmployeeResponse;
          this.currentEmployee.set(emp);
          this.role.set(emp.role || '');
          this.isAuthenticated.set(true);
        } catch {
          this.clearLocalSession();
        }
      }
    }
  }

  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem(this.STORAGE_KEY);
    }
    return null;
  }

  /** Authorization header builder for employee-only API endpoints. */
  authHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.getToken()}` });
  }

  login(credentials: { employeeId: number; password: string }): Observable<EmployeeLoginResponse> {
    return this.http.post<EmployeeLoginResponse>(this.config.buildApiUrl('/v1/employee/login'), credentials).pipe(
      tap(response => {
        if (response.token) {
          if (this.isBrowser()) {
            localStorage.setItem(this.STORAGE_KEY, response.token);
            if (response.data) {
              localStorage.setItem('employee_profile', JSON.stringify(response.data));
            }
          }
          this.currentEmployee.set(response.data || null);
          this.role.set(response.data?.role || '');
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  logout(): void {
    if (this.isBrowser()) {
      const token = this.getToken();
      if (token) {
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
        this.http.post(this.config.buildApiUrl('/v1/employee/logout'), {}, { headers }).subscribe({
          error: () => { /* ignored - session cleared locally anyway */ }
        });
      }
      this.clearLocalSession();
    }
    this.currentEmployee.set(null);
    this.isAuthenticated.set(false);
    this.role.set('');
  }

  private clearLocalSession() {
    if (this.isBrowser()) {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem('employee_profile');
    }
  }
}
