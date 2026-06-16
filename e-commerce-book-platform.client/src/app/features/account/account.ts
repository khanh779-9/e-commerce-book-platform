import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccountService, AddressResponse } from '../../core/services/account.service';
import { AuthService } from '../../core/services/auth.service';
import { CustomerResponse } from '../../core/models/models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="bg-background min-h-screen pb-20 -mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- Sidebar -->
          <aside class="lg:col-span-3">
            <div class="bg-white border border-slate-200 rounded-none shadow-xl shadow-slate-200/50">
              <div class="p-8 text-center border-b border-slate-100">
                <div class="w-24 h-24 mx-auto bg-slate-900 text-white flex items-center justify-center text-3xl font-black rounded-none mb-4 shadow-lg uppercase">
                  {{ getInitials() }}
                </div>
                <h2 class="text-xl font-black text-secondary uppercase tracking-tight truncate">{{ profile.firstName }} {{ profile.lastName }}</h2>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 truncate">{{ authService.currentUser()?.email }}</p>
              </div>

              <nav class="p-4 space-y-1">
                <button (click)="activeTab = 'info'" 
                        [class]="activeTab === 'info' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'"
                        class="w-full flex items-center gap-3 p-4 rounded-none text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer">
                  👤 Thông tin cá nhân
                </button>
                <button (click)="activeTab = 'addresses'" 
                        [class]="activeTab === 'addresses' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'"
                        class="w-full flex items-center gap-3 p-4 rounded-none text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer">
                  📍 Sổ địa chỉ
                </button>
                <button (click)="activeTab = 'password'" 
                        [class]="activeTab === 'password' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'"
                        class="w-full flex items-center gap-3 p-4 rounded-none text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer">
                  🔑 Bảo mật tài khoản
                </button>
                <a routerLink="/orders" class="w-full flex items-center justify-between p-4 rounded-none text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition">
                  <span class="flex items-center gap-3">📦 Đơn hàng của tôi</span>
                </a>
                <a routerLink="/wishlist" class="w-full flex items-center gap-3 p-4 rounded-none text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition">
                  ❤️ Sản phẩm yêu thích
                </a>
              </nav>
            </div>
          </aside>

          <!-- Main Content Area -->
          <main class="lg:col-span-9 space-y-8">
            
            <!-- Tab: Personal Profile -->
            @if (activeTab === 'info') {
              <section class="bg-white border border-slate-200 rounded-none shadow-sm p-8 space-y-6">
                <div>
                  <h3 class="text-2xl font-black text-secondary uppercase tracking-tight">Thông tin cá nhân</h3>
                  <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Cập nhật hồ sơ để nhận nhiều ưu đãi hơn</p>
                </div>

                <form (submit)="onUpdateProfile($event)" class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="space-y-1">
                      <label class="text-xs font-bold text-gray-400 uppercase">Họ</label>
                      <input type="text" [(ngModel)]="profile.lastName" name="lastName" class="input-premium bg-slate-50/50 border-slate-200" required />
                    </div>
                    <div class="space-y-1">
                      <label class="text-xs font-bold text-gray-400 uppercase">Tên đệm</label>
                      <input type="text" [(ngModel)]="profile.middleName" name="middleName" class="input-premium bg-slate-50/50 border-slate-200" />
                    </div>
                    <div class="space-y-1">
                      <label class="text-xs font-bold text-gray-400 uppercase">Tên</label>
                      <input type="text" [(ngModel)]="profile.firstName" name="firstName" class="input-premium bg-slate-50/50 border-slate-200" required />
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-1">
                      <label class="text-xs font-bold text-gray-400 uppercase">Số điện thoại</label>
                      <input type="text" [(ngModel)]="profile.phone" name="phone" class="input-premium bg-slate-50/50 border-slate-200" />
                    </div>
                    <div class="space-y-1">
                      <label class="text-xs font-bold text-gray-400 uppercase">Ngày sinh</label>
                      <input type="date" [(ngModel)]="profile.birthDate" name="birthDate" class="input-premium bg-slate-50/50 border-slate-200" />
                    </div>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-400 uppercase">Địa chỉ mặc định</label>
                    <input type="text" [(ngModel)]="profile.address" name="address" class="input-premium bg-slate-50/50 border-slate-200" />
                  </div>
                  <button type="submit" class="btn-dark px-10 py-4 uppercase text-xs tracking-widest font-black cursor-pointer">
                    Cập nhật hồ sơ
                  </button>
                </form>
              </section>
            }

            <!-- Tab: Addresses Manager -->
            @if (activeTab === 'addresses') {
              <section class="bg-white border border-slate-200 rounded-none shadow-sm p-8 space-y-8">
                <div>
                  <h3 class="text-2xl font-black text-secondary uppercase tracking-tight">Sổ địa chỉ giao hàng</h3>
                  <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Lưu các địa điểm nhận hàng của bạn</p>
                </div>

                <!-- Address Input Form -->
                <form (submit)="onAddAddress($event)" class="flex gap-4">
                  <input type="text" [(ngModel)]="newAddressString" name="newAddr" placeholder="Nhập địa chỉ giao hàng mới..." class="input-premium flex-grow" required />
                  <button type="submit" class="btn-dark px-8 uppercase text-xs tracking-widest font-black shrink-0 cursor-pointer">
                    Thêm địa chỉ
                  </button>
                </form>

                <!-- Address List -->
                <div class="space-y-4">
                  @for (addr of addresses(); track addr.addressId) {
                    <div class="p-5 border border-slate-200 bg-white flex justify-between items-center gap-6">
                      <div class="flex-grow">
                        <p class="text-sm font-bold text-secondary">{{ addr.address }}</p>
                      </div>
                      <button (click)="onDeleteAddress(addr.addressId)" class="text-xs font-black text-rose-500 hover:text-rose-600 cursor-pointer">
                        Xóa
                      </button>
                    </div>
                  } @empty {
                    <p class="text-slate-400 text-xs font-bold text-center py-10 bg-slate-50">Bạn chưa lưu địa chỉ giao hàng nào.</p>
                  }
                </div>
              </section>
            }

            <!-- Tab: Password Settings -->
            @if (activeTab === 'password') {
              <section class="bg-white border border-slate-200 rounded-none shadow-sm p-8 space-y-6">
                <div>
                  <h3 class="text-2xl font-black text-secondary uppercase tracking-tight">Bảo mật tài khoản</h3>
                  <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sử dụng mật khẩu mạnh để bảo vệ tài khoản</p>
                </div>

                <form (submit)="onChangePassword($event)" class="space-y-6 max-w-xl">
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-400 uppercase">Mật khẩu hiện tại</label>
                    <input type="password" [(ngModel)]="passwords.oldPassword" name="oldPass" class="input-premium bg-slate-50/50 border-slate-200" required />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-400 uppercase">Mật khẩu mới</label>
                    <input type="password" [(ngModel)]="passwords.newPassword" name="newPass" class="input-premium bg-slate-50/50 border-slate-200" required />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-400 uppercase">Xác nhận mật khẩu mới</label>
                    <input type="password" [(ngModel)]="passwords.confirmPassword" name="confirmPass" class="input-premium bg-slate-50/50 border-slate-200" required />
                  </div>
                  <button type="submit" class="btn-dark px-10 py-4 uppercase text-xs tracking-widest font-black cursor-pointer">
                    Đổi mật khẩu
                  </button>
                </form>
              </section>
            }

          </main>

        </div>
      </div>
    </div>
  `
})
export class AccountComponent implements OnInit {
  accountService = inject(AccountService);
  authService = inject(AuthService);

  activeTab = 'info';

  profile = {
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    birthDate: '',
    address: '',
    gender: ''
  };

  addresses = signal<AddressResponse[]>([]);
  newAddressString = '';

  passwords = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  ngOnInit() {
    this.accountService.getAccount().subscribe(res => {
      if (res && res.data) {
        const u = res.data;
        this.profile = {
          firstName: u.firstName || '',
          middleName: u.middleName || '',
          lastName: u.lastName || '',
          phone: u.phone || '',
          birthDate: u.birthDate ? u.birthDate.split('T')[0] : '',
          address: u.address || '',
          gender: u.gender || ''
        };
      }
    });

    this.loadAddresses();
  }

  loadAddresses() {
    this.accountService.getAddresses().subscribe(res => {
      this.addresses.set(res || []);
    });
  }

  getInitials(): string {
    const fn = this.profile.firstName || '';
    const ln = this.profile.lastName || '';
    return `${ln[0] || ''}${fn[0] || ''}`.toUpperCase();
  }

  onUpdateProfile(event: Event) {
    event.preventDefault();
    this.accountService.updateProfile(this.profile).subscribe({
      next: (res) => {
        alert('Cập nhật hồ sơ thành công!');
        if (res.data) {
          this.authService.currentUser.set(res.data);
        }
      },
      error: (err) => {
        alert(err?.error?.message || 'Có lỗi xảy ra.');
      }
    });
  }

  onAddAddress(event: Event) {
    event.preventDefault();
    if (!this.newAddressString) return;

    this.accountService.addAddress(this.newAddressString).subscribe({
      next: () => {
        this.newAddressString = '';
        this.loadAddresses();
        alert('Thêm địa chỉ thành công!');
      },
      error: (err) => {
        alert(err?.error?.message || 'Có lỗi xảy ra.');
      }
    });
  }

  onDeleteAddress(id: number) {
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;

    this.accountService.deleteAddress(id).subscribe({
      next: () => {
        this.loadAddresses();
        alert('Xóa địa chỉ thành công!');
      }
    });
  }

  onChangePassword(event: Event) {
    event.preventDefault();
    if (this.passwords.newPassword !== this.passwords.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp.');
      return;
    }

    this.accountService.changePassword({
      oldPassword: this.passwords.oldPassword,
      newPassword: this.passwords.newPassword
    }).subscribe({
      next: () => {
        this.passwords = { oldPassword: '', newPassword: '', confirmPassword: '' };
        alert('Đổi mật khẩu thành công!');
      },
      error: (err) => {
        alert(err?.error?.message || 'Có lỗi xảy ra.');
      }
    });
  }
}
