import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeAuthService } from '../../../core/services/employee-auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-100 px-4 py-10 sm:py-16">
      <div class="mx-auto w-full max-w-md">
        <div class="mb-8 text-center">
          <a routerLink="/" class="text-2xl font-semibold tracking-tight text-slate-950">BookZone</a>
          <p class="mt-1 text-sm text-slate-500">Hệ thống quản trị nội bộ</p>
        </div>

        <section class="rounded-md border border-slate-200 bg-white p-6 sm:p-8">
          <h1 class="text-2xl font-semibold text-slate-950">Đăng nhập nhân viên</h1>
          <p class="mt-2 text-sm leading-6 text-slate-500">Sử dụng mã nhân viên và mật khẩu được cấp để truy cập hệ thống.</p>

          @if (errorMessage()) {
            <div role="alert" class="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage() }}</div>
          }

          <form (submit)="onSubmit($event)" class="mt-6 space-y-5">
            <div>
              <label for="employee-id" class="admin-label">Mã nhân viên</label>
              <input id="employee-id" type="number" [(ngModel)]="employeeId" name="employeeId" required min="1" placeholder="Ví dụ: 1001" class="admin-field" />
            </div>
            <div>
              <label for="employee-password" class="admin-label">Mật khẩu</label>
              <input id="employee-password" type="password" [(ngModel)]="password" name="password" required autocomplete="current-password" class="admin-field" />
            </div>
            <button type="submit" [disabled]="loading()" class="min-h-11 w-full rounded-md bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">{{ loading() ? 'Đang đăng nhập...' : 'Đăng nhập hệ thống' }}</button>
          </form>

          <div class="mt-6 border-t border-slate-200 pt-5 text-sm text-slate-500">
            <a routerLink="/login" class="font-medium text-slate-700 hover:underline">Đăng nhập khách hàng</a>
            <span class="mx-2 text-slate-300">·</span>
            <a routerLink="/" class="font-medium text-slate-700 hover:underline">Trang chủ</a>
          </div>
        </section>

        <p class="mt-4 text-center text-xs leading-5 text-slate-400">Khu vực hạn chế truy cập. Chỉ dành cho nhân sự được cấp quyền.</p>
      </div>
    </div>
  `
})
export class AdminLoginComponent {
  private employeeAuth = inject(EmployeeAuthService);
  private router = inject(Router);

  employeeId: number | null = null;
  password = '';

  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.employeeId == null || !this.password) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    this.employeeAuth.login({ employeeId: this.employeeId, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Mã nhân viên hoặc mật khẩu không chính xác.');
      }
    });
  }
}
