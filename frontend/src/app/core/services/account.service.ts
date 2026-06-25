import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, AddressResponse, CustomerResponse } from '../models/models';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  getAccount() { return this.http.get<ApiResponse<CustomerResponse>>(this.config.buildApiUrl('/v1/account')); }
  updateProfile(profile: Partial<CustomerResponse>) { return this.http.put<ApiResponse<CustomerResponse>>(this.config.buildApiUrl('/v1/account/profile'), profile); }
  changePassword(body: { oldPassword: string; newPassword: string; confirmNewPassword: string }) { return this.http.put<ApiResponse<unknown>>(this.config.buildApiUrl('/v1/account/password'), body); }
  getAddresses() { return this.http.get<AddressResponse[]>(this.config.buildApiUrl('/v1/addresses')); }
  addAddress(address: string) { return this.http.post<ApiResponse<AddressResponse>>(this.config.buildApiUrl('/v1/addresses'), { address }); }
  updateAddress(id: number, address: string) { return this.http.put<ApiResponse<AddressResponse>>(this.config.buildApiUrl(`/v1/addresses/${id}`), { address }); }
  deleteAddress(id: number) { return this.http.delete<ApiResponse<unknown>>(this.config.buildApiUrl(`/v1/addresses/${id}`)); }
}
