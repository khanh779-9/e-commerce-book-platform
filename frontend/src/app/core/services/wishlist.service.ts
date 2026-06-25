import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, PaginatedResponse, ProductResponse, WishlistToggleResponse } from '../models/models';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  getWishlist(page = 1, pageSize = 12) { return this.http.get<PaginatedResponse<ProductResponse>>(this.config.buildApiUrl('/v1/wishlist'), { params: { page, pageSize } }); }
  toggleWishlist(productId: number) { return this.http.post<ApiResponse<WishlistToggleResponse>>(this.config.buildApiUrl('/v1/wishlist/toggle'), { productId }); }
}
