import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-12">
      <!-- Title Header -->
      <div class="border-b border-slate-100 pb-10">
        <h1 class="text-4xl font-black text-secondary uppercase tracking-tight">Giỏ hàng của bạn</h1>
        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Xem và điều chỉnh sách bạn đã chọn</p>
      </div>

      @if (cartItems().length === 0) {
        
        <!-- Empty State -->
        <div class="bg-white p-16 text-center border border-slate-200 rounded-none space-y-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.2" stroke="currentColor" class="w-16 h-16 text-slate-200 mx-auto">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          <h3 class="font-black text-secondary text-lg uppercase tracking-tight">Giỏ hàng trống</h3>
          <p class="text-xs text-slate-400 font-bold">Bạn chưa thêm cuốn sách nào vào giỏ hàng.</p>
          <a routerLink="/products" class="btn-dark px-10 py-4 uppercase text-xs tracking-widest">
            Bắt đầu mua sắm ngay
          </a>
        </div>

      } @else {
        
        <!-- Cart Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <!-- Item List -->
          <div class="lg:col-span-8 space-y-4">
            @for (item of cartItems(); track item.productId) {
              <div class="bg-white p-6 border border-slate-200 rounded-none flex items-center space-x-6">
                
                <!-- Product Image -->
                <div class="w-20 h-24 bg-slate-50 rounded-none overflow-hidden flex-shrink-0 border border-slate-100 p-1">
                  <img [src]="item.image || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=150'" 
                       [alt]="item.name" 
                       class="w-full h-full object-contain" />
                </div>

                <!-- Info -->
                <div class="flex-grow min-w-0">
                  <h3 class="font-black text-secondary text-sm truncate hover:text-primary transition-colors cursor-pointer uppercase tracking-tight" [routerLink]="['/products', item.productId]">
                    {{ item.name }}
                  </h3>
                  <span class="text-xs font-bold text-primary">{{ item.price | currency:'VND':'symbol-narrow':'1.0-0' }}</span>
                </div>

                <!-- Quantity controls -->
                <div class="flex items-center border border-slate-200 rounded-none shadow-sm">
                  <button (click)="updateQty(item.productId, item.quantity - 1)" class="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-sm font-bold cursor-pointer">-</button>
                  <span class="w-10 text-center text-xs font-black">{{ item.quantity }}</span>
                  <button (click)="updateQty(item.productId, item.quantity + 1)" class="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-sm font-bold cursor-pointer">+</button>
                </div>

                <!-- Subtotal -->
                <div class="text-right flex-shrink-0">
                  <p class="text-sm font-black text-secondary">{{ item.subTotal | currency:'VND':'symbol-narrow':'1.0-0' }}</p>
                  <button (click)="removeItem(item.productId)" class="text-xs font-black text-rose-500 hover:text-rose-600 cursor-pointer mt-1">Xóa</button>
                </div>

              </div>
            }
          </div>

          <!-- Summary / Routing Panel -->
          <div class="lg:col-span-4">
            <div class="bg-white p-8 border border-slate-200 rounded-none shadow-xl shadow-slate-100 space-y-6 sticky top-24">
              <h3 class="text-xl font-black text-secondary uppercase tracking-tight mb-4 border-b border-slate-50 pb-4">Tổng cộng đơn hàng</h3>
              
              <div class="space-y-4">
                <div class="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span>Tạm tính</span>
                  <span class="text-secondary">{{ totalAmount() | currency:'VND':'symbol-narrow':'1.0-0' }}</span>
                </div>
                <div class="flex justify-between text-xs font-bold text-emerald-500 uppercase tracking-widest">
                  <span>Phí vận chuyển</span>
                  <span>Miễn phí</span>
                </div>
                
                <div class="border-t border-slate-100 pt-6 flex justify-between items-end">
                  <span class="text-sm font-black text-secondary uppercase tracking-tight">Tổng thanh toán</span>
                  <span class="text-3xl font-black text-primary tracking-tighter">{{ totalAmount() | currency:'VND':'symbol-narrow':'1.0-0' }}</span>
                </div>

                @if (isAuthenticated()) {
                  <a routerLink="/checkout"
                     class="block w-full bg-slate-900 text-white py-5 text-xs font-black uppercase tracking-widest rounded-none text-center shadow-xl hover:bg-slate-800 transition-all transform active:scale-95">
                    Tiến hành thanh toán
                  </a>
                } @else {
                  <div class="bg-blue-50/50 p-6 rounded-none border border-blue-100 text-center space-y-3 mt-4">
                    <h3 class="font-bold text-slate-800 text-xs uppercase tracking-widest">Đăng nhập để đặt sách</h3>
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">Bạn cần đăng nhập tài khoản khách hàng để tiếp tục thanh toán đơn hàng này.</p>
                    <a routerLink="/login" class="inline-block w-full py-3 px-4 font-black text-white bg-primary hover:bg-primary-dark rounded-none text-xs uppercase tracking-widest transition-all">
                      Đăng Nhập Ngay
                    </a>
                  </div>
                }
              </div>
            </div>
          </div>

        </div>

      }
    </div>
  `
})
export class CartComponent {
  cartService = inject(CartService);
  authService = inject(AuthService);

  cartItems = this.cartService.cartItems;
  totalAmount = this.cartService.cartTotal;
  isAuthenticated = this.authService.isAuthenticated;

  updateQty(productId: number, quantity: number) {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeItem(productId: number) {
    this.cartService.removeFromCart(productId);
  }
}
