import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, NotificationResponse, PaginatedResponse } from '../models/models';
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  getNotifications(params: { type?: string; status?: string; page?: number; pageSize?: number } = {}) { return this.http.get<PaginatedResponse<NotificationResponse>>('/api/v1/notifications', { params: params as Record<string,string|number|boolean> }); }
  markAllRead() { return this.http.post<ApiResponse<unknown>>('/api/v1/notifications/mark-all', {}); }
  toggleRead(id: number) { return this.http.post<ApiResponse<NotificationResponse>>(`/api/v1/notifications/${id}/toggle`, {}); }
  archive(id: number) { return this.http.post<ApiResponse<unknown>>(`/api/v1/notifications/${id}/archive`, {}); }
}
