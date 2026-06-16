import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { CustomerResponse, ApiResponse } from '../models/models';

export interface AddressResponse {
  addressId: number;
  address: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  getAccount(): Observable<ApiResponse<CustomerResponse>> {
    return this.http.get<ApiResponse<CustomerResponse>>('/api/v1/account', { headers: this.getHeaders() });
  }

  updateProfile(profile: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    birthDate?: string;
    gender?: string;
  }): Observable<ApiResponse<CustomerResponse>> {
    return this.http.put<ApiResponse<CustomerResponse>>('/api/v1/account/profile', profile, { headers: this.getHeaders() });
  }

  changePassword(passwordData: {
    oldPassword?: string;
    newPassword?: string;
  }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>('/api/v1/account/password', passwordData, { headers: this.getHeaders() });
  }

  getAddresses(): Observable<AddressResponse[]> {
    return this.http.get<AddressResponse[]>('/api/v1/addresses', { headers: this.getHeaders() });
  }

  addAddress(address: string): Observable<ApiResponse<AddressResponse>> {
    return this.http.post<ApiResponse<AddressResponse>>('/api/v1/addresses', { address }, { headers: this.getHeaders() });
  }

  updateAddress(id: number, address: string): Observable<ApiResponse<AddressResponse>> {
    return this.http.put<ApiResponse<AddressResponse>>(`/api/v1/addresses/${id}`, { address }, { headers: this.getHeaders() });
  }

  deleteAddress(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`/api/v1/addresses/${id}`, { headers: this.getHeaders() });
  }
}
