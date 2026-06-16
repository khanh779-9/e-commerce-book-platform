import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AccountService, AddressResponse } from '../../core/services/account.service';
import { CartItemResponse } from '../../core/models/models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="bg-background min-h-screen pb-24 -mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        <!-- Header -->
        <div class="flex items-center gap-6 mb-12 border-b border-slate-100 pb-10">
          <a routerLink="/cart" class="p-3 text-slate-400 hover:text-primary transition-all bg-white border border-slate-200 rounded-none shadow-sm cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </a>
          <div>
            <h1 class="text-4xl font-black text-secondary uppercase tracking-tight">Thanh toán</h1>
            <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Bước cuối cùng để sở hữu sách</p>
          </div>
        </div>

        @if (cartItems().length === 0) {
          <div class="bg-white p-12 text-center border border-slate-200 rounded-none max-w-md mx-auto space-y-4">
            <p class="text-slate-400 font-bold text-sm">Giỏ hàng của bạn đang trống.</p>
            <a routerLink="/products" class="btn-dark px-6 py-3 text-xs uppercase tracking-widest">Quay lại cửa hàng</a>
          </div>
        } @else {
          
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <!-- Main Flow Form -->
            <form (submit)="onSubmit($event)" class="lg:col-span-7 space-y-12">
              
              <!-- 1. Delivery Address Selection -->
              <section class="space-y-6">
                <div class="flex items-center justify-between">
                  <h2 class="text-2xl font-black text-secondary uppercase tracking-tight">1. Địa chỉ giao hàng</h2>
                  <a routerLink="/account" class="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 hover:underline">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>Quản lý địa chỉ</span>
                  </a>
                </div>

                @if (addresses().length === 0) {
                  <div class="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-none text-center">
                    <p class="text-slate-400 font-bold mb-4 text-sm">Bạn chưa cấu hình địa chỉ giao hàng nào trong hồ sơ.</p>
                    <a routerLink="/account" class="btn-dark px-8 py-3 text-xs uppercase tracking-widest">Thêm địa chỉ ngay</a>
                  </div>
                } @else {
                  <div class="grid grid-cols-1 gap-4">
                    @for (addr of addresses(); track addr.addressId) {
                      <div (click)="selectedAddressId = addr.addressId"
                           [class]="selectedAddressId === addr.addressId ? 'border-slate-900 shadow-xl shadow-slate-200' : 'border-slate-200 hover:border-slate-300'"
                           class="relative p-6 rounded-none border-2 bg-white cursor-pointer transition-all flex items-start gap-4">
                        <div [class]="selectedAddressId === addr.addressId ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200'"
                             class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5">
                          @if (selectedAddressId === addr.addressId) {
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                              <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" />
                            </svg>
                          }
                        </div>
                        <div class="flex-1">
                          <p class="text-sm text-slate-700 leading-relaxed font-bold">{{ addr.address }}</p>
                        </div>
                      </div>
                    }
                  </div>
                }
              </section>

              <!-- 2. Payment Method -->
              <section class="space-y-6">
                <h2 class="text-2xl font-black text-secondary uppercase tracking-tight">2. Phương thức thanh toán</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div (click)="paymentMethod = 'tien_mat'"
                       [class]="paymentMethod === 'tien_mat' ? 'border-slate-900 shadow-xl shadow-slate-100' : 'border-slate-100 hover:border-slate-300'"
                       class="p-6 rounded-none border-2 bg-white cursor-pointer transition-all flex items-center gap-5">
                    <div class="text-4xl">💵</div>
                    <div>
                      <p class="font-black text-secondary text-sm uppercase tracking-tight">Tiền mặt (COD)</p>
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Thanh toán khi nhận hàng</p>
                    </div>
                  </div>

                  <div (click)="paymentMethod = 'chuyen_khoan'"
                       [class]="paymentMethod === 'chuyen_khoan' ? 'border-slate-900 shadow-xl shadow-slate-100' : 'border-slate-100 hover:border-slate-300'"
                       class="p-6 rounded-none border-2 bg-white cursor-pointer transition-all flex items-center gap-5">
                    <div class="text-4xl">🏦</div>
                    <div>
                      <p class="font-black text-secondary text-sm uppercase tracking-tight">Chuyển khoản</p>
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">An toàn & xác nhận nhanh</p>
                    </div>
                  </div>

                </div>
              </section>

              <!-- 3. Notes -->
              <section class="space-y-6">
                <h2 class="text-2xl font-black text-secondary uppercase tracking-tight">3. Ghi chú đơn hàng</h2>
                <textarea [(ngModel)]="notes" 
                          name="notes"
                          rows="4" 
                          placeholder="Yêu cầu đặc biệt cho shipper hoặc nhà sách..."
                          class="input-premium bg-white"></textarea>
              </section>

              <!-- Submit -->
              <button type="submit" 
                      [disabled]="submitting() || addresses().length === 0"
                      class="w-full bg-slate-900 text-white py-6 text-sm font-black uppercase tracking-widest rounded-none shadow-2xl transition-all hover:bg-slate-800 disabled:grayscale cursor-pointer">
                @if (submitting()) {
                  <span>Đang đặt hàng...</span>
                } @else {
                  <span>Xác nhận & Thanh toán</span>
                }
              </button>

            </form>

            <!-- Sidebar summary -->
            <div class="lg:col-span-5">
              <aside class="sticky top-24 space-y-6">
                
                <!-- Summary Card -->
                <div class="bg-white p-8 border border-slate-200 rounded-none shadow-xl shadow-slate-100">
                  <h3 class="text-xl font-black text-secondary uppercase tracking-tight mb-8 border-b border-slate-50 pb-4">Tóm tắt đơn hàng</h3>
                  
                  <div class="space-y-6 max-h-[350px] overflow-y-auto pr-3 mb-8">
                    @for (item of cartItems(); track item.productId) {
                      <div class="flex gap-4 group">
                        <div class="w-14 h-20 bg-slate-50 rounded-none overflow-hidden p-1 flex-shrink-0 border border-slate-100">
                          <img [src]="item.image || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=150'" class="w-full h-full object-contain" />
                        </div>
                        <div class="flex-grow min-w-0 flex flex-col justify-between py-1">
                          <p class="font-bold text-secondary text-sm line-clamp-1 group-hover:text-primary transition-colors uppercase tracking-tight">{{ item.name }}</p>
                          <div class="flex justify-between items-end">
                            <span class="text-[10px] font-black text-slate-400">SỐ LƯỢNG: {{ item.quantity }}</span>
                            <span class="font-black text-secondary text-sm">{{ item.subTotal | currency:'VND':'symbol-narrow':'1.0-0' }}</span>
                          </div>
                        </div>
                      </div>
                    }
                  </div>

                  <div class="space-y-4 pt-6 border-t border-slate-100">
                    <div class="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span>Tạm tính</span>
                      <span class="text-secondary">{{ totalAmount() | currency:'VND':'symbol-narrow':'1.0-0' }}</span>
                    </div>
                    <div class="flex justify-between text-xs font-bold text-emerald-500 uppercase tracking-widest">
                      <span>Phí vận chuyển</span>
                      <span>Miễn phí</span>
                    </div>
                    <div class="h-px bg-slate-100 my-2"></div>
                    <div class="flex justify-between items-end">
                      <span class="font-black text-secondary text-base uppercase tracking-tight">Tổng thanh toán</span>
                      <span class="text-3xl font-black text-primary tracking-tighter">{{ totalAmount() | currency:'VND':'symbol-narrow':'1.0-0' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Trust banner -->
                <div class="p-6 bg-slate-50 border border-slate-200 rounded-none space-y-4">
                  <div class="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    🔒 Giao dịch bảo mật 256-bit SSL
                  </div>
                  <div class="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    🚚 Giao hàng tiêu chuẩn 2-3 ngày
                  </div>
                </div>

              </aside>
            </div>

          </div>

        }

      </div>
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  private cartService = inject(CartService);
  private accountService = inject(AccountService);
  private router = inject(Router);

  cartItems = this.cartService.cartItems;
  totalAmount = this.cartService.cartTotal;

  addresses = signal<AddressResponse[]>([]);
  selectedAddressId = 0;
  paymentMethod = 'tien_mat';
  notes = '';
  submitting = signal<boolean>(false);

  ngOnInit() {
    this.accountService.getAddresses().subscribe(res => {
      this.addresses.set(res || []);
      if (res.length > 0) {
        this.selectedAddressId = res[0].addressId;
      }
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.selectedAddressId === 0) {
      alert('Vui lòng chọn địa chỉ giao hàng.');
      return;
    }

    this.submitting.set(true);
    this.cartService.checkout({
      addressId: this.selectedAddressId,
      paymentMethod: this.paymentMethod,
      notes: this.notes
    }).subscribe({
      next: (res) => {
        this.submitting.set(false);
        alert('Đặt hàng thành công! Cảm ơn bạn đã ủng hộ.');
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.submitting.set(false);
        alert(err?.error?.message || 'Lỗi đặt hàng.');
      }
    });
  }
}
