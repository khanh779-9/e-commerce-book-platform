import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { OrderDetailResponse, ApiResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  getOrders(page = 1): Observable<ApiResponse<OrderDetailResponse[]> | OrderDetailResponse[]> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<ApiResponse<OrderDetailResponse[]> | OrderDetailResponse[]>('/api/v1/orders', {
      headers: this.getHeaders(),
      params
    });
  }

  getOrderById(id: number): Observable<OrderDetailResponse> {
    return this.http.get<OrderDetailResponse>(`/api/v1/orders/${id}`, { headers: this.getHeaders() });
  }

  confirmOrder(id: number): Observable<ApiResponse<OrderDetailResponse>> {
    return this.http.post<ApiResponse<OrderDetailResponse>>(`/api/v1/orders/${id}/confirm`, {}, { headers: this.getHeaders() });
  }
}
