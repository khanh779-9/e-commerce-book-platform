import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, AuthorResponse, BookTypeResponse, CategoryResponse, PaginatedResponse, ProductResponse, ProductSearchParams, ProviderResponse, PublisherResponse, ReviewResponse, UnitResponse, PromotionValidationResult, ShippingCalculationResult, ShippingZone, ShippingDistrict } from '../models/models';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  getProducts(p: ProductSearchParams = {}): Observable<PaginatedResponse<ProductResponse>> {
    let params = new HttpParams();
    Object.entries(p).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value)); });
    return this.http.get<PaginatedResponse<ProductResponse>>(this.config.buildApiUrl('/v1/products'), { params });
  }
  getProductById(id: number) { return this.http.get<ApiResponse<ProductResponse>>(this.config.buildApiUrl(`/v1/products/${id}`)); }
  getCategories() { return this.http.get<CategoryResponse[]>(this.config.buildApiUrl('/v1/categories')); }
  getAuthors() { return this.http.get<AuthorResponse[]>(this.config.buildApiUrl('/v1/authors')); }
  getPublishers() { return this.http.get<PublisherResponse[]>(this.config.buildApiUrl('/v1/publishers')); }
  getProviders() { return this.http.get<ProviderResponse[]>(this.config.buildApiUrl('/v1/providers')); }
  getUnits() { return this.http.get<UnitResponse[]>(this.config.buildApiUrl('/v1/units')); }
  getBookTypes() { return this.http.get<BookTypeResponse[]>(this.config.buildApiUrl('/v1/book-types')); }
  getReviews(productId: number, page = 1, pageSize = 10) { return this.http.get<PaginatedResponse<ReviewResponse>>(this.config.buildApiUrl(`/v1/products/${productId}/reviews`), { params: { page, pageSize } }); }
  submitReview(productId: number, rating: number, comment: string) { return this.http.post<ApiResponse<ReviewResponse>>(this.config.buildApiUrl(`/v1/products/${productId}/reviews`), { rating, comment }); }
  updateReview(productId: number, reviewId: number, rating: number, comment: string) { return this.http.put<ApiResponse<ReviewResponse>>(this.config.buildApiUrl(`/v1/products/${productId}/reviews/${reviewId}`), { rating, comment }); }
  deleteReview(productId: number, reviewId: number) { return this.http.delete<ApiResponse<unknown>>(this.config.buildApiUrl(`/v1/products/${productId}/reviews/${reviewId}`)); }

  // Promotion validation
  validatePromotion(code: string, orderValue: number, productIds: number[]): Observable<ApiResponse<PromotionValidationResult>> {
    return this.http.post<ApiResponse<PromotionValidationResult>>(this.config.buildApiUrl('/v1/promotions/validate'), { code, orderValue, productIds });
  }

  // Shipping calculation
  calculateShipping(provinceId: number, districtId: number, totalWeight: number, orderValue: number): Observable<ApiResponse<ShippingCalculationResult>> {
    return this.http.post<ApiResponse<ShippingCalculationResult>>(this.config.buildApiUrl('/v1/shipping/calculate'), { provinceId, districtId, totalWeight, orderValue });
  }
  getShippingZones(): Observable<ShippingZone[]> { return this.http.get<ShippingZone[]>(this.config.buildApiUrl('/v1/shipping/zones')); }
  getShippingDistricts(provinceId: number): Observable<ShippingDistrict[]> { return this.http.get<ShippingDistrict[]>(this.config.buildApiUrl(`/v1/shipping/zones/${provinceId}/districts`)); }
}
