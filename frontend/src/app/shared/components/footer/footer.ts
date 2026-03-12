import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppIconComponent } from '../icon/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, AppIconComponent],
  template: `
    <footer class="mt-20 bg-secondary text-[#c3cad6] sm:mt-24">
      <div class="site-container py-14 sm:py-20">
        <div class="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.2fr_.8fr_.8fr_.9fr] lg:gap-8">
          <div class="lg:pr-10">
            <p class="font-serif text-3xl font-semibold tracking-tight text-white">Book<span class="text-primary-light">Zone</span></p>
            <p class="mt-4 max-w-sm text-sm leading-7">Nhà sách trực tuyến dành cho người yêu đọc. Chúng tôi tập trung vào trải nghiệm mua sách rõ ràng, nhanh và đáng tin cậy.</p>
            <div class="mt-6 flex items-center gap-2 text-xs text-[#8d97a4]">
              <app-icon name="shield" class="h-4 w-4 text-primary-light" />
              Thanh toán an toàn · Sách chính hãng
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold uppercase tracking-[0.16em] text-white">Khám phá</h3>
            <div class="mt-5 grid gap-3 text-sm">
              <a routerLink="/products" class="w-fit transition-colors hover:text-white">Tất cả sách</a>
              <a routerLink="/products" [queryParams]="{promotedOnly:true}" class="w-fit transition-colors hover:text-white">Sách đang giảm giá</a>
              <a routerLink="/products" [queryParams]="{sortBy:'best_selling'}" class="w-fit transition-colors hover:text-white">Sách bán chạy</a>
              <a routerLink="/wishlist" class="w-fit transition-colors hover:text-white">Danh sách yêu thích</a>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold uppercase tracking-[0.16em] text-white">Hỗ trợ</h3>
            <div class="mt-5 grid gap-3 text-sm">
              <a routerLink="/shipping-delivery" class="w-fit transition-colors hover:text-white">Giao hàng</a>
              <a routerLink="/return-policy" class="w-fit transition-colors hover:text-white">Đổi trả</a>
              <a routerLink="/warranty-policy" class="w-fit transition-colors hover:text-white">Bảo hành</a>
              <a routerLink="/contact" class="w-fit transition-colors hover:text-white">Liên hệ</a>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold uppercase tracking-[0.16em] text-white">Thông tin</h3>
            <div class="mt-5 grid gap-3 text-sm">
              <a routerLink="/about" class="w-fit transition-colors hover:text-white">Về BookZone</a>
              <a routerLink="/privacy-policy" class="w-fit transition-colors hover:text-white">Chính sách bảo mật</a>
              <p class="flex items-center gap-2"><app-icon name="clock" class="h-4 w-4 text-primary-light" />Hỗ trợ 08:00-21:00</p>
              <p class="flex items-center gap-2"><app-icon name="map-pin" class="h-4 w-4 text-primary-light" />120 Lê Lợi, Quận 1, TP.HCM</p>
            </div>
          </div>
        </div>

        <div class="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-[#8d97a4] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 BookZone. Nội dung phục vụ mục đích học tập và phát triển sản phẩm.</p>
          <p class="font-serif italic text-[#a7b0be]">"Sách là thế giới thu nhỏ trong tầm tay."</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}