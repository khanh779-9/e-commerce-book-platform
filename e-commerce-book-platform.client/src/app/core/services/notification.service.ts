import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiResponse } from '../models/models';

export interface NotificationResponse {
  notificationId: number;
  title: string;
  content: string;
  type: string;
  status: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  getNotifications(params?: {
    type?: string;
    status?: string;
    page?: number;
  }): Observable<ApiResponse<NotificationResponse[]> | NotificationResponse[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.type) httpParams = httpParams.set('type', params.type);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
    }

    return this.http.get<ApiResponse<NotificationResponse[]> | NotificationResponse[]>('/api/v1/notifications', {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  markAllRead(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>('/api/v1/notifications/mark-all', {}, { headers: this.getHeaders() });
  }

  toggleRead(id: number): Observable<ApiResponse<NotificationResponse>> {
    return this.http.post<ApiResponse<NotificationResponse>>(`/api/v1/notifications/${id}/toggle`, {}, { headers: this.getHeaders() });
  }

  archive(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`/api/v1/notifications/${id}/archive`, {}, { headers: this.getHeaders() });
  }
}
