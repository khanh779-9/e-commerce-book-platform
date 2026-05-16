import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../core/services/admin-api.service';
import {
  CustomerResponse, OrderDetailResponse, OrderListResponse, OrderStatus, PaymentMethod, ProductResponse,
  ORDER_STATUS_LABELS, PAYMENT_LABELS
} from '../../../core/models/models';
import { AdminPageHeaderComponent } from '../../../shared/admin-components/admin-page-header';
import { AdminSearchInputComponent } from '../../../shared/admin-components/admin-search-input';
import { AdminPaginationComponent } from '../../../shared/admin-components/admin-pagination';
import { AdminModalComponent } from '../../../shared/admin-components/admin-modal';

const NEXT: Record<OrderStatus, OrderStatus[]> = {
  cho_xac_nhan: ['da_xac_nhan', 'da_huy'],
  da_xac_nhan: ['dang_giao_hang', 'da_huy'],
  dang_giao_hang: ['da_giao_hang'],
  da_giao_hang: [],
  da_huy: []
};

interface ManualOrderItem { productId: number | null; quantity: number; }

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPageHeaderComponent, AdminSearchInputComponent, AdminPaginationComponent, AdminModalComponent],
  template: `
<div class="admin-page">
  <app-admin-page-header
    title="Đơn hàng"
    description="Xử lý đơn theo đúng luồng trạng thái, xem chi tiết thanh toán, địa chỉ và sản phẩm."
    [showAdd]="true"
    addLabel="Tạo đơn tại quầy"
    (add)="openCreate()"
  />

  <section class="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
    <app-admin-search-input [value]="searchTerm" (valueChange)="searchTerm=$event;load(1)" placeholder="Tìm mã đơn hoặc tên khách hàng..." />
    <select [(ngModel)]="statusFilter" (ngModelChange)="load(1)" class="admin-field">
      <option value="">Tất cả trạng thái</option>
      @for (s of statuses; track s) { <option [value]="s">{{ statusLabel(s) }}</option> }
    </select>
  </section>

  @if (loading()) {
    <div class="skeleton h-80 rounded-md"></div>
  } @else {
    <div class="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[1050px] text-left text-sm">
          <thead class="border-b border-slate-200 bg-slate-50">
            <tr><th class="admin-th">Mã đơn</th><th class="admin-th">Khách hàng</th><th class="admin-th">Ngày đặt</th><th class="admin-th">Thanh toán</th><th class="admin-th text-right">Tổng tiền</th><th class="admin-th">Trạng thái</th><th class="admin-th text-right">Thao tác</th></tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (o of orders(); track o.orderId) {
              <tr class="hover:bg-slate-50/70">
                <td class="px-4 py-3.5 font-medium text-slate-950">#{{ o.orderId }}</td>
                <td class="px-4 py-3.5"><p class="text-slate-800">{{ o.customerName || 'Khách lẻ' }}</p><p class="mt-0.5 text-xs text-slate-400">{{ o.itemCount }} sản phẩm</p></td>
                <td class="px-4 py-3.5 text-slate-600">{{ o.orderDate | date:'dd/MM/yyyy HH:mm' }}</td>
                <td class="px-4 py-3.5 text-slate-600">{{ paymentLabel(o.paymentMethod) }}</td>
                <td class="px-4 py-3.5 text-right font-medium text-slate-950 tnum">{{ o.totalAmount | currency:'VND':'symbol-narrow':'1.0-0' }}</td>
                <td class="px-4 py-3.5"><span class="rounded-sm px-2 py-1 text-xs font-medium" [class]="statusClass(o.status)">{{ statusLabel(o.status) }}</span></td>
                <td class="px-4 py-3.5 text-right"><button type="button" (click)="openDetail(o.orderId)" class="text-sm font-medium text-slate-700 hover:underline">Xem & xử lý</button></td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="px-4 py-16 text-center text-slate-500">Không có đơn hàng phù hợp.</td></tr>
            }
          </tbody>
        </table>
      </div>
      @if (totalPages() > 1) { <app-admin-pagination [currentPage]="page()" [lastPage]="totalPages()" (pageChange)="load($event)" /> }
    </div>
  }

  <app-admin-modal [isOpen]="createOpen()" title="Tạo đơn tại quầy" subtitle="Giá và tồn kho sẽ được backend kiểm tra lại khi tạo đơn" (close)="closeCreate()">
    <form (submit)="createManualOrder($event)" class="space-y-6">
      <section class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label class="admin-label">Khách hàng</label>
          <select [(ngModel)]="manualCustomerId" (ngModelChange)="customerChanged()" name="customerId" class="admin-field">
            <option [ngValue]="null">Khách lẻ / không gắn tài khoản</option>
            @for (c of customers(); track c.id) { <option [ngValue]="c.id">#{{ c.id }} - {{ c.fullName }}{{ c.phone ? ' · ' + c.phone : '' }}</option> }
          </select>
        </div>
        <div>
          <label class="admin-label">Địa chỉ giao hàng</label>
          <select [(ngModel)]="manualAddressId" name="addressId" class="admin-field" [disabled]="!manualCustomerId || !selectedCustomer()?.addresses?.length">
            <option [ngValue]="null">Không chọn</option>
            @for (a of selectedCustomer()?.addresses || []; track a.addressId) { <option [ngValue]="a.addressId">{{ a.address }}</option> }
          </select>
          @if (manualCustomerId && selectedCustomer() && !(selectedCustomer()?.addresses?.length)) { <p class="mt-1.5 text-xs text-amber-700">Khách hàng này chưa có địa chỉ giao hàng.</p> }
        </div>
        <div>
          <label class="admin-label">Phương thức thanh toán</label>
          <select [(ngModel)]="manualPayment" name="paymentMethod" class="admin-field">
            <option value="tien_mat">Tiền mặt</option><option value="chuyen_khoan">Chuyển khoản</option><option value="vi_dien_tu">Ví điện tử</option>
          </select>
        </div>
      </section>

      <section>
        <div class="mb-3 flex items-center justify-between gap-3">
          <div><h3 class="text-sm font-semibold text-slate-950">Sản phẩm</h3><p class="mt-0.5 text-xs text-slate-500">Đơn tại quầy được tạo ở trạng thái Đã xác nhận.</p></div>
          <button type="button" (click)="addManualItem()" class="btn-secondary">Thêm dòng</button>
        </div>
        <div class="space-y-3">
          @for (item of manualItems; track $index; let idx = $index) {
            <div class="grid gap-3 rounded-md border border-slate-200 p-3 sm:grid-cols-[minmax(0,1fr)_110px_auto] sm:items-end">
              <div>
                <label class="admin-label">Sản phẩm</label>
                <select [(ngModel)]="item.productId" [name]="'product-'+idx" class="admin-field" required>
                  <option [ngValue]="null">Chọn sản phẩm</option>
                  @for (p of products(); track p.productId) { <option [ngValue]="p.productId" [disabled]="p.stockQuantity <= 0">#{{ p.productId }} - {{ p.name }} · còn {{ p.stockQuantity }}</option> }
                </select>
                @if (productFor(item.productId); as p) { <p class="mt-1.5 text-xs text-slate-500">Giá hiện tại: {{ p.effectivePrice | currency:'VND':'symbol-narrow':'1.0-0' }}</p> }
              </div>
              <div><label class="admin-label">Số lượng</label><input type="number" min="1" max="999" [(ngModel)]="item.quantity" [name]="'qty-'+idx" class="admin-field" required /></div>
              <button type="button" (click)="removeManualItem(idx)" class="min-h-10 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50" [disabled]="manualItems.length === 1">Xóa</button>
            </div>
          }
        </div>
      </section>

      <div>
        <label class="admin-label">Ghi chú</label>
        <textarea [(ngModel)]="manualNotes" name="notes" rows="3" maxlength="2000" class="admin-field" placeholder="Ghi chú cho đơn hàng..."></textarea>
      </div>

      <div class="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div><p class="text-xs text-slate-500">Tổng tạm tính trên giao diện</p><p class="mt-1 text-xl font-semibold text-slate-950 tnum">{{ manualTotal() | currency:'VND':'symbol-narrow':'1.0-0' }}</p><p class="mt-1 text-xs text-slate-400">Backend sẽ chốt lại khuyến mãi và tồn kho tại thời điểm tạo.</p></div>
        <div class="flex gap-2"><button type="button" (click)="closeCreate()" class="btn-secondary">Hủy</button><button type="submit" [disabled]="creating()" class="btn-dark">{{ creating() ? 'Đang tạo...' : 'Tạo đơn' }}</button></div>
      </div>
    </form>
  </app-admin-modal>

  <app-admin-modal [isOpen]="!!detail()" [title]="detail() ? 'Đơn hàng #' + detail()!.orderId : 'Chi tiết đơn hàng'" subtitle="Kiểm tra thông tin trước khi chuyển trạng thái" (close)="detail.set(null)">
    @if (detail()) {
      <div class="space-y-6">
        <section class="grid gap-4 sm:grid-cols-2">
          <div><p class="text-xs text-slate-500">Khách hàng</p><p class="mt-1 text-sm font-medium text-slate-950">{{ detail()!.customerName || 'Khách lẻ' }}</p></div>
          <div><p class="text-xs text-slate-500">Nhân viên xử lý</p><p class="mt-1 text-sm text-slate-700">{{ detail()!.employeeName || 'Chưa phân công' }}</p></div>
          <div><p class="text-xs text-slate-500">Thanh toán</p><p class="mt-1 text-sm text-slate-700">{{ paymentLabel(detail()!.paymentMethod) }}</p></div>
          <div><p class="text-xs text-slate-500">Trạng thái</p><p class="mt-1"><span class="rounded-sm px-2 py-1 text-xs font-medium" [class]="statusClass(detail()!.status)">{{ statusLabel(detail()!.status) }}</span></p></div>
          <div class="sm:col-span-2"><p class="text-xs text-slate-500">Địa chỉ giao hàng</p><p class="mt-1 text-sm text-slate-700">{{ detail()!.address || '-' }}</p></div>
          @if (detail()!.notes) { <div class="sm:col-span-2"><p class="text-xs text-slate-500">Ghi chú</p><p class="mt-1 whitespace-pre-line text-sm text-slate-700">{{ detail()!.notes }}</p></div> }
        </section>
        <section class="overflow-hidden rounded-md border border-slate-200">
          <table class="w-full text-sm"><thead class="bg-slate-50"><tr><th class="admin-th text-left">Sản phẩm</th><th class="admin-th text-right">SL</th><th class="admin-th text-right">Đơn giá</th><th class="admin-th text-right">Thành tiền</th></tr></thead>
          <tbody class="divide-y divide-slate-100">@for (i of detail()!.items; track i.productId) { <tr><td class="px-4 py-3 text-slate-800">{{ i.productName || ('#'+i.productId) }}</td><td class="px-4 py-3 text-right tnum">{{ i.quantity }}</td><td class="px-4 py-3 text-right tnum">{{ i.unitPrice | currency:'VND':'symbol-narrow':'1.0-0' }}</td><td class="px-4 py-3 text-right font-medium tnum">{{ i.subTotal | currency:'VND':'symbol-narrow':'1.0-0' }}</td></tr> }</tbody>
          <tfoot class="border-t border-slate-200 bg-slate-50"><tr><td colspan="3" class="px-4 py-3 text-right font-medium text-slate-600">Tổng cộng</td><td class="px-4 py-3 text-right font-semibold text-slate-950 tnum">{{ detail()!.totalAmount | currency:'VND':'symbol-narrow':'1.0-0' }}</td></tr></tfoot></table>
        </section>
        <section class="border-t border-slate-200 pt-5">
          <h3 class="text-sm font-semibold text-slate-950">Xử lý đơn</h3>
          @if (nextStatuses(detail()!.status).length) {
            <p class="mt-1 text-xs text-slate-500">Chỉ các bước hợp lệ tiếp theo được hiển thị.</p>
            <div class="mt-3 flex flex-wrap gap-2">@for (s of nextStatuses(detail()!.status); track s) { <button type="button" (click)="changeStatus(s)" [disabled]="updating()" [class]="s === 'da_huy' ? 'btn-danger' : 'btn-dark'">{{ s === 'da_huy' ? 'Hủy đơn' : 'Chuyển sang: ' + statusLabel(s) }}</button> }</div>
          } @else { <p class="mt-2 text-sm text-slate-500">Đơn hàng ở trạng thái kết thúc, không còn bước xử lý tiếp theo.</p> }
        </section>
      </div>
    }
  </app-admin-modal>
</div>`
})
export class AdminOrdersComponent implements OnInit {
  private api = inject(AdminApiService);
  orders = signal<OrderListResponse[]>([]);
  detail = signal<OrderDetailResponse | null>(null);
  loading = signal(false);
  updating = signal(false);
  page = signal(1);
  totalPages = signal(1);
  searchTerm = '';
  statusFilter = '';
  statuses: OrderStatus[] = ['cho_xac_nhan', 'da_xac_nhan', 'dang_giao_hang', 'da_giao_hang', 'da_huy'];

  createOpen = signal(false);
  creating = signal(false);
  customers = signal<CustomerResponse[]>([]);
  products = signal<ProductResponse[]>([]);
  selectedCustomer = signal<CustomerResponse | null>(null);
  manualCustomerId: number | null = null;
  manualAddressId: number | null = null;
  manualPayment: PaymentMethod = 'tien_mat';
  manualNotes = '';
  manualItems: ManualOrderItem[] = [{ productId: null, quantity: 1 }];

  ngOnInit() { this.load(); }

  load(page = 1) {
    this.loading.set(true);
    this.api.getOrders(page, this.statusFilter, this.searchTerm).subscribe({
      next: r => { this.orders.set(r.items); this.page.set(r.page); this.totalPages.set(r.totalPages); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openDetail(id: number) {
    this.api.getOrder(id).subscribe({ next: x => this.detail.set(x), error: e => alert(e?.error?.message || 'Không thể tải đơn hàng.') });
  }

  changeStatus(status: OrderStatus) {
    const d = this.detail(); if (!d) return;
    if (status === 'da_huy' && !confirm('Xác nhận hủy đơn? Tồn kho sẽ được hoàn lại.')) return;
    this.updating.set(true);
    this.api.updateOrderStatus(d.orderId, status).subscribe({
      next: x => { this.detail.set(x); this.updating.set(false); this.load(this.page()); },
      error: e => { this.updating.set(false); alert(e?.error?.message || 'Không thể cập nhật trạng thái.'); }
    });
  }

  openCreate() {
    this.createOpen.set(true);
    this.resetManualForm();
    if (!this.customers().length) this.api.getCustomerOptions().subscribe({ next: x => this.customers.set(x) });
    if (!this.products().length) this.api.getProducts(1, 100).subscribe({ next: x => this.products.set(x) });
  }

  closeCreate() { if (!this.creating()) this.createOpen.set(false); }

  resetManualForm() {
    this.manualCustomerId = null; this.manualAddressId = null; this.manualPayment = 'tien_mat'; this.manualNotes = '';
    this.manualItems = [{ productId: null, quantity: 1 }]; this.selectedCustomer.set(null);
  }

  customerChanged() {
    this.manualAddressId = null; this.selectedCustomer.set(null);
    if (!this.manualCustomerId) return;
    this.api.getAdminCustomer(this.manualCustomerId).subscribe({ next: c => this.selectedCustomer.set(c) });
  }

  addManualItem() { this.manualItems = [...this.manualItems, { productId: null, quantity: 1 }]; }
  removeManualItem(index: number) { if (this.manualItems.length > 1) this.manualItems = this.manualItems.filter((_, i) => i !== index); }
  productFor(id: number | null) { return id ? this.products().find(p => p.productId === id) : undefined; }
  manualTotal() { return this.manualItems.reduce((sum, i) => sum + ((this.productFor(i.productId)?.effectivePrice || 0) * (Number(i.quantity) || 0)), 0); }

  createManualOrder(event: Event) {
    event.preventDefault();
    const items = this.manualItems.filter(i => i.productId && i.quantity > 0).map(i => ({ productId: i.productId!, quantity: Number(i.quantity) }));
    if (!items.length || items.length !== this.manualItems.length) { alert('Vui lòng chọn sản phẩm cho tất cả các dòng.'); return; }
    const duplicate = new Set(items.map(i => i.productId)).size !== items.length;
    if (duplicate) { alert('Mỗi sản phẩm chỉ nên xuất hiện một lần trong đơn. Hãy tăng số lượng thay vì thêm dòng trùng.'); return; }
    this.creating.set(true);
    this.api.createManualOrder({ customerId: this.manualCustomerId, addressId: this.manualAddressId, paymentMethod: this.manualPayment, notes: this.manualNotes.trim() || null, items }).subscribe({
      next: r => { this.creating.set(false); this.createOpen.set(false); if (r.data) this.detail.set(r.data); this.load(1); },
      error: e => { this.creating.set(false); alert(e?.error?.message || 'Không thể tạo đơn hàng.'); }
    });
  }

  nextStatuses(s: OrderStatus) { return NEXT[s] || []; }
  statusLabel(s: OrderStatus | string) { return ORDER_STATUS_LABELS[s as OrderStatus] || s; }
  paymentLabel(p: string) { return PAYMENT_LABELS[p as keyof typeof PAYMENT_LABELS] || p; }
  statusClass(s: string) {
    return { cho_xac_nhan: 'bg-amber-50 text-amber-700', da_xac_nhan: 'bg-blue-50 text-blue-700', dang_giao_hang: 'bg-cyan-50 text-cyan-700', da_giao_hang: 'bg-emerald-50 text-emerald-700', da_huy: 'bg-red-50 text-red-700' }[s] || 'bg-slate-100 text-slate-700';
  }
}
