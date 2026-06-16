import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ProductResponse, ApiResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  getWishlist(page = 1): Observable<ApiResponse<ProductResponse[]> | ProductResponse[]> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<ApiResponse<ProductResponse[]> | ProductResponse[]>('/api/v1/wishlist', {
      headers: this.getHeaders(),
      params
    });
  }

  toggleWishlist(productId: number): Observable<ApiResponse<{ added: boolean; message: string }>> {
    return this.http.post<ApiResponse<{ added: boolean; message: string }>>('/api/v1/wishlist/toggle', {
      productId
    }, { headers: this.getHeaders() });
  }
}
