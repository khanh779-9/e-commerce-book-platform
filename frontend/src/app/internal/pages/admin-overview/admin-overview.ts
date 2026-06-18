import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { DashboardResponse, DashboardStats, LowStockProductResponse, OrderListResponse } from '../../../core/models/models';

const STATUS_LABELS: Record<string, string> = {
  cho_xac_nhan: 'Chờ xác nhận', da_xac_nhan: 'Đã xác nhận', dang_giao_hang: 'Đang giao', da_giao_hang: 'Đã giao', da_huy: 'Đã hủy'
};
const STATUS_CLASSES: Record<string, string> = {
  cho_xac_nhan: 'bg-amber-50 text-amber-700 ring-amber-200', da_xac_nhan: 'bg-blue-50 text-blue-700 ring-blue-200',
  dang_giao_hang: 'bg-cyan-50 text-cyan-700 ring-cyan-200', da_giao_hang: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  da_huy: 'bg-rose-50 text-rose-700 ring-rose-200'
};

@Component({
  selector: 'app-admin-overview', standalone: true, imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-page">
      <header class="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 class="text-2xl font-semibold text-slate-950">Bảng điều khiển</h1><p class="mt-1 text-sm text-slate-500">Doanh thu, vận hành đơn hàng và tồn kho cần chú ý.</p></div>
        <a routerLink="/admin/reports" class="text-sm font-medium text-slate-700 hover:text-slate-950 hover:underline">Mở báo cáo chi tiết</a>
      </header>

      @if (loading()) {
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">@for (x of [1,2,3,4,5,6,7,8]; track x) { <div class="skeleton h-28 rounded-md"></div> }</div>
      } @else if (stats()) {
        <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article class="admin-panel p-5"><p class="text-sm text-slate-500">Doanh thu tháng này</p><p class="mt-2 text-2xl font-semibold text-slate-950 tnum">{{ stats()!.revenueThisMonth | currency:'VND':'symbol-narrow':'1.0-0' }}</p><p class="mt-2 text-xs text-slate-400">Chỉ tính đơn đã giao hàng</p></article>
          <article class="admin-panel p-5"><p class="text-sm text-slate-500">Tổng doanh thu</p><p class="mt-2 text-2xl font-semibold text-slate-950 tnum">{{ stats()!.revenue | currency:'VND':'symbol-narrow':'1.0-0' }}</p><p class="mt-2 text-xs text-slate-400">Doanh thu đã hoàn tất</p></article>
          <article class="admin-panel p-5"><p class="text-sm text-slate-500">Chờ xác nhận</p><p class="mt-2 text-2xl font-semibold text-slate-950 tnum">{{ stats()!.pendingOrders }}</p><a routerLink="/admin/orders" [queryParams]="{status:'cho_xac_nhan'}" class="mt-2 inline-block text-xs font-medium text-slate-600 hover:underline">Xử lý đơn hàng</a></article>
          <article class="admin-panel p-5"><p class="text-sm text-slate-500">Sắp hết hàng</p><p class="mt-2 text-2xl font-semibold text-slate-950 tnum">{{ stats()!.lowStockProducts }}</p><a routerLink="/admin/products" class="mt-2 inline-block text-xs font-medium text-slate-600 hover:underline">Kiểm tra tồn kho</a></article>
          <article class="admin-panel p-5"><p class="text-sm text-slate-500">Tổng đơn hàng</p><p class="mt-2 text-2xl font-semibold text-slate-950 tnum">{{ stats()!.orders }}</p><p class="mt-2 text-xs text-slate-400">Mọi trạng thái</p></article>
          <article class="admin-panel p-5"><p class="text-sm text-slate-500">Sản phẩm</p><p class="mt-2 text-2xl font-semibold text-slate-950 tnum">{{ stats()!.products }}</p><p class="mt-2 text-xs text-slate-400">Đang có trong danh mục</p></article>
          <article class="admin-panel p-5"><p class="text-sm text-slate-500">Khách hàng</p><p class="mt-2 text-2xl font-semibold text-slate-950 tnum">{{ stats()!.customers }}</p><p class="mt-2 text-xs text-slate-400">Tài khoản đã đăng ký</p></article>
          <article class="admin-panel p-5"><p class="text-sm text-slate-500">Khuyến mãi hoạt động</p><p class="mt-2 text-2xl font-semibold text-slate-950 tnum">{{ stats()!.activePromotions }}</p><a routerLink="/admin/promotions" class="mt-2 inline-block text-xs font-medium text-slate-600 hover:underline">Quản lý khuyến mãi</a></article>
        </section>

        <section class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div class="admin-panel overflow-hidden">
            <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 class="text-base font-semibold text-slate-950">Đơn hàng gần đây</h2><p class="mt-0.5 text-xs text-slate-500">8 đơn mới nhất.</p></div><a routerLink="/admin/orders" class="text-sm font-medium text-slate-700 hover:underline">Xem tất cả</a></div>
            <div class="overflow-x-auto"><table class="w-full min-w-[720px] text-left text-sm"><thead class="border-b border-slate-200 bg-slate-50"><tr><th class="admin-th">Mã đơn</th><th class="admin-th">Khách hàng</th><th class="admin-th">Ngày tạo</th><th class="admin-th text-right">Tổng tiền</th><th class="admin-th">Trạng thái</th></tr></thead><tbody class="divide-y divide-slate-100">
              @for (o of recent(); track o.orderId) { <tr class="hover:bg-slate-50/70"><td class="px-5 py-3.5 font-medium text-slate-900">#{{ o.orderId }}</td><td class="px-5 py-3.5 text-slate-600">{{ o.customerName || 'Khách vãng lai' }}</td><td class="px-5 py-3.5 text-slate-600">{{ o.orderDate | date:'dd/MM/yyyy HH:mm' }}</td><td class="px-5 py-3.5 text-right font-medium text-slate-900 tnum">{{ o.totalAmount | currency:'VND':'symbol-narrow':'1.0-0' }}</td><td class="px-5 py-3.5"><span class="rounded-sm px-2 py-1 text-xs font-medium ring-1 ring-inset" [class]="statusClass(o.status)">{{ statusLabel(o.status) }}</span></td></tr> }
              @empty { <tr><td colspan="5" class="px-5 py-12 text-center text-slate-500">Chưa có đơn hàng.</td></tr> }
            </tbody></table></div>
          </div>

          <div class="space-y-5">
            <aside class="admin-panel p-5"><div class="flex items-center justify-between"><h2 class="text-base font-semibold text-slate-950">Tồn kho cần chú ý</h2><a routerLink="/admin/products" class="text-xs font-medium text-slate-600 hover:underline">Sản phẩm</a></div><div class="mt-4 divide-y divide-slate-100">@for (p of lowStock(); track p.productId) { <div class="flex items-center justify-between gap-4 py-3 first:pt-0"><a [routerLink]="['/admin/products']" class="min-w-0 truncate text-sm font-medium text-slate-800 hover:underline">{{ p.name }}</a><span class="shrink-0 text-xs font-semibold tnum" [class.text-rose-700]="p.stockQuantity <= 0" [class.text-amber-700]="p.stockQuantity > 0">{{ p.stockQuantity }} còn lại</span></div> } @empty { <p class="py-6 text-sm text-slate-500">Không có sản phẩm tồn kho thấp.</p> }</div></aside>
            <aside class="admin-panel p-5"><h2 class="text-base font-semibold text-slate-950">Phân bố trạng thái đơn</h2><div class="mt-4 space-y-3">@for (item of statusEntries(); track item.key) { <div><div class="flex justify-between gap-4 text-xs"><span class="text-slate-600">{{ statusLabel(item.key) }}</span><span class="font-semibold text-slate-900 tnum">{{ item.value }}</span></div><div class="mt-1.5 h-1.5 overflow-hidden rounded-sm bg-slate-100"><div class="h-full bg-slate-700" [style.width.%]="statusPercent(item.value)"></div></div></div> } @empty { <p class="py-4 text-sm text-slate-500">Chưa có dữ liệu đơn hàng.</p> }</div></aside>
          </div>
        </section>
      } @else { <div class="admin-panel py-14 text-center text-sm text-slate-500">Không tải được dữ liệu tổng quan.</div> }
    </div>`
})
export class AdminOverviewComponent implements OnInit {
  private adminApi = inject(AdminApiService);
  stats = signal<DashboardStats | null>(null); recent = signal<OrderListResponse[]>([]); lowStock = signal<LowStockProductResponse[]>([]); orderByStatus = signal<Record<string, number>>({}); loading = signal(true);
  ngOnInit() { this.adminApi.getDashboard().subscribe({ next: (d: DashboardResponse) => { this.stats.set(d.stats); this.recent.set(d.recentOrders ?? []); this.lowStock.set(d.lowStockProducts ?? []); this.orderByStatus.set(d.orderByStatus ?? {}); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  statusLabel(s: string) { return STATUS_LABELS[s] || s; }
  statusClass(s: string) { return STATUS_CLASSES[s] || 'bg-slate-50 text-slate-600 ring-slate-200'; }
  statusEntries() { return Object.entries(this.orderByStatus()).map(([key, value]) => ({ key, value })).sort((a,b) => b.value-a.value); }
  statusPercent(value: number) { const total = this.statusEntries().reduce((sum, x) => sum + x.value, 0); return total ? Math.max(3, Math.round(value * 100 / total)) : 0; }
}
