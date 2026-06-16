import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20 items-center">
          
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <a routerLink="/" class="flex items-center space-x-3">
              <span class="w-10 h-10 rounded-none bg-slate-900 flex items-center justify-center text-white font-black text-2xl tracking-tighter shadow-md">B</span>
              <span class="text-2xl font-black text-secondary uppercase tracking-tighter italic">BookZone</span>
            </a>
          </div>

          <!-- Nav Links -->
          <div class="hidden md:flex space-x-10">
            <a routerLink="/" routerLinkActive="text-primary border-b-2 border-primary" [routerLinkActiveOptions]="{exact: true}"
               class="text-slate-500 hover:text-slate-900 py-6 text-xs font-black uppercase tracking-widest transition-all">
              Trang Chủ
            </a>
            <a routerLink="/products" routerLinkActive="text-primary border-b-2 border-primary"
               class="text-slate-500 hover:text-slate-900 py-6 text-xs font-black uppercase tracking-widest transition-all">
              Cửa Hàng
            </a>
            <a routerLink="/about" routerLinkActive="text-primary border-b-2 border-primary"
               class="text-slate-500 hover:text-slate-900 py-6 text-xs font-black uppercase tracking-widest transition-all">
              Giới Thiệu
            </a>
            <a routerLink="/contact" routerLinkActive="text-primary border-b-2 border-primary"
               class="text-slate-500 hover:text-slate-900 py-6 text-xs font-black uppercase tracking-widest transition-all">
              Liên Hệ
            </a>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-6">
            
            <!-- Wishlist -->
            <a routerLink="/wishlist" class="relative p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Danh sách yêu thích">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5.5 h-5.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </a>

            <!-- Notifications -->
            @if (isAuthenticated()) {
              <a routerLink="/notifications" class="relative p-2 text-slate-400 hover:text-primary transition-colors" title="Thông báo">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5.5 h-5.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
              </a>
            }

            <!-- Cart -->
            <a routerLink="/cart" class="relative p-2 text-slate-400 hover:text-primary transition-colors" title="Giỏ hàng">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5.5 h-5.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              @if (cartCount() > 0) {
                <span class="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-black leading-none text-white bg-primary rounded-none transform translate-x-1/2 -translate-y-1/2">
                  {{ cartCount() }}
                </span>
              }
            </a>

            <!-- Profile / Auth -->
            @if (isAuthenticated()) {
              <div class="flex items-center space-x-4 pl-4 border-l border-slate-200">
                <a routerLink="/account" class="text-xs font-black text-secondary uppercase tracking-widest hover:text-primary transition-colors">
                  {{ currentUser()?.displayName }}
                </a>
                <button (click)="logout()" class="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 cursor-pointer">
                  Đăng xuất
                </button>
              </div>
            } @else {
              <a routerLink="/login" class="btn-dark px-6 py-2.5 text-xs uppercase tracking-widest shadow-lg shadow-slate-200">
                Đăng Nhập
              </a>
            }
          </div>

        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);

  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;
  cartCount = this.cartService.cartCount;

  logout() {
    this.authService.logout();
  }
}
