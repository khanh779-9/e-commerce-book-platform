import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CategoryResponse, ProductResponse } from '../../../core/models/models';
import { ProductService } from '../../../core/services/product.service';
import { BookCardComponent } from '../../../shared/components/book-card/book-card';
import { ProductImagePipe } from '../../../shared/pipes/product-image.pipe';
import { AppIconComponent } from '../../../shared/components/icon/icon';
import { PRODUCT_IMAGE_FALLBACK } from '../../../core/utils/image';

@Component({
  selector: 'app-home', standalone: true, imports: [RouterLink, BookCardComponent, AppIconComponent, ProductImagePipe],
  template: `
    <div class="bg-paper">
      <section class="relative overflow-hidden border-b border-border bg-cream">
        <div class="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
        <div class="site-container relative grid min-h-[560px] items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:py-24">
          <div class="max-w-2xl">
            <p class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <app-icon name="sparkle" class="h-4 w-4" />
              BookZone · Nhà sách trực tuyến
            </p>
            <h1 class="mt-6 font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-secondary sm:text-6xl xl:text-7xl">
              Tìm một cuốn sách <em class="italic text-primary">đáng để</em> dành thời gian.
            </h1>
            <p class="mt-6 max-w-xl text-base leading-8 text-body sm:text-lg">Khám phá sách theo tác giả, thể loại, nhà xuất bản và những chương trình đang có. Thông tin giá, tồn kho và đánh giá được trình bày rõ ràng trước khi bạn mua.</p>
            <div class="mt-9 flex flex-wrap gap-3">
              <a routerLink="/products" class="btn-primary min-h-12 gap-2 px-7 text-base">Khám phá sách<app-icon name="arrow-right" class="h-[18px] w-[18px]"/></a>
              <a routerLink="/products" [queryParams]="{sortBy:'best_selling'}" class="btn-secondary min-h-12 px-7 text-base">Sách bán chạy</a>
            </div>
            <dl class="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-border-strong pt-7 text-sm">
              <div><dt class="flex items-center gap-1.5 text-muted"><app-icon name="book" class="h-4 w-4"/><span>Danh mục</span></dt><dd class="mt-1.5 font-serif text-2xl font-semibold text-secondary tnum">{{ categories().length }}</dd></div>
              <div><dt class="flex items-center gap-1.5 text-muted"><app-icon name="package" class="h-4 w-4"/><span>Tựa sách trong kho</span></dt><dd class="mt-1.5 font-serif text-2xl font-semibold text-secondary tnum">{{ bestTotal() }}</dd></div>
              <div><dt class="flex items-center gap-1.5 text-muted"><app-icon name="sparkle" class="h-4 w-4"/><span>Đang có ưu đãi</span></dt><dd class="mt-1.5 font-serif text-2xl font-semibold text-secondary tnum">{{ promoted().length }}</dd></div>
            </dl>
          </div>

          <div class="hidden lg:block">
            <div class="grid grid-cols-2 gap-5 border-l border-border-strong pl-10">
              @for (book of heroBooks(); track book.productId; let i = $index) {
                <a [routerLink]="['/products', book.productId]" class="group">
                  <div class="relative flex min-h-56 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface p-5 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                    @if (book.imageUrl && !heroFailed().has(book.productId)) {
                      <img [src]="book.imageUrl | productImage" [alt]="book.name" (error)="markHeroFailed(book.productId)" class="h-44 w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]" style="filter: drop-shadow(0 10px 14px rgb(36 30 23 / 0.16));" />
                    } @else {
                      <span class="max-w-40 text-center font-serif text-sm font-medium text-muted">{{ book.name }}</span>
                    }
                    <span class="absolute left-3 top-3 font-serif text-xs font-semibold text-muted">{{ pad(i) }}</span>
                  </div>
                  <p class="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">{{ book.bookDetails?.authorName || book.categoryName || 'BookZone' }}</p>
                  <h2 class="mt-1 line-clamp-2 font-serif text-base font-semibold text-secondary transition-colors group-hover:text-primary">{{ book.name }}</h2>
                </a>
              }
            </div>
          </div>
        </div>
      </section>

      <section class="site-container py-14 lg:py-20">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Khám phá nhanh</p>
            <h2 class="section-title mt-3">Danh mục sách</h2>
          </div>
          <a routerLink="/products" class="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-dark">Xem tất cả sách<app-icon name="arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-0.5"/></a>
        </div>
        <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (category of categories().slice(0, 8); track category.categoryId) {
            <a routerLink="/products" [queryParams]="{categoryId: category.categoryId}" class="group flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <div>
                <p class="font-serif text-lg font-semibold text-secondary transition-colors group-hover:text-primary">{{ category.name }}</p>
                <p class="mt-1 text-sm text-muted">{{ category.productCount || 0 }} sản phẩm</p>
              </div>
              <span class="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-muted transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                <app-icon name="arrow-right" class="h-4 w-4"/>
              </span>
            </a>
          }
        </div>
      </section>

      @if (promoted().length) {
        <section class="border-y border-border bg-cream">
          <div class="site-container py-14 lg:py-20">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Ưu đãi hiện tại</p>
                <h2 class="section-title mt-3">Sách đang giảm giá</h2>
              </div>
              <a routerLink="/products" [queryParams]="{promotedOnly:true}" class="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-dark">Xem ưu đãi<app-icon name="arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-0.5"/></a>
            </div>
            <div class="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
              @for (book of promoted(); track book.productId) { <app-book-card [product]="book" /> }
            </div>
          </div>
        </section>
      }

      <section class="site-container py-14 lg:py-20">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Được chọn nhiều</p>
            <h2 class="section-title mt-3">Sách bán chạy</h2>
          </div>
          <a routerLink="/products" [queryParams]="{sortBy:'best_selling'}" class="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-dark">Xem thêm<app-icon name="arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-0.5"/></a>
        </div>
        @if (loading()) {
          <div class="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4 2xl:grid-cols-5">
            <div class="skeleton aspect-[3/4] rounded-xl"></div>
            <div class="skeleton aspect-[3/4] rounded-xl"></div>
            <div class="skeleton aspect-[3/4] rounded-xl"></div>
            <div class="skeleton aspect-[3/4] rounded-xl"></div>
          </div>
        } @else {
          <div class="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            @for (book of bestSelling(); track book.productId) { <app-book-card [product]="book" /> }
          </div>
        }
      </section>

      @if (newest().length) {
        <section class="site-container pb-4 pt-14 lg:pb-6 lg:pt-20">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Vừa lên kệ</p>
              <h2 class="section-title mt-3">Sách mới về</h2>
            </div>
            <a routerLink="/products" [queryParams]="{sortBy:'newest'}" class="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-dark">Xem tất cả<app-icon name="arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-0.5"/></a>
          </div>
          <div class="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            @for (book of newest().slice(0, 5); track book.productId) { <app-book-card [product]="book" /> }
          </div>
        </section>
      }

      <section class="bg-secondary text-white">
        <div class="site-container grid gap-10 py-14 lg:grid-cols-3 lg:py-20">
          <div class="flex gap-4">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary-light"><app-icon name="shield" class="h-5 w-5"/></span>
            <div>
              <p class="font-serif text-lg font-semibold text-white">Thông tin minh bạch</p>
              <p class="mt-2 text-sm leading-6 text-[#c3cad6]">Giá bán, khuyến mãi, số lượng còn lại và thông tin xuất bản được đặt gần quyết định mua.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary-light"><app-icon name="package" class="h-5 w-5"/></span>
            <div>
              <p class="font-serif text-lg font-semibold text-white">Theo dõi đơn hàng</p>
              <p class="mt-2 text-sm leading-6 text-[#c3cad6]">Mỗi trạng thái từ chờ xác nhận đến giao thành công đều được lưu và hiển thị trong tài khoản.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary-light"><app-icon name="quote" class="h-5 w-5"/></span>
            <div>
              <p class="font-serif text-lg font-semibold text-white">Đánh giá từ người mua</p>
              <p class="mt-2 text-sm leading-6 text-[#c3cad6]">Khách hàng chỉ có thể gửi đánh giá sau khi đơn hàng đã được giao thành công.</p>
            </div>
          </div>
        </div>
      </section>
    </div>`
})
export class HomeComponent implements OnInit {
  private products = inject(ProductService);
  fallbackImg = PRODUCT_IMAGE_FALLBACK;
  loading = signal(true); categories = signal<CategoryResponse[]>([]); promoted = signal<ProductResponse[]>([]); bestSelling = signal<ProductResponse[]>([]); newest = signal<ProductResponse[]>([]);
  bestTotal = signal(0);
  heroBooks = () => (this.promoted().length ? this.promoted() : this.bestSelling()).slice(0, 4);
  heroFailed = signal(new Set<number>());
  markHeroFailed(id: number) { this.heroFailed.update(s => new Set(s).add(id)); }
  pad = (i: number) => String(i + 1).padStart(2, '0');
  ngOnInit() {
    forkJoin({ categories: this.products.getCategories(), promoted: this.products.getProducts({ promotedOnly: true, limit: 10 }), best: this.products.getProducts({ sortBy: 'best_selling', limit: 10 }), newest: this.products.getProducts({ sortBy: 'newest', limit: 10 }) }).subscribe({
      next: r => { this.categories.set(r.categories); this.promoted.set(r.promoted.items); this.bestSelling.set(r.best.items); this.newest.set(r.newest.items); this.bestTotal.set(r.best.total); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}