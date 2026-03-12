import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AppIconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, AppIconComponent],
  template: `
    <div class="min-h-screen bg-paper lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(460px,600px)]">
      <aside class="relative hidden overflow-hidden bg-secondary lg:flex lg:flex-col lg:justify-between lg:p-14 xl:p-20">
        <div class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"></div>
        <div class="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-primary-light/10 blur-3xl"></div>

        <a routerLink="/" class="relative z-10 font-serif text-2xl font-semibold tracking-tight text-white">
          Book<span class="text-primary-light">Zone</span>
        </a>

        <div class="relative z-10 max-w-xl">
          <p class="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-primary-light">
            <app-icon name="book" class="h-4 w-4" />
            Không gian dành cho người yêu sách
          </p>
          <h1 class="mt-6 font-serif text-5xl font-semibold leading-[1.08] text-white xl:text-6xl">
            Tìm cuốn sách <em class="italic text-primary-light">tiếp theo</em> của bạn.
          </h1>
          <p class="mt-6 max-w-lg text-base leading-8 text-[#c3cad6]">Đăng nhập để lưu sách yêu thích, quản lý địa chỉ và theo dõi đơn hàng trong một nơi gọn gàng.</p>

          <div class="mt-10 flex gap-8 border-t border-white/10 pt-8 text-sm">
            <div><p class="font-serif text-2xl font-semibold text-white">10k+</p><p class="mt-1 text-xs text-[#8d97a4]">Đầu sách</p></div>
            <div><p class="font-serif text-2xl font-semibold text-white">4.8/5</p><p class="mt-1 text-xs text-[#8d97a4]">Đánh giá người mua</p></div>
            <div><p class="font-serif text-2xl font-semibold text-white">100%</p><p class="mt-1 text-xs text-[#8d97a4]">Sách chính hãng</p></div>
          </div>
        </div>

        <p class="relative z-10 text-xs text-[#8d97a4]">BookZone · 2026</p>
      </aside>

      <section class="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 lg:px-14">
        <div class="w-full max-w-md">
          <a routerLink="/" class="mb-10 inline-flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight text-secondary lg:hidden">
            Book<span class="text-primary">Zone</span>
          </a>
          <router-outlet></router-outlet>
        </div>
      </section>
    </div>
  `
})
export class AuthLayoutComponent {}