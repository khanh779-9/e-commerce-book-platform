import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { MonthlyRevenue, ProductReportItem, ReportResponse } from '../../../core/models/models';
import { AdminPageHeaderComponent } from '../../../shared/admin-components/admin-page-header';
import { AdminDataTableComponent, TableColumn } from '../../../shared/admin-components/admin-data-table';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPageHeaderComponent, AdminDataTableComponent],
  template: `
    <div class="admin-page">
      <app-admin-page-header title="Báo cáo kinh doanh" description="Doanh thu chỉ ghi nhận từ các đơn đã giao hàng thành công." />

      <section class="flex flex-wrap items-end gap-3 rounded-md border border-slate-200 bg-white p-4">
        <div>
          <label class="admin-label">Năm</label>
          <input type="number" min="2020" max="2100" [(ngModel)]="year" class="admin-field mt-1 w-28" />
        </div>
        <div>
          <label class="admin-label">Tháng</label>
          <select [(ngModel)]="month" class="admin-field mt-1 w-40">
            <option [ngValue]="undefined">Cả năm</option>
            @for (m of months; track m) { <option [ngValue]="m">Tháng {{ m }}</option> }
          </select>
        </div>
        <button type="button" (click)="load()" class="btn-dark">Xem báo cáo</button>
      </section>

      @if (loading()) {
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">@for (x of [1,2,3,4]; track x) { <div class="skeleton h-28 rounded-md"></div> }</div>
        <div class="skeleton h-72 rounded-md"></div>
      } @else if (data()) {
        <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article class="admin-panel p-5"><p class="text-sm text-slate-500">Doanh thu kỳ chọn</p><p class="mt-2 text-2xl font-semibold text-slate-950 tnum">{{ data()!.summary.totalRevenue | currency:'VND':'symbol-narrow':'1.0-0' }}</p></article>
          <article class="admin-panel p-5"><p class="text-sm text-slate-500">Đơn hàng</p><p class="mt-2 text-2xl font-semibold text-slate-950 tnum">{{ data()!.summary.totalOrders }}</p><p class="mt-1 text-xs text-slate-500">{{ data()!.summary.deliveredOrders }} đã giao · {{ data()!.summary.cancelledOrders }} đã hủy</p></article>
          <article class="admin-panel p-5"><p class="text-sm text-slate-500">Giá trị đơn trung bình</p><p class="mt-2 text-2xl font-semibold text-slate-950 tnum">{{ data()!.summary.averageOrderValue | currency:'VND':'symbol-narrow':'1.0-0' }}</p></article>
          <article class="admin-panel p-5"><p class="text-sm text-slate-500">Khách hàng</p><p class="mt-2 text-2xl font-semibold text-slate-950 tnum">{{ data()!.summary.totalCustomers }}</p><p class="mt-1 text-xs text-slate-500">{{ data()!.summary.pendingOrders }} đơn đang chờ xác nhận</p></article>
        </section>

        <section>
          <div class="mb-3"><h2 class="text-base font-semibold text-slate-950">Doanh thu theo tháng</h2><p class="mt-1 text-sm text-slate-500">Dữ liệu theo các đơn có trạng thái đã giao hàng.</p></div>
          <app-admin-data-table [columns]="monthlyColumns" [data]="data()!.monthlyRevenues" [loading]="false" [showEdit]="false" [showDelete]="false" idField="month" emptyMessage="Chưa có dữ liệu thống kê" />
        </section>

        <section>
          <div class="mb-3"><h2 class="text-base font-semibold text-slate-950">Sản phẩm bán tốt</h2><p class="mt-1 text-sm text-slate-500">Xếp theo số lượng bán từ các đơn hoàn tất.</p></div>
          <app-admin-data-table [columns]="productColumns" [data]="data()!.topProducts" [loading]="false" [showEdit]="false" [showDelete]="false" idField="productId" emptyMessage="Chưa có dữ liệu sản phẩm" />
        </section>
      } @else {
        <div class="admin-panel py-14 text-center text-sm text-slate-500">Không tải được dữ liệu báo cáo.</div>
      }
    </div>
  `
})
export class AdminReportsComponent implements OnInit {
  private adminApi = inject(AdminApiService);
  data = signal<ReportResponse | null>(null);
  loading = signal(true);
  year = new Date().getFullYear();
  month: number | undefined = undefined;
  months = Array.from({length: 12}, (_, i) => i + 1);

  monthlyColumns: TableColumn[] = [
    { header: 'Tháng', render: (item: MonthlyRevenue) => `${item.month}/${item.year}` },
    { header: 'Đơn hoàn tất', render: (item: MonthlyRevenue) => `${item.orderCount} đơn` },
    { header: 'Doanh thu', cellClassName: 'text-right', render: (item: MonthlyRevenue) => this.money(item.revenue) },
    { header: 'Trung bình đơn', cellClassName: 'text-right', render: (item: MonthlyRevenue) => item.orderCount ? this.money(item.revenue / item.orderCount) : '-' },
  ];
  productColumns: TableColumn[] = [
    { header: 'Sản phẩm', render: (item: ProductReportItem) => item.productName },
    { header: 'Đã bán', cellClassName: 'text-right', render: (item: ProductReportItem) => item.totalQuantity.toLocaleString('vi-VN') },
    { header: 'Doanh thu', cellClassName: 'text-right', render: (item: ProductReportItem) => this.money(item.totalRevenue) },
  ];

  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true);
    this.adminApi.getReports(this.year, this.month).subscribe({
      next: res => { this.data.set(res); this.loading.set(false); },
      error: () => { this.data.set(null); this.loading.set(false); }
    });
  }
  private money(value: number) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0); }
}
