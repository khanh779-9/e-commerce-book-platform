import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, OrderDetailResponse, OrderListResponse, PaginatedResponse, PaymentMethod, VnPayPaymentResponse } from '../models/models';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  getOrders(page = 1, pageSize = 10) { return this.http.get<PaginatedResponse<OrderListResponse>>(this.config.buildApiUrl('/v1/orders'), { params: { page, pageSize } }); }
  getOrderById(id: number) { return this.http.get<OrderDetailResponse>(this.config.buildApiUrl(`/v1/orders/${id}`)); }
  createOrder(body: { addressId?: number; paymentMethod: PaymentMethod; notes?: string; voucherCode?: string }) { return this.http.post<ApiResponse<OrderDetailResponse>>(this.config.buildApiUrl('/v1/orders'), body); }
  createVnPayPayment(body: { addressId?: number; paymentMethod: PaymentMethod; notes?: string; voucherCode?: string }) { return this.http.post<ApiResponse<VnPayPaymentResponse>>(this.config.buildApiUrl('/v1/orders/vnpay/create'), body); }
  cancelOrder(id: number) { return this.http.post<ApiResponse<OrderDetailResponse>>(this.config.buildApiUrl(`/v1/orders/${id}/cancel`), {}); }
}
