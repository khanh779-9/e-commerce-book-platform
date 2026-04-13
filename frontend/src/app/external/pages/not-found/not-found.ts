import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppIconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, AppIconComponent],
  template: `
    <div class="bg-paper">
      <div class="site-container flex min-h-[62vh] flex-col items-center justify-center py-20 text-center">
        <p class="pointer-events-none select-none font-serif text-[110px] font-semibold leading-none tracking-tight text-primary/15 sm:text-[150px]">
          404
        </p>
        <div class="-mt-12 sm:-mt-16">
          <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream text-primary shadow-sm">
            <app-icon name="book" class="h-7 w-7" />
          </span>
          <h1 class="mt-6 font-serif text-3xl font-semibold text-secondary sm:text-4xl">Không tìm thấy trang này</h1>
          <p class="mx-auto mt-4 max-w-md text-base leading-7 text-body">
            Trang bạn tìm không tồn tại hoặc đã đổi địa chỉ. Thử quay về cửa hàng và tìm cuốn sách bạn đang cần nhé.
          </p>
          <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a routerLink="/" class="btn-primary min-h-11 gap-2 px-6">Về trang chủ</a>
            <a routerLink="/products" class="btn-secondary min-h-11 px-6">Khám phá sách</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent {}
