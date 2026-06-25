import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div>
      <div class="mb-8">
        <p class="eyebrow">Chào mừng trở lại</p>
        <h1 class="mt-3 font-serif text-4xl font-semibold tracking-tight text-secondary">Đăng nhập</h1>
        <p class="mt-3 text-sm leading-6 text-muted">Truy cập đơn hàng, danh sách yêu thích và thông tin tài khoản của bạn.</p>
      </div>

      @if (errorMessage()) {
        <div role="alert" class="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm text-red-800">
          {{ errorMessage() }}
        </div>
      }

      <form (submit)="onSubmit($event)" class="space-y-5">
        <div>
          <label for="login-email" class="field-label">Email</label>
          <input id="login-email" type="email" [(ngModel)]="email" name="email" required autocomplete="email" placeholder="you@example.com" class="field" />
        </div>

        <div>
          <label for="login-password" class="field-label">Mật khẩu</label>
          <input id="login-password" type="password" [(ngModel)]="password" name="password" required autocomplete="current-password" placeholder="Nhập mật khẩu" class="field" />
        </div>

        <div class="flex items-center justify-between text-sm">
          <a routerLink="/forgot-password" class="font-medium text-primary hover:text-primary-dark">Quên mật khẩu?</a>
        </div>

        <button type="submit" [disabled]="loading()" class="btn-primary w-full min-h-12">
          {{ loading() ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </button>
      </form>

      <div class="mt-7 border-t border-border pt-6 text-sm text-muted">
        <p>Chưa có tài khoản? <a routerLink="/register" class="font-semibold text-primary hover:text-primary-dark">Đăng ký</a></p>
        <p class="mt-3">Dành cho nhân viên? <a routerLink="/admin/login" class="font-semibold text-secondary hover:text-primary">Đăng nhập nội bộ</a></p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';

  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.email || !this.password) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Email hoặc mật khẩu không chính xác.');
      }
    });
  }
}