import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { ProductResponse } from '../../core/models/models';
import { BookCardComponent } from '../../shared/components/book-card/book-card';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

const BANNERS = [
  { id: 1, title: "TRI THỨC LÀ SỨC MẠNH", desc: "Giảm đến 50% cho toàn bộ sách giáo khoa và tham khảo.", image: "/assets/banners/1600w-iUbywlem9dU.jpg" },
  { id: 2, title: "FLASH SALE CUỐI TUẦN", desc: "Sách mới đồng giá từ 49k. Chỉ diễn ra trong 48 giờ!", image: "/assets/banners/ROHTO_Main-Banner-Web.webp" },
  { id: 3, title: "THẾ GIỚI TRUYỆN TRANH", desc: "Cập nhật những tập mới nhất từ các nhà xuất bản hàng đầu.", image: "/assets/banners/banner-fb-post-1800_1200-px_b670871b6d974df8bca2fbfa4dc558f6_1024x1024.png" },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, BookCardComponent],
  template: `
    <div class="space-y-20 bg-white pb-20 -mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
      
      <!-- Hero Banner Section -->
      <section class="relative h-[400px] md:h-[600px] overflow-hidden bg-slate-900">
        <div class="absolute inset-0">
          <img [src]="banners[currentBanner].image" class="w-full h-full object-cover opacity-60 transition-all duration-1000" alt="" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
          <div class="absolute inset-0 flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-8">
            <div class="max-w-4xl space-y-6">
              <span class="text-primary font-black uppercase tracking-[0.4em] text-xs block">Độc quyền tại BookZone</span>
              <h2 class="text-4xl md:text-7xl font-black text-white leading-none uppercase tracking-tighter italic">
                {{ banners[currentBanner].title }}
              </h2>
              <p class="text-slate-300 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
                {{ banners[currentBanner].desc }}
              </p>
              <a routerLink="/products" class="inline-flex items-center gap-4 bg-white text-slate-900 px-10 py-5 font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-2xl rounded-none">
                Khám phá bộ sưu tập
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Banner Controls -->
        <div class="absolute bottom-10 right-10 flex gap-4 z-20">
          <button (click)="moveBanner(-1)" class="w-14 h-14 border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all rounded-none cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button (click)="moveBanner(1)" class="w-14 h-14 border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all rounded-none cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </section>

      <!-- Feature Icons -->
      <section class="py-12 border-b border-slate-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div class="flex flex-col items-center text-center group">
            <div class="w-16 h-16 bg-slate-50 flex items-center justify-center text-slate-400 mb-4 group-hover:bg-primary group-hover:text-white transition-all rounded-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.75a1.125 1.125 0 0 1-1.125-1.125V15m1.5 3.75a3 3 0 0 0-3-3m13.5 3.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.5m-9 0h9m-9-1.5h.008v.008H9.75v-.008Zm0-3h.008v.008H9.75v-.008Zm1.5-4.5h.008v.008h-.008V11.25ZM9.75 8.25h.008v.008H9.75V8.25Zm0 3h.008v.008H9.75v-.008Zm9-3h.008v.008H18.75V8.25Zm-3 0h.008v.008h-.008V8.25ZM15.75 5.25h.008v.008h-.008V5.25Zm-3 0h.008v.008h-.008V5.25Zm-1.5-1.5h.008v.008h-.008v-.008Zm3 0h.008v.008h-.008v-.008Zm3 0h.008v.008h-.008v-.008Zm-6 3h.008v.008h-.008V8.25Zm0 3h.008v.008h-.008v-.008Zm3 3h.008v.008h-.008v-.008Zm3 0h.008v.008h-.008v-.008Zm3 0h.008v.008h-.008v-.008Zm-9 0h.008v.008H9.75v-.008Zm-3 0h.008v.008H6.75v-.008Zm-3 0h.008v.008H3.75v-.008Z" />
              </svg>
            </div>
            <h3 class="text-xs font-black text-secondary tracking-widest mb-1 uppercase">GIAO HÀNG HỎA TỐC</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nhận sách ngay trong ngày</p>
          </div>

          <div class="flex flex-col items-center text-center group">
            <div class="w-16 h-16 bg-slate-50 flex items-center justify-center text-slate-400 mb-4 group-hover:bg-primary group-hover:text-white transition-all rounded-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <h3 class="text-xs font-black text-secondary tracking-widest mb-1 uppercase">THANH TOÁN AN TOÀN</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bảo mật thông tin 100%</p>
          </div>

          <div class="flex flex-col items-center text-center group">
            <div class="w-16 h-16 bg-slate-50 flex items-center justify-center text-slate-400 mb-4 group-hover:bg-primary group-hover:text-white transition-all rounded-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499c.173-.427.76-.427.933 0l2.4 5.022 5.302.235c.468.02.657.58.294.87l-4.03 3.22 1.14 5.19c.102.46-.395.823-.807.575l-4.502-2.71-4.503 2.71c-.412.248-.909-.115-.807-.575l1.14-5.19-4.03-3.22c-.363-.29-.174-.85.294-.87l5.302-.235 2.4-5.022Z" />
              </svg>
            </div>
            <h3 class="text-xs font-black text-secondary tracking-widest mb-1 uppercase">SÁCH CHÍNH HÃNG</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tuyển chọn từ NXB uy tín</p>
          </div>

          <div class="flex flex-col items-center text-center group">
            <div class="w-16 h-16 bg-slate-50 flex items-center justify-center text-slate-400 mb-4 group-hover:bg-primary group-hover:text-white transition-all rounded-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <h3 class="text-xs font-black text-secondary tracking-widest mb-1 uppercase">ƯU ĐÃI KHỦNG</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giảm giá lên đến 70%</p>
          </div>

        </div>
      </section>

      <!-- Discounted Books -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h2 class="text-2xl md:text-3xl font-black text-secondary uppercase tracking-tight flex items-center gap-3">
            <span class="w-2.5 h-6 bg-rose-500 inline-block"></span>
            Sách đang giảm giá
          </h2>
          <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ưu đãi cực lớn dành riêng cho bạn</p>
        </div>

        @if (loadingDiscounted()) {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            @for (x of [1,2,3,4]; track x) {
              <div class="animate-pulse space-y-4">
                <div class="aspect-[4/5] bg-slate-100"></div>
                <div class="h-4 bg-slate-100 w-3/4"></div>
                <div class="h-3 bg-slate-100 w-1/2"></div>
              </div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            @for (prod of discounted(); track prod.productId) {
              <app-book-card [product]="prod"></app-book-card>
            } @empty {
              <div class="col-span-full py-12 text-center text-slate-400 text-sm">Chưa có sản phẩm giảm giá nào.</div>
            }
          </div>
        }
      </section>

      <!-- Middle Banner / Newsletter -->
      <section class="py-20 bg-slate-900 overflow-hidden relative">
        <div class="absolute top-0 right-0 w-1/3 h-full bg-primary/10 -skew-x-12 translate-x-1/2"></div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="flex flex-col md:flex-row items-center justify-between gap-12">
            <div class="flex-1 space-y-6">
              <span class="text-primary font-black uppercase tracking-widest text-[10px] block">Newsletter</span>
              <h2 class="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                Đăng ký nhận <br/> Ưu đãi 20%
              </h2>
              <p class="text-slate-400 text-sm md:text-base max-w-lg font-medium leading-relaxed">
                Đừng bỏ lỡ những đầu sách hay nhất và các chương trình khuyến mãi độc quyền hàng tuần.
              </p>
              <form class="flex max-w-md bg-white/5 p-1 border border-white/10" (submit)="$event.preventDefault()">
                <input type="email" placeholder="Địa chỉ email của bạn..." class="flex-1 bg-transparent px-6 py-4 text-white text-sm outline-none font-bold placeholder-slate-600" />
                <button class="bg-primary text-white px-8 font-black uppercase text-xs tracking-widest hover:bg-white hover:text-slate-900 transition-all rounded-none cursor-pointer">Gửi ngay</button>
              </form>
            </div>
            <div class="hidden lg:flex w-96 h-96 border-[40px] border-primary/20 rounded-full items-center justify-center">
              <span class="text-9xl font-black text-white/5 select-none tracking-tighter">BOK</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Best Sellers -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h2 class="text-2xl md:text-3xl font-black text-secondary uppercase tracking-tight flex items-center gap-3">
            <span class="w-2.5 h-6 bg-amber-500 inline-block"></span>
            Sách bán chạy
          </h2>
          <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Những tựa sách được yêu thích nhất</p>
        </div>

        @if (loadingBestSellers()) {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            @for (x of [1,2,3,4]; track x) {
              <div class="animate-pulse space-y-4">
                <div class="aspect-[4/5] bg-slate-100"></div>
                <div class="h-4 bg-slate-100 w-3/4"></div>
                <div class="h-3 bg-slate-100 w-1/2"></div>
              </div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            @for (prod of bestSellers(); track prod.productId) {
              <app-book-card [product]="prod"></app-book-card>
            } @empty {
              <div class="col-span-full py-12 text-center text-slate-400 text-sm">Chưa có sản phẩm bán chạy nào.</div>
            }
          </div>
        }
      </section>

      <!-- Newest Products -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h2 class="text-2xl md:text-3xl font-black text-secondary uppercase tracking-tight flex items-center gap-3">
            <span class="w-2.5 h-6 bg-primary inline-block"></span>
            Sách mới cập bến
          </h2>
          <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Vừa lên kệ tại nhà sách</p>
        </div>

        @if (loadingNewest()) {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            @for (x of [1,2,3,4]; track x) {
              <div class="animate-pulse space-y-4">
                <div class="aspect-[4/5] bg-slate-100"></div>
                <div class="h-4 bg-slate-100 w-3/4"></div>
                <div class="h-3 bg-slate-100 w-1/2"></div>
              </div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            @for (prod of newest(); track prod.productId) {
              <app-book-card [product]="prod"></app-book-card>
            } @empty {
              <div class="col-span-full py-12 text-center text-slate-400 text-sm">Chưa có sản phẩm mới nào.</div>
            }
          </div>
        }
      </section>

    </div>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);

  banners = BANNERS;
  currentBanner = 0;
  private intervalId: any;

  discounted = signal<ProductResponse[]>([]);
  bestSellers = signal<ProductResponse[]>([]);
  newest = signal<ProductResponse[]>([]);

  loadingDiscounted = signal<boolean>(true);
  loadingBestSellers = signal<boolean>(true);
  loadingNewest = signal<boolean>(true);

  ngOnInit() {
    // Start banner carousel
    this.intervalId = setInterval(() => {
      this.currentBanner = (this.currentBanner + 1) % this.banners.length;
    }, 8000);

    // Fetch lists
    this.productService.getProducts({ promotedOnly: true, pageSize: 8 }).subscribe({
      next: (res) => {
        this.discounted.set(Array.isArray(res) ? res : ((res as any).items || (res as any).data || []));
        this.loadingDiscounted.set(false);
      },
      error: () => this.loadingDiscounted.set(false)
    });

    this.productService.getProducts({ sortBy: 'best_selling', pageSize: 8 }).subscribe({
      next: (res) => {
        this.bestSellers.set(Array.isArray(res) ? res : ((res as any).items || (res as any).data || []));
        this.loadingBestSellers.set(false);
      },
      error: () => this.loadingBestSellers.set(false)
    });

    this.productService.getProducts({ sortBy: 'newest', pageSize: 8 }).subscribe({
      next: (res) => {
        this.newest.set(Array.isArray(res) ? res : ((res as any).items || (res as any).data || []));
        this.loadingNewest.set(false);
      },
      error: () => this.loadingNewest.set(false)
    });
  }

  moveBanner(dir: number) {
    this.currentBanner = (this.currentBanner + dir + this.banners.length) % this.banners.length;
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
