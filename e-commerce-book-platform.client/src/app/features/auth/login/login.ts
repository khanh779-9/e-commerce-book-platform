import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Header -->
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-black text-gray-900 tracking-tight">Đăng nhập tài khoản</h2>
        <p class="text-xs text-gray-400">
          Chưa có tài khoản? 
          <a routerLink="/register" class="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Đăng ký ngay</a>
        </p>
      </div>

      <!-- Error box -->
      @if (errorMessage()) {
        <div class="p-4 bg-rose-50 text-rose-700 text-xs font-bold rounded-2xl border border-rose-100 flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 flex-shrink-0">
            <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.753-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
          </svg>
          <span>{{ errorMessage() }}</span>
        </div>
      }

      <!-- Form -->
      <form (submit)="onSubmit($event)" class="space-y-4">
        
        <!-- Email -->
        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-400 uppercase">Địa chỉ Email</label>
          <div class="relative">
            <input type="email" 
                   [(ngModel)]="email" 
                   name="email"
                   required
                   placeholder="yourname&#64;example.com"
                   class="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
        </div>

        <!-- Password -->
        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-400 uppercase">Mật khẩu</label>
          <div class="relative">
            <input type="password" 
                   [(ngModel)]="password" 
                   name="password"
                   required
                   placeholder="••••••••"
                   class="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0V10.5m-2.25 10.5h13.5c.621 0 1.125-.504 1.125-1.125V11.25c0-.621-.504-1.125-1.125-1.125H3.75c-.621 0-1.125.504-1.125 1.125v8.25c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
          </div>
        </div>

        <!-- Submit Button -->
        <button type="submit" 
                [disabled]="loading()"
                class="w-full py-3 px-4 font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 rounded-2xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all text-center flex items-center justify-center space-x-2">
          @if (loading()) {
            <div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Đang đăng nhập...</span>
          } @else {
            <span>Đăng Nhập</span>
          }
        </button>

      </form>

      <!-- Back home option -->
      <div class="text-center pt-2">
        <a routerLink="/" class="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors">Trở về Trang Chủ</a>
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
