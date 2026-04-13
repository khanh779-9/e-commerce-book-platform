import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { EmployeeAuthService } from '../../../core/services/employee-auth.service';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Quản trị viên',
  quanly: 'Quản lý',
  nhanvien: 'Nhân viên',
};

interface NavItem {
  path: string;
  label: string;
  exact: boolean;
  roles?: string[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-slate-100 text-slate-700 md:grid md:grid-cols-[248px_minmax(0,1fr)]">
      <aside class="hidden min-h-screen border-r border-slate-200 bg-white md:flex md:flex-col">
        <div class="border-b border-slate-200 px-5 py-5">
          <a routerLink="/admin" class="text-xl font-semibold tracking-tight text-slate-950">BookZone</a>
          <p class="mt-1 text-xs text-slate-500">Quản trị nội bộ</p>
        </div>

        <nav class="flex-1 overflow-y-auto px-3 py-4" aria-label="Điều hướng quản trị">
          @for (group of visibleNavGroups; track group.label) {
            <div class="mb-5">
              @if (group.label) {
                <p class="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{{ group.label }}</p>
              }
              <div class="grid gap-0.5">
                @for (item of group.items; track item.path) {
                  <a [routerLink]="item.path"
                     routerLinkActive="bg-slate-900 text-white"
                     [routerLinkActiveOptions]="{ exact: item.exact }"
                     class="rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950">
                    {{ item.label }}
                  </a>
                }
              </div>
            </div>
          }
        </nav>

        <div class="border-t border-slate-200 p-4">
          <p class="truncate text-sm font-medium text-slate-900">{{ employee()?.fullName || employee()?.email }}</p>
          <p class="mt-0.5 text-xs text-slate-500">{{ roleLabel() }}</p>
          <button type="button" (click)="logout()" class="mt-3 text-sm font-medium text-red-600 hover:underline">Đăng xuất</button>
        </div>
      </aside>

      <div class="min-w-0">
        <header class="sticky top-0 z-40 border-b border-slate-200 bg-white">
          <div class="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div class="md:hidden">
              <a routerLink="/admin" class="text-lg font-semibold tracking-tight text-slate-950">BookZone Admin</a>
            </div>
            <div class="hidden md:block">
              <p class="text-sm text-slate-500">Hệ thống quản trị nhà sách</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="hidden text-right sm:block md:hidden">
                <p class="text-sm font-medium text-slate-900">{{ employee()?.fullName || employee()?.email }}</p>
                <p class="text-xs text-slate-500">{{ roleLabel() }}</p>
              </div>
              <button type="button" (click)="logout()" class="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 md:hidden">Đăng xuất</button>
            </div>
          </div>

          <nav class="flex overflow-x-auto border-t border-slate-100 px-2 md:hidden" aria-label="Điều hướng quản trị di động">
            @for (item of mobileNav; track item.path) {
              <a [routerLink]="item.path"
                 routerLinkActive="border-slate-900 text-slate-950"
                 [routerLinkActiveOptions]="{ exact: item.exact }"
                 class="shrink-0 border-b-2 border-transparent px-3 py-3 text-xs font-medium text-slate-500">
                {{ item.label }}
              </a>
            }
          </nav>
        </header>

        <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AdminShellComponent {
  private employeeAuth = inject(EmployeeAuthService);
  private router = inject(Router);

  employee = this.employeeAuth.currentEmployee;

  navGroups: { label: string; items: NavItem[] }[] = [
    {
      label: 'Tổng quan',
      items: [{ path: '/admin', label: 'Bảng điều khiển', exact: true }]
    },
    {
      label: 'Vận hành',
      items: [
        { path: '/admin/orders', label: 'Đơn hàng', exact: false },
        { path: '/admin/products', label: 'Sản phẩm', exact: false },
        { path: '/admin/categories', label: 'Danh mục', exact: false },
        { path: '/admin/authors', label: 'Tác giả', exact: false },
        { path: '/admin/publishers', label: 'Nhà xuất bản', exact: false },
        { path: '/admin/providers', label: 'Nhà cung cấp', exact: false },
        { path: '/admin/units', label: 'Đơn vị tính', exact: false },
        { path: '/admin/book-types', label: 'Loại sách', exact: false },
        { path: '/admin/promotions', label: 'Khuyến mãi', exact: false },
      ]
    },
    {
      label: 'Người dùng',
      items: [
        { path: '/admin/customers', label: 'Khách hàng', exact: false },
        { path: '/admin/employees', label: 'Nhân viên', exact: false, roles: ['admin'] },
      ]
    },
    {
      label: 'Hệ thống',
      items: [
        { path: '/admin/reports', label: 'Báo cáo doanh thu', exact: false, roles: ['admin', 'quanly'] },
        { path: '/admin/reviews', label: 'Đánh giá', exact: false, roles: ['admin', 'quanly'] },
        { path: '/admin/notifications', label: 'Thông báo', exact: false },
      ]
    },
  ];

  get visibleNavGroups(): { label: string; items: NavItem[] }[] {
    const role = this.employee()?.role || '';
    return this.navGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item => !item.roles || item.roles.includes(role)),
      }))
      .filter(group => group.items.length > 0);
  }

  get mobileNav(): NavItem[] {
    return this.visibleNavGroups.flatMap(g => g.items);
  }

  roleLabel(): string {
    return ROLE_LABELS[this.employee()?.role || ''] || 'Nhân viên';
  }

  logout() {
    this.employeeAuth.logout();
    this.router.navigate(['/admin/login']);
  }
}
