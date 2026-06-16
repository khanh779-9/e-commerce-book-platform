import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-secondary text-slate-400 py-16 border-t border-slate-800 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <!-- Column 1: Brand -->
          <div class="space-y-6">
            <a routerLink="/" class="flex items-center space-x-3">
              <span class="w-8 h-8 rounded-none bg-white text-secondary flex items-center justify-center font-black text-xl shadow-md">B</span>
              <span class="text-xl font-black text-white uppercase tracking-tighter italic">BookZone</span>
            </a>
            <p class="text-xs text-slate-500 leading-relaxed font-semibold">
              Nền tảng thương mại điện tử uy tín hàng đầu cung cấp hàng ngàn đầu sách chính hãng, chọn lọc kỹ lưỡng từ các nhà xuất bản uy tín trong và ngoài nước.
            </p>
          </div>

          <!-- Column 2: Policies -->
          <div>
            <h4 class="text-white font-black text-xs uppercase tracking-widest mb-6">Chính Sách</h4>
            <ul class="space-y-3 text-xs font-bold uppercase tracking-wider">
              <li><a routerLink="/privacy-policy" class="hover:text-white transition-colors">Chính Sách Bảo Mật</a></li>
              <li><a routerLink="/return-policy" class="hover:text-white transition-colors">Chính Sách Đổi Trả</a></li>
              <li><a routerLink="/warranty-policy" class="hover:text-white transition-colors">Chính Sách Bảo Hành</a></li>
              <li><a routerLink="/shipping-delivery" class="hover:text-white transition-colors">Vận Chuyển & Giao Hàng</a></li>
            </ul>
          </div>

          <!-- Column 3: Navigation -->
          <div>
            <h4 class="text-white font-black text-xs uppercase tracking-widest mb-6">Liên Kết Nhanh</h4>
            <ul class="space-y-3 text-xs font-bold uppercase tracking-wider">
              <li><a routerLink="/products" class="hover:text-white transition-colors">Tất Cả Sách</a></li>
              <li><a routerLink="/about" class="hover:text-white transition-colors">Giới Thiệu</a></li>
              <li><a routerLink="/contact" class="hover:text-white transition-colors">Liên Hệ</a></li>
            </ul>
          </div>

          <!-- Column 4: Contact -->
          <div class="space-y-4">
            <h4 class="text-white font-black text-xs uppercase tracking-widest mb-6">Thông Tin Liên Hệ</h4>
            <ul class="space-y-3 text-xs font-semibold">
              <li class="flex items-center space-x-2">
                <span>Email: support&#64;bookzone.com</span>
              </li>
              <li class="flex items-center space-x-2">
                <span>Hotline: 1900 6789</span>
              </li>
              <li class="flex items-center space-x-2">
                <span>Địa chỉ: 120 Lê Lợi, Bến Thành, Quận 1, TP. Hồ Chí Minh</span>
              </li>
            </ul>
          </div>

        </div>

        <div class="border-t border-slate-800 mt-12 pt-8 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          <p>&copy; 2026 BookZone. All rights reserved. Designed to Match React Bookstore.</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
