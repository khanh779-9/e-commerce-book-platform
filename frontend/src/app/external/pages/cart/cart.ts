import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductImagePipe } from '../../../shared/pipes/product-image.pipe';
import { PRODUCT_IMAGE_FALLBACK } from '../../../core/utils/image';
import { AppIconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector:'app-cart',
  standalone:true,
  imports:[CommonModule,RouterLink,AppIconComponent,ProductImagePipe],
  template:`
    <div class="bg-paper">
      <div class="site-container page-shell">
        <header class="page-header">
          <p class="eyebrow">Đơn hàng của bạn</p>
          <h1 class="page-title">Giỏ hàng</h1>
          <p class="page-description">Kiểm tra số lượng và giá hiện tại trước khi sang bước thanh toán.</p>
        </header>

        @if(cart.cartItems().length===0){
          <div class="rounded-xl border border-border bg-surface px-5 py-20 text-center">
            <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream text-primary"><app-icon name="cart" class="h-6 w-6"/></span>
            <h2 class="mt-5 font-serif text-2xl font-semibold">Giỏ hàng đang trống</h2>
            <p class="mt-2 text-sm text-muted">Hãy chọn một vài cuốn sách bạn quan tâm.</p>
            <a routerLink="/products" class="btn-primary mt-7 gap-2">Tiếp tục mua sách<app-icon name="arrow-right" class="h-[18px] w-[18px]"/></a>
          </div>
        } @else {
          <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12 xl:gap-16">
            <section class="divide-y divide-border border-y border-border">
              @for(item of cart.cartItems();track item.productId){
                <article class="grid grid-cols-[84px_minmax(0,1fr)] gap-5 py-6 sm:grid-cols-[100px_minmax(0,1fr)_auto] sm:items-center">
                  <a [routerLink]="['/products',item.productId]" class="flex aspect-[3/4] items-center justify-center rounded-lg bg-cream p-2.5">
                    @if(item.image){<img [src]="item.image | productImage" (error)="$any($event.target).src = fallbackImg" [alt]="item.name" class="h-full w-full object-contain" style="filter: drop-shadow(0 8px 12px rgb(36 30 23 / 0.14));"/>}
                    @else{<span class="text-center text-xs text-muted">{{item.name}}</span>}
                  </a>

                  <div class="min-w-0">
                    <a [routerLink]="['/products',item.productId]" class="line-clamp-2 font-serif text-base font-semibold text-secondary transition-colors hover:text-primary">{{item.name}}</a>
                    <div class="mt-2 tnum">
                      @if(item.price<item.originalPrice){
                        <span class="mr-2 text-sm font-semibold text-accent">{{item.price|currency:'VND':'symbol-narrow':'1.0-0'}}</span>
                        <span class="text-xs text-muted line-through">{{item.originalPrice|currency:'VND':'symbol-narrow':'1.0-0'}}</span>
                      } @else {
                        <span class="text-sm font-semibold text-secondary">{{item.price|currency:'VND':'symbol-narrow':'1.0-0'}}</span>
                      }
                    </div>
                    <p class="mt-1 text-xs text-muted">Còn {{item.stockQuantity}} sản phẩm</p>
                    <button type="button" class="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-danger transition-colors hover:text-[#92332e]" (click)="cart.removeFromCart(item.productId)">
                      <app-icon name="trash" class="h-4 w-4"/>Xóa
                    </button>
                  </div>

                  <div class="col-start-2 mt-2 flex items-center justify-between gap-4 sm:col-auto sm:mt-0 sm:block">
                    <div class="flex items-center overflow-hidden rounded-full border border-border-strong bg-white">
                      <button class="flex h-10 w-9 items-center justify-center text-body transition-colors hover:bg-cream hover:text-secondary" (click)="cart.updateQuantity(item.productId,item.quantity-1)" aria-label="Giảm số lượng"><app-icon name="minus" class="h-4 w-4"/></button>
                      <span class="flex h-10 w-10 items-center justify-center border-x border-border text-center text-sm tnum">{{item.quantity}}</span>
                      <button class="flex h-10 w-9 items-center justify-center text-body transition-colors hover:bg-cream hover:text-secondary" [disabled]="item.quantity>=item.stockQuantity" (click)="cart.updateQuantity(item.productId,item.quantity+1)" aria-label="Tăng số lượng"><app-icon name="plus" class="h-4 w-4"/></button>
                    </div>
                    <p class="mt-0 text-right text-sm font-semibold tnum sm:mt-3">{{item.subTotal|currency:'VND':'symbol-narrow':'1.0-0'}}</p>
                  </div>
                </article>
              }
            </section>

            <aside class="h-fit rounded-xl border border-border bg-surface p-7 lg:sticky lg:top-28">
              <h2 class="font-serif text-xl font-semibold">Tóm tắt</h2>
              <dl class="mt-6 space-y-3 text-sm">
                <div class="flex justify-between"><dt class="text-muted">Số lượng</dt><dd class="tnum text-secondary">{{cart.cartCount()}}</dd></div>
                <div class="flex justify-between"><dt class="text-muted">Tiết kiệm</dt><dd class="tnum text-success">{{cart.savings()|currency:'VND':'symbol-narrow':'1.0-0'}}</dd></div>
                <div class="flex justify-between border-t border-border pt-4 text-base font-semibold text-secondary"><dt>Tạm tính</dt><dd class="tnum">{{cart.cartTotal()|currency:'VND':'symbol-narrow':'1.0-0'}}</dd></div>
              </dl>
              <p class="mt-4 text-xs leading-5 text-muted">Phí giao hàng (nếu có) và phương thức thanh toán sẽ được xác nhận ở bước tiếp theo.</p>
              @if(auth.isAuthenticated()){
                <a routerLink="/checkout" class="btn-primary mt-7 min-h-12 w-full gap-2">Tiến hành thanh toán<app-icon name="arrow-right" class="h-[18px] w-[18px]"/></a>
              } @else {
                <a routerLink="/login" [queryParams]="{returnUrl:'/checkout'}" class="btn-primary mt-7 min-h-12 w-full gap-2">Đăng nhập để thanh toán<app-icon name="arrow-right" class="h-[18px] w-[18px]"/></a>
              }
              <a routerLink="/products" class="btn-secondary mt-2 w-full gap-2"><app-icon name="arrow-left" class="h-[18px] w-[18px]"/>Tiếp tục mua hàng</a>
            </aside>
          </div>
        }
      </div>
    </div>
  `
})
export class CartComponent {
  fallbackImg = PRODUCT_IMAGE_FALLBACK;
  cart=inject(CartService);
  auth=inject(AuthService);
}