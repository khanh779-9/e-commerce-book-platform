import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductResponse } from '../../../core/models/models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="bg-background min-h-screen pb-24 -mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-3 text-xs font-black text-slate-400 mb-8 uppercase tracking-widest overflow-x-auto whitespace-nowrap">
          <a routerLink="/" class="hover:text-primary transition-colors">Trang chủ</a>
          <span class="shrink-0">/</span>
          <a routerLink="/products" class="hover:text-primary transition-colors">Sản phẩm</a>
          <span class="shrink-0">/</span>
          @if (product(); as prod) {
            <span class="text-secondary truncate max-w-[200px]">{{ prod.name }}</span>
          }
        </nav>

        @if (loading()) {
          <div class="py-24 text-center">
            <div class="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-none mx-auto mb-4"></div>
            <p class="text-slate-400 font-bold text-xs uppercase tracking-widest">Đang mở sách...</p>
          </div>
        } @else if (product(); as prod) {
          
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
            
            <!-- Left Panel: Images & Trust Badges -->
            <div class="lg:col-span-5 space-y-6">
              <div class="bg-white rounded-none p-8 border border-slate-200 shadow-xl relative aspect-square flex items-center justify-center overflow-hidden">
                <img [src]="prod.imageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600'" 
                     [alt]="prod.name"
                     class="max-w-full max-h-full object-contain relative z-10" />
                @if (prod.promoPrice > 0 && prod.promoPrice < prod.price) {
                  <div class="absolute top-4 right-4 bg-rose-500 text-white font-black px-4 py-2 rounded-none shadow-lg rotate-3 z-20 text-xs">
                    -{{ getDiscountPercent(prod.price, prod.promoPrice) }}%
                  </div>
                }
              </div>

              <!-- Trust Badges -->
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 rounded-none bg-emerald-50/50 border border-emerald-100 flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-emerald-500">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                  <span class="text-[10px] font-black text-emerald-900 uppercase">100% Chính hãng</span>
                </div>
                <div class="p-4 rounded-none bg-blue-50/50 border border-blue-100 flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-blue-500">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.75a1.125 1.125 0 0 1-1.125-1.125V15m1.5 3.75a3 3 0 0 0-3-3m13.5 3.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.5m-9 0h9m-9-1.5h.008v.008H9.75v-.008Zm0-3h.008v.008H9.75v-.008Zm1.5-4.5h.008v.008h-.008V11.25ZM9.75 8.25h.008v.008H9.75V8.25Zm0 3h.008v.008H9.75v-.008Zm9-3h.008v.008H18.75V8.25Zm-3 0h.008v.008h-.008V8.25ZM15.75 5.25h.008v.008h-.008V5.25Zm-3 0h.008v.008h-.008V5.25Zm-1.5-1.5h.008v.008h-.008v-.008Zm3 0h.008v.008h-.008v-.008Zm3 0h.008v.008h-.008v-.008Zm-6 3h.008v.008h-.008V8.25Zm0 3h.008v.008h-.008v-.008Zm3 3h.008v.008h-.008v-.008Zm3 0h.008v.008h-.008v-.008Zm3 0h.008v.008h-.008v-.008Zm-9 0h.008v.008H9.75v-.008Zm-3 0h.008v.008H6.75v-.008Zm-3 0h.008v.008H3.75v-.008Z" />
                  </svg>
                  <span class="text-[10px] font-black text-blue-900 uppercase">Giao hàng nhanh</span>
                </div>
              </div>
            </div>

            <!-- Right Panel: Info & Actions -->
            <div class="lg:col-span-7 space-y-8">
              <div class="space-y-4">
                <h1 class="text-3xl md:text-5xl font-black text-secondary leading-tight uppercase tracking-tight">
                  {{ prod.name }}
                </h1>
                
                <div class="flex flex-wrap items-center gap-8 border-b border-slate-100 pb-6">
                  <!-- Stock status -->
                  <div class="flex flex-col">
                    <span class="text-xs text-slate-400 font-black uppercase tracking-widest mb-1">Tình trạng</span>
                    <div class="flex items-center gap-2">
                      <span [class]="prod.stockQuantity > 0 ? 'text-emerald-500' : 'text-rose-500'" class="w-2.5 h-2.5 rounded-full bg-current"></span>
                      <span [class]="prod.stockQuantity > 0 ? 'text-emerald-600' : 'text-rose-500'" class="font-bold text-sm">
                        {{ prod.stockQuantity > 0 ? 'Còn hàng (' + prod.stockQuantity + ')' : 'Hết hàng' }}
                      </span>
                    </div>
                  </div>

                  <div class="w-px h-8 bg-slate-100 hidden sm:block"></div>
                  
                  <!-- Sold status -->
                  <div class="flex flex-col">
                    <span class="text-xs text-slate-400 font-black uppercase tracking-widest mb-1">Đã bán</span>
                    <span class="font-bold text-secondary">{{ prod.soldQuantity }} bản</span>
                  </div>
                </div>
              </div>

              <!-- Price Panel -->
              <div class="bg-slate-900 text-white rounded-none p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-2xl">
                <div>
                  <span class="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-2">Giá bán</span>
                  <div class="flex items-baseline gap-4">
                    <span class="text-4xl font-black text-white">
                      @if (prod.promoPrice > 0 && prod.promoPrice < prod.price) {
                        {{ prod.promoPrice | currency:'VND':'symbol-narrow':'1.0-0' }}
                      } @else {
                        {{ prod.price | currency:'VND':'symbol-narrow':'1.0-0' }}
                      }
                    </span>
                    @if (prod.promoPrice > 0 && prod.promoPrice < prod.price) {
                      <span class="text-lg text-slate-500 line-through decoration-slate-600 font-bold">
                        {{ prod.price | currency:'VND':'symbol-narrow':'1.0-0' }}
                      </span>
                    }
                  </div>
                </div>
                @if (prod.promoPrice > 0 && prod.promoPrice < prod.price) {
                  <div class="bg-white/10 text-white border border-white/20 font-black px-4 py-2 rounded-none text-[10px] uppercase tracking-widest">
                    Tiết kiệm {{ (prod.price - prod.promoPrice) | currency:'VND':'symbol-narrow':'1.0-0' }}
                  </div>
                }
              </div>

              <!-- Quantity selector and Buttons -->
              <div class="flex flex-col sm:flex-row gap-4 pt-2">
                
                <!-- Quantity Picker -->
                <div class="flex items-center bg-white border border-slate-200 rounded-none p-1 shadow-sm shrink-0">
                  <button (click)="decreaseQty()" class="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-primary transition-colors font-bold cursor-pointer">-</button>
                  <input type="number" [(ngModel)]="quantity" min="1" [max]="prod.stockQuantity" class="w-14 text-center font-black text-lg bg-transparent border-none focus:outline-none" />
                  <button (click)="increaseQty(prod.stockQuantity)" class="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-primary transition-colors font-bold cursor-pointer">+</button>
                </div>

                <!-- Add to cart -->
                <button (click)="addToCart()"
                        [disabled]="prod.stockQuantity <= 0"
                        class="flex-grow btn-primary py-5 text-sm uppercase tracking-widest font-black flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  <span>Thêm vào giỏ hàng</span>
                </button>

                <!-- Wishlist Toggle -->
                <button (click)="toggleWishlist(prod)" 
                        [class]="prod.isWishlisted ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-200 text-slate-300 hover:text-rose-500 hover:border-rose-200'"
                        class="w-14 h-14 border transition-all flex items-center justify-center shrink-0 rounded-none cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" [attr.fill]="prod.isWishlisted ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </button>
              </div>

              <!-- Tabs Navigation -->
              <div class="pt-8">
                <div class="flex gap-8 border-b border-slate-100 overflow-x-auto whitespace-nowrap pb-4">
                  <button (click)="activeTab = 'description'"
                          [class]="activeTab === 'description' ? 'text-primary border-b-2 border-primary font-black' : 'text-slate-400 font-bold hover:text-slate-600'"
                          class="pb-1 text-xs uppercase tracking-widest relative transition-all cursor-pointer">
                    Mô tả
                  </button>
                  <button (click)="activeTab = 'details'"
                          [class]="activeTab === 'details' ? 'text-primary border-b-2 border-primary font-black' : 'text-slate-400 font-bold hover:text-slate-600'"
                          class="pb-1 text-xs uppercase tracking-widest relative transition-all cursor-pointer">
                    Thông số
                  </button>
                </div>

                <div class="mt-8 min-h-[150px]">
                  <!-- Description tab -->
                  @if (activeTab === 'description') {
                    <div class="bg-white p-6 border border-slate-200 rounded-none prose max-w-none text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                      {{ prod.description || 'Đang cập nhật nội dung...' }}
                    </div>
                  }

                  <!-- Specs tab -->
                  @if (activeTab === 'details') {
                    <div class="bg-white border border-slate-200 rounded-none overflow-hidden">
                      <table class="w-full text-sm text-left border-collapse">
                        <tbody>
                          <tr class="border-b border-slate-100">
                            <td class="px-6 py-4 bg-slate-50 font-black text-slate-400 text-xs uppercase tracking-widest w-1/3">Tác giả</td>
                            <td class="px-6 py-4 font-bold text-slate-800">{{ prod.bookDetails?.authorName || 'Đang cập nhật' }}</td>
                          </tr>
                          <tr class="border-b border-slate-100">
                            <td class="px-6 py-4 bg-slate-50 font-black text-slate-400 text-xs uppercase tracking-widest">Nhà xuất bản</td>
                            <td class="px-6 py-4 font-bold text-slate-800">{{ prod.bookDetails?.publisherName || 'Đang cập nhật' }}</td>
                          </tr>
                          <tr class="border-b border-slate-100">
                            <td class="px-6 py-4 bg-slate-50 font-black text-slate-400 text-xs uppercase tracking-widest">Năm xuất bản</td>
                            <td class="px-6 py-4 font-bold text-slate-800">{{ prod.bookDetails?.publishedYear || 'Đang cập nhật' }}</td>
                          </tr>
                          <tr class="border-b border-slate-100">
                            <td class="px-6 py-4 bg-slate-50 font-black text-slate-400 text-xs uppercase tracking-widest">Loại sách</td>
                            <td class="px-6 py-4 font-bold text-slate-800">{{ prod.bookDetails?.bookTypeName || 'Đang cập nhật' }}</td>
                          </tr>
                          <tr class="border-b border-slate-100">
                            <td class="px-6 py-4 bg-slate-50 font-black text-slate-400 text-xs uppercase tracking-widest">Nhà cung cấp</td>
                            <td class="px-6 py-4 font-bold text-slate-800">{{ prod.providerName || 'Đang cập nhật' }}</td>
                          </tr>
                          <tr>
                            <td class="px-6 py-4 bg-slate-50 font-black text-slate-400 text-xs uppercase tracking-widest">Đơn vị</td>
                            <td class="px-6 py-4 font-bold text-slate-800">{{ prod.unitName || 'Quyển' }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  }
                </div>
              </div>

            </div>

          </div>

        } @else {
          <!-- Not found spec -->
          <div class="text-center py-32 max-w-lg mx-auto">
            <div class="text-8xl mb-8 opacity-20">📚</div>
            <h2 class="text-3xl font-black text-secondary mb-4 uppercase tracking-tight">Sản phẩm không tồn tại</h2>
            <p class="text-slate-400 mb-10 font-medium">Cuốn sách bạn tìm kiếm đã bị gỡ bỏ hoặc thông tin không chính xác.</p>
            <a routerLink="/products" class="btn-dark px-10 py-4 inline-flex">Quay lại cửa hàng</a>
          </div>
        }

      </div>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  wishlistService = inject(WishlistService);
  authService = inject(AuthService);

  product = signal<ProductResponse | null>(null);
  loading = signal<boolean>(true);
  quantity = 1;
  activeTab = 'description';

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.productService.getProductById(id).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.product.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getDiscountPercent(price: number, promoPrice: number): number {
    if (price <= 0) return 0;
    return Math.round(((price - promoPrice) / price) * 100);
  }

  increaseQty(max: number) {
    if (this.quantity < max) {
      this.quantity++;
    }
  }

  decreaseQty() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    const prod = this.product();
    if (prod) {
      this.cartService.addToCart({
        productId: prod.productId,
        name: prod.name,
        price: prod.promoPrice > 0 && prod.promoPrice < prod.price ? prod.promoPrice : prod.price,
        imageUrl: prod.imageUrl
      }, this.quantity);
      alert('Đã thêm sản phẩm vào giỏ hàng!');
    }
  }

  toggleWishlist(prod: ProductResponse) {
    if (!this.authService.isAuthenticated()) {
      alert('Vui lòng đăng nhập để lưu sản phẩm yêu thích.');
      return;
    }

    this.wishlistService.toggleWishlist(prod.productId).subscribe(res => {
      prod.isWishlisted = !prod.isWishlisted;
      alert(prod.isWishlisted ? 'Đã thêm vào danh sách yêu thích!' : 'Đã xóa khỏi danh sách yêu thích.');
    });
  }
}
