import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { ProductResponse } from '../../core/models/models';
import { BookCardComponent } from '../../shared/components/book-card/book-card';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, BookCardComponent],
  template: `
    <div class="bg-background min-h-screen pb-20 -mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        <!-- Header -->
        <div class="flex items-center gap-4 mb-12 border-b border-slate-100 pb-10">
          <div class="w-12 h-12 rounded-none bg-rose-50 text-rose-500 flex items-center justify-center text-xl shadow-sm border border-rose-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="w-6 h-6">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </div>
          <div>
            <h1 class="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tight">Danh sách yêu thích</h1>
            <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              {{ products().length }} sản phẩm đã lưu
            </p>
          </div>
        </div>

        @if (loading()) {
          <div class="py-24 text-center">
            <div class="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-none mx-auto mb-4"></div>
            <p class="text-slate-400 font-bold text-xs uppercase tracking-widest">Đang tải danh sách yêu thích...</p>
          </div>
        } @else if (products().length === 0) {
          
          <!-- Empty State -->
          <div class="max-w-md mx-auto text-center py-20 bg-white border border-slate-200 p-8 rounded-none shadow-sm space-y-4">
            <div class="w-20 h-20 bg-slate-50 text-slate-200 rounded-none flex items-center justify-center text-4xl mx-auto border border-slate-100">
              💔
            </div>
            <h2 class="text-xl font-black text-secondary uppercase tracking-tight">Danh sách trống</h2>
            <p class="text-slate-400 font-medium text-xs">Bạn chưa lưu cuốn sách nào vào danh sách yêu thích cả.</p>
            <a routerLink="/products" class="btn-dark px-8 py-3.5 inline-flex uppercase tracking-widest text-xs">
              Khám phá sản phẩm ngay
            </a>
          </div>

        } @else {
          
          <!-- Product Grid -->
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            @for (p of products(); track p.productId) {
              <app-book-card [product]="p"></app-book-card>
            }
          </div>

        }

      </div>
    </div>
  `
})
export class WishlistComponent implements OnInit {
  private wishlistService = inject(WishlistService);

  products = signal<ProductResponse[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.wishlistService.getWishlist().subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : ((res as any).items || (res as any).data || []);
        this.products.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
