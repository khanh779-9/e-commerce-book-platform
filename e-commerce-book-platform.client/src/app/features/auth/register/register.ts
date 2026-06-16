import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Header -->
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-black text-gray-900 tracking-tight">Đăng ký tài khoản</h2>
        <p class="text-xs text-gray-400">
          Đã có tài khoản? 
          <a routerLink="/login" class="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Đăng nhập tại đây</a>
        </p>
      </div>

      <!-- Error box -->
      @if (errorMessage()) {
        <div class="p-4 bg-rose-50 text-rose-700 text-xs font-bold rounded-none border border-rose-100 flex items-center space-x-2">
          <span>⚠️ {{ errorMessage() }}</span>
        </div>
      }

      <!-- Form -->
      <form (submit)="onSubmit($event)" class="space-y-4">
        
        <!-- Name -->
        <div class="grid grid-cols-3 gap-4">
          <div class="space-y-1">
            <label class="text-[10px] font-bold text-gray-400 uppercase">Họ</label>
            <input type="text" [(ngModel)]="form.lastName" name="lastName" required placeholder="Họ..." class="input-premium" />
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-bold text-gray-400 uppercase">Tên đệm</label>
            <input type="text" [(ngModel)]="form.middleName" name="middleName" placeholder="Tên đệm..." class="input-premium" />
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-bold text-gray-400 uppercase">Tên</label>
            <input type="text" [(ngModel)]="form.firstName" name="firstName" required placeholder="Tên..." class="input-premium" />
          </div>
        </div>

        <!-- Email -->
        <div class="space-y-1">
          <label class="text-[10px] font-bold text-gray-400 uppercase">Địa chỉ Email</label>
          <input type="email" [(ngModel)]="form.email" name="email" required placeholder="yourname&#64;example.com" class="input-premium" />
        </div>

        <!-- Password -->
        <div class="space-y-1">
          <label class="text-[10px] font-bold text-gray-400 uppercase">Mật khẩu</label>
          <input type="password" [(ngModel)]="form.password" name="password" required placeholder="••••••••" class="input-premium" />
        </div>

        <!-- Phone -->
        <div class="space-y-1">
          <label class="text-[10px] font-bold text-gray-400 uppercase">Số điện thoại</label>
          <input type="text" [(ngModel)]="form.phone" name="phone" placeholder="Số điện thoại..." class="input-premium" />
        </div>

        <!-- Address -->
        <div class="space-y-1">
          <label class="text-[10px] font-bold text-gray-400 uppercase">Địa chỉ mặc định</label>
          <input type="text" [(ngModel)]="form.address" name="address" placeholder="123 Nguyễn Huệ, Quận 1..." class="input-premium" />
        </div>

        <!-- Submit Button -->
        <button type="submit" 
                [disabled]="loading()"
                class="w-full py-4 px-4 font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 rounded-none shadow-lg text-center flex items-center justify-center space-x-2 cursor-pointer uppercase text-xs tracking-widest">
          @if (loading()) {
            <span>Đang đăng ký...</span>
          } @else {
            <span>Đăng ký tài khoản</span>
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
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  form = {
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  };
  
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  onSubmit(event: Event) {
    event.preventDefault();
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.register(this.form).subscribe({
      next: () => {
        this.loading.set(false);
        alert('Đăng ký thành công!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Có lỗi xảy ra trong quá trình đăng ký.');
      }
    });
  }
}
