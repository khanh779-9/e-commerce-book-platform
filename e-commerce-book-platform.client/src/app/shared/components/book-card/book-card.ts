import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductResponse } from '../../../core/models/models';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="group relative bg-white border border-slate-200 rounded-none overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      
      <!-- Discount Badge -->
      @if (product.promoPrice > 0 && product.promoPrice < product.price) {
        <span class="absolute top-3 left-3 z-10 bg-rose-500 text-white text-[9px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">
          SALE
        </span>
      }

      <!-- Wishlist Heart Button -->
      <button (click)="toggleWishlist($event)" 
              [class]="product.isWishlisted ? 'text-rose-500 bg-white shadow-md' : 'text-slate-400 bg-white/80 hover:bg-white hover:text-rose-500'"
              class="absolute top-3 right-3 z-10 w-8 h-8 rounded-none flex items-center justify-center transition-all shadow-sm cursor-pointer border border-slate-100">
        <svg xmlns="http://www.w3.org/2000/svg" [attr.fill]="product.isWishlisted ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      </button>

      <!-- Image Area -->
      <div class="relative w-full pt-[135%] bg-slate-50 overflow-hidden cursor-pointer border-b border-slate-100" [routerLink]="['/products', product.productId]">
        <img [src]="product.imageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300'" 
             [alt]="product.name"
             class="absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-102 transition-transform duration-500" />
      </div>

      <!-- Content Area -->
      <div class="p-5 flex flex-col flex-grow space-y-2.5">
        <!-- Category & Rating -->
        <div class="flex items-center justify-between">
          <span class="text-[9px] font-black text-primary bg-blue-50 px-2 py-0.5 rounded-none uppercase tracking-widest">
            {{ product.categoryName || 'Sách' }}
          </span>
          <div class="flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5 text-amber-400">
              <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd" />
            </svg>
            <span class="text-xs font-bold text-slate-700">{{ product.avgRating > 0 ? (product.avgRating | number:'1.1-1') : '0.0' }}</span>
          </div>
        </div>

        <!-- Title -->
        <h3 class="font-bold text-secondary text-sm line-clamp-2 hover:text-primary transition-colors cursor-pointer uppercase tracking-tight h-10 overflow-hidden" [routerLink]="['/products', product.productId]">
          {{ product.name }}
        </h3>

        <!-- Author -->
        <p class="text-xs text-slate-400 italic font-semibold truncate">
          {{ product.bookDetails?.authorName || 'Đang cập nhật' }}
        </p>

        <!-- Price and Add to Cart -->
        <div class="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div class="flex flex-col">
            @if (product.promoPrice > 0 && product.promoPrice < product.price) {
              <span class="text-[10px] text-slate-400 line-through font-bold">{{ product.price | currency:'VND':'symbol-narrow':'1.0-0' }}</span>
              <span class="text-sm font-black text-rose-500">{{ product.promoPrice | currency:'VND':'symbol-narrow':'1.0-0' }}</span>
            } @else {
              <span class="text-sm font-black text-primary">{{ product.price | currency:'VND':'symbol-narrow':'1.0-0' }}</span>
            }
          </div>

          <button (click)="addToCart($event)" 
                  class="bg-slate-900 text-white p-2.5 hover:bg-primary transition-all duration-300 transform active:scale-95 rounded-none cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>

      </div>

    </div>
  `
})
export class BookCardComponent {
  @Input({ required: true }) product!: ProductResponse;
  
  cartService = inject(CartService);
  wishlistService = inject(WishlistService);
  authService = inject(AuthService);

  addToCart(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.addToCart({
      productId: this.product.productId,
      name: this.product.name,
      price: this.product.promoPrice > 0 && this.product.promoPrice < this.product.price ? this.product.promoPrice : this.product.price,
      imageUrl: this.product.imageUrl
    });
  }

  toggleWishlist(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    
    if (!this.authService.isAuthenticated()) {
      alert('Vui lòng đăng nhập để lưu sản phẩm yêu thích.');
      return;
    }

    this.wishlistService.toggleWishlist(this.product.productId).subscribe(res => {
      this.product.isWishlisted = !this.product.isWishlisted;
    });
  }
}
