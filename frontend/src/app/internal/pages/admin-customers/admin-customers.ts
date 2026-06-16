import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { CustomerResponse } from '../../../core/models/models';
import { AdminPageHeaderComponent } from '../../../shared/admin-components/admin-page-header';
import { AdminDataTableComponent, TableColumn } from '../../../shared/admin-components/admin-data-table';
import { AdminSearchInputComponent } from '../../../shared/admin-components/admin-search-input';
import { AdminModalComponent } from '../../../shared/admin-components/admin-modal';

@Component({selector:'app-admin-customers',standalone:true,imports:[CommonModule,FormsModule,AdminPageHeaderComponent,AdminDataTableComponent,AdminSearchInputComponent,AdminModalComponent],template:`
<div class="admin-page">
 <app-admin-page-header title="Khách hàng" description="Tra cứu hồ sơ, lịch sử mua hàng tổng hợp và ghi chú chăm sóc khách hàng." />
 <app-admin-search-input [value]="searchTerm" (valueChange)="searchTerm=$event;fetchData(1)" placeholder="Tìm theo tên, email hoặc số điện thoại..." />
 <app-admin-data-table [columns]="columns" [data]="customers()" [loading]="loading()" [showEdit]="true" [showDelete]="false" [idField]="'id'" editLabel="Xem" emptyMessage="Không tìm thấy khách hàng" [pagination]="pagination()?{currentPage:pagination()!.currentPage,lastPage:pagination()!.lastPage,onPageChange:(p)=>fetchData(p)}:undefined" (edit)="openDetail($event)" />
 <app-admin-modal [isOpen]="!!selected()" title="Hồ sơ khách hàng" subtitle="Thông tin tài khoản và thống kê mua hàng" (close)="selected.set(null)">
   @if(selected()){<div class="space-y-6">
    <section class="grid gap-4 sm:grid-cols-2">
      <div><p class="text-xs text-slate-500">Họ tên</p><p class="mt-1 font-medium text-slate-950">{{ selected()!.fullName }}</p></div>
      <div><p class="text-xs text-slate-500">Ngày tham gia</p><p class="mt-1 text-sm text-slate-700">{{ selected()!.joinedAt | date:'dd/MM/yyyy HH:mm' }}</p></div>
      <div><p class="text-xs text-slate-500">Email</p><p class="mt-1 text-sm text-slate-700">{{ selected()!.email || '-' }}</p></div>
      <div><p class="text-xs text-slate-500">Điện thoại</p><p class="mt-1 text-sm text-slate-700">{{ selected()!.phone || '-' }}</p></div>
      <div><p class="text-xs text-slate-500">Ngày sinh</p><p class="mt-1 text-sm text-slate-700">{{ selected()!.birthDate ? (selected()!.birthDate | date:'dd/MM/yyyy') : '-' }}</p></div>
      <div><p class="text-xs text-slate-500">Giới tính</p><p class="mt-1 text-sm text-slate-700">{{ genderLabel(selected()!.gender) }}</p></div>
      <div class="sm:col-span-2"><p class="text-xs text-slate-500">Địa chỉ mặc định</p><p class="mt-1 text-sm text-slate-700">{{ selected()!.address || '-' }}</p></div>
    </section>
    @if(selected()!.addresses?.length){<section><h3 class="text-sm font-semibold text-slate-950">Địa chỉ giao hàng đã lưu</h3><div class="mt-3 divide-y divide-slate-100 border-y border-slate-200">@for(a of selected()!.addresses || [];track a.addressId){<p class="py-3 text-sm leading-6 text-slate-700">{{a.address}}</p>}</div></section>}
    <section class="grid grid-cols-2 gap-4 border-y border-slate-200 py-5"><div><p class="text-xs text-slate-500">Số đơn hàng</p><p class="mt-1 text-xl font-semibold text-slate-950 tnum">{{ selected()!.orderCount }}</p></div><div><p class="text-xs text-slate-500">Đã chi tiêu</p><p class="mt-1 text-xl font-semibold text-slate-950 tnum">{{ selected()!.totalSpent | currency:'VND':'symbol-narrow':'1.0-0' }}</p></div></section>
    <div><label class="admin-label">Ghi chú nội bộ</label><textarea [(ngModel)]="notes" rows="4" class="admin-field resize-y" placeholder="Ví dụ: khách hàng thân thiết, yêu cầu giao hàng..."></textarea><p class="mt-1 text-xs text-slate-500">Ghi chú chỉ dành cho nhân viên.</p></div>
    @if(errorMessage()){<p class="text-sm text-red-600">{{ errorMessage() }}</p>}
    <div class="flex justify-end gap-3"><button type="button" (click)="selected.set(null)" class="btn-secondary">Đóng</button><button type="button" (click)="saveNotes()" [disabled]="saving()" class="btn-dark">{{ saving()?'Đang lưu...':'Lưu ghi chú' }}</button></div>
   </div>}
 </app-admin-modal>
</div>`})
export class AdminCustomersComponent implements OnInit{
 private api=inject(AdminApiService);customers=signal<CustomerResponse[]>([]);loading=signal(false);selected=signal<CustomerResponse|null>(null);saving=signal(false);errorMessage=signal<string|null>(null);searchTerm='';notes='';pagination=signal<{currentPage:number;lastPage:number}|null>(null);
 columns:TableColumn[]=[{header:'Khách hàng',render:(c:CustomerResponse)=>`${c.fullName} (#${c.id})`},{header:'Liên hệ',render:(c:CustomerResponse)=>[c.email,c.phone].filter(Boolean).join(' · ')||'-'},{header:'Đơn hàng',cellClassName:'text-right',render:(c:CustomerResponse)=>String(c.orderCount||0)},{header:'Đã chi tiêu',cellClassName:'text-right',render:(c:CustomerResponse)=>new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(c.totalSpent||0)},{header:'Tham gia',render:(c:CustomerResponse)=>c.joinedAt?new Date(c.joinedAt).toLocaleDateString('vi-VN'):'-'}];
 ngOnInit(){this.fetchData();} fetchData(page=1){this.loading.set(true);this.api.getAdminCustomers(page,this.searchTerm).subscribe({next:r=>{this.customers.set(r.data);this.pagination.set({currentPage:r.currentPage,lastPage:r.lastPage});this.loading.set(false);},error:()=>this.loading.set(false)});}
 openDetail(c:CustomerResponse){this.errorMessage.set(null);this.api.getAdminCustomer(c.id).subscribe({next:x=>{this.selected.set(x);this.notes=x.notes||'';},error:()=>{this.selected.set(c);this.notes=c.notes||'';}});}
 saveNotes(){const c=this.selected();if(!c)return;this.saving.set(true);this.api.updateCustomerNotes(c.id,this.notes).subscribe({next:()=>{this.saving.set(false);this.selected.update(x=>x?{...x,notes:this.notes}:x);this.fetchData();},error:e=>{this.saving.set(false);this.errorMessage.set(e?.error?.message||'Không thể lưu ghi chú.');}});}
 genderLabel(v?:string){return v==='Nu'?'Nữ':v==='Nam'?'Nam':v==='Khac'?'Khác':'-';}
}
