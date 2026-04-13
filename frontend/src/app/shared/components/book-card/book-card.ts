import { CommonModule } from '@angular/common';
import { Component, Input, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProductResponse } from '../../../core/models/models';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { PRODUCT_IMAGE_FALLBACK } from '../../../core/utils/image';
import { ProductImagePipe } from '../../pipes/product-image.pipe';
import { AppIconComponent } from '../icon/icon';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, RouterLink, AppIconComponent, ProductImagePipe],
  template: `
    <article class="book-card group">
      <div class="book-card-cover">
        <a
          [routerLink]="['/products', product.productId]"
          class="flex aspect-[3/4] items-center justify-center p-3"
          [attr.aria-label]="'Xem ' + product.name">
          @if (product.imageUrl && !imageFailed()) {
            <img
              [src]="product.imageUrl | productImage"
              [alt]="product.name"
              loading="lazy"
              (error)="imageFailed.set(true)"
              class="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
              style="filter: drop-shadow(0 14px 20px rgb(36 30 23 / 0.18));" />
          } @else {
            <div class="flex h-[82%] w-[72%] items-center justify-center rounded-sm border border-border-strong bg-surface px-4 text-center font-serif text-sm font-medium leading-5 text-muted shadow-sm">
              {{ product.name }}
            </div>
          }
        </a>

        @if ((product.discountPercent || 0) > 0) {
          <span class="badge-accent absolute left-2.5 top-2.5 shadow-sm">-{{ product.discountPercent | number:'1.0-0' }}%</span>
        }

        <button
          type="button"
          (click)="toggleWishlist($event)"
          class="icon-btn-soft absolute right-2.5 top-2.5"
          [ngClass]="product.isWishlisted ? '!border-primary !bg-primary !text-white' : ''"
          [attr.aria-pressed]="product.isWishlisted"
          [attr.aria-label]="product.isWishlisted ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'"
          [title]="product.isWishlisted ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'">
          <app-icon name="heart" class="h-5 w-5" [filled]="product.isWishlisted" />
        </button>
      </div>

      <div class="flex flex-1 flex-col px-1.5 pb-1 pt-4">
        <p class="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
          {{ product.bookDetails?.authorName || product.categoryName || product.providerName || 'BookZone' }}
        </p>

        <h3 class="mt-1.5 min-h-[2.9rem] text-[15px] font-semibold leading-[1.4] text-secondary sm:text-base">
          <a [routerLink]="['/products', product.productId]" class="line-clamp-2 transition-colors hover:text-primary">
            {{ product.name }}
          </a>
        </h3>

        <div class="mt-2.5 flex min-h-5 items-center gap-1.5 text-xs text-muted">
          <app-icon name="star" class="h-4 w-4 text-gold" [filled]="product.avgRating > 0" />
          @if (product.avgRating > 0) {
            <span class="tnum font-semibold text-secondary">{{ product.avgRating | number:'1.1-1' }}</span>
            <span>({{ product.totalReviews }})</span>
          } @else {
            <span>Chưa có đánh giá</span>
          }
        </div>

        <div class="mt-auto flex items-end justify-between gap-3 pt-3.5">
          <div class="min-w-0 tnum">
            @if (product.effectivePrice < product.price) {
              <p class="text-xs text-muted line-through">{{ product.price | currency:'VND':'symbol-narrow':'1.0-0' }}</p>
              <p class="mt-0.5 truncate text-lg font-semibold leading-6 text-accent">{{ product.effectivePrice | currency:'VND':'symbol-narrow':'1.0-0' }}</p>
            } @else {
              <p class="truncate text-lg font-semibold leading-6 text-secondary">{{ product.price | currency:'VND':'symbol-narrow':'1.0-0' }}</p>
            }
          </div>

          <button
            type="button"
            (click)="addToCart($event)"
            [disabled]="product.stockQuantity <= 0"
            class="icon-btn-primary"
            [attr.aria-label]="product.stockQuantity > 0 ? 'Thêm ' + product.name + ' vào giỏ hàng' : product.name + ' đã hết hàng'"
            [title]="product.stockQuantity > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'">
            <app-icon [name]="product.stockQuantity > 0 ? 'cart' : 'close'" class="h-5 w-5" />
          </button>
        </div>

        @if (product.stockQuantity > 0 && product.stockQuantity <= 5) {
          <p class="mt-2 text-xs font-medium text-warning">Chỉ còn {{ product.stockQuantity }} {{ product.unitName || 'sản phẩm' }}</p>
        } @else if (product.stockQuantity <= 0) {
          <p class="mt-2 text-xs font-medium text-danger">Tạm hết hàng</p>
        }
      </div>
    </article>
  `
})
export class BookCardComponent {
  @Input({ required: true }) product!: ProductResponse;
  fallbackImg = PRODUCT_IMAGE_FALLBACK;
  imageFailed = signal(false);

  private cart = inject(CartService);
  private wishlist = inject(WishlistService);
  private auth = inject(AuthService);
  private router = inject(Router);

  addToCart(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    if (this.product.stockQuantity > 0) this.cart.addToCart(this.product, 1);
  }

  toggleWishlist(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.wishlist.toggleWishlist(this.product.productId).subscribe({
      next: r => this.product.isWishlisted = r.data?.added ?? !this.product.isWishlisted
    });
  }
}