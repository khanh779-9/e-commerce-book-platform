import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div>
      <div class="mb-8">
        <p class="eyebrow">Tạo tài khoản</p>
        <h1 class="mt-3 font-serif text-4xl font-semibold tracking-tight text-secondary">Bắt đầu với BookZone</h1>
        <p class="mt-3 text-sm leading-6 text-muted">Lưu thông tin cần thiết để mua sách và theo dõi đơn hàng thuận tiện hơn.</p>
      </div>

      @if (errorMessage()) {
        <div role="alert" class="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm text-red-800">{{ errorMessage() }}</div>
      }

      <form (submit)="onSubmit($event)" class="space-y-5">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="reg-last" class="field-label">Họ</label>
            <input id="reg-last" type="text" [(ngModel)]="form.lastName" name="lastName" required autocomplete="family-name" class="field" />
          </div>
          <div>
            <label for="reg-first" class="field-label">Tên</label>
            <input id="reg-first" type="text" [(ngModel)]="form.firstName" name="firstName" required autocomplete="given-name" class="field" />
          </div>
        </div>

        <div>
          <label for="reg-middle" class="field-label">Tên đệm <span class="font-normal text-muted">(không bắt buộc)</span></label>
          <input id="reg-middle" type="text" [(ngModel)]="form.middleName" name="middleName" autocomplete="additional-name" class="field" />
        </div>

        <div>
          <label for="reg-email" class="field-label">Email</label>
          <input id="reg-email" type="email" [(ngModel)]="form.email" name="email" required autocomplete="email" placeholder="you@example.com" class="field" />
        </div>

        <div>
          <label for="reg-password" class="field-label">Mật khẩu</label>
          <input id="reg-password" type="password" [(ngModel)]="form.password" name="password" required autocomplete="new-password" class="field" />
        </div>

        <div>
          <label for="reg-phone" class="field-label">Số điện thoại <span class="font-normal text-muted">(không bắt buộc)</span></label>
          <input id="reg-phone" type="tel" [(ngModel)]="form.phone" name="phone" autocomplete="tel" class="field" />
        </div>

        <div>
          <label for="reg-address" class="field-label">Địa chỉ mặc định <span class="font-normal text-muted">(không bắt buộc)</span></label>
          <input id="reg-address" type="text" [(ngModel)]="form.address" name="address" autocomplete="street-address" class="field" />
        </div>

        <button type="submit" [disabled]="loading()" class="btn-primary w-full min-h-12">
          {{ loading() ? 'Đang tạo tài khoản...' : 'Tạo tài khoản' }}
        </button>
      </form>

      <p class="mt-7 border-t border-border pt-6 text-sm text-muted">Đã có tài khoản? <a routerLink="/login" class="font-semibold text-primary hover:text-primary-dark">Đăng nhập</a></p>
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
  private toast = inject(ToastService);

  onSubmit(event: Event) {
    event.preventDefault();
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.register(this.form).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Đăng ký thành công! Chào mừng bạn đến với BookZone.');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Có lỗi xảy ra trong quá trình đăng ký.');
      }
    });
  }
}