import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductResponse, CategoryResponse, ApiResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  getProducts(params?: {
    keyword?: string;
    categoryId?: number;
    sortBy?: string;
    isDescending?: boolean;
    page?: number;
    pageSize?: number;
    promotedOnly?: boolean;
  }): Observable<ApiResponse<ProductResponse[]> | ProductResponse[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.keyword) httpParams = httpParams.set('q', params.keyword);
      if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.isDescending !== undefined) httpParams = httpParams.set('isDescending', params.isDescending.toString());
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.pageSize) httpParams = httpParams.set('limit', params.pageSize.toString());
      if (params.promotedOnly !== undefined) httpParams = httpParams.set('promotedOnly', params.promotedOnly.toString());
    }

    // Backend endpoint can return ApiResponse wrapping the array, or direct array
    return this.http.get<ApiResponse<ProductResponse[]> | ProductResponse[]>('/api/v1/products', { params: httpParams });
  }

  getProductById(id: number): Observable<ApiResponse<ProductResponse>> {
    return this.http.get<ApiResponse<ProductResponse>>(`/api/v1/products/${id}`);
  }

  getCategories(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>('/api/v1/categories');
  }
}
