import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductResponse } from '../../../core/models/models';
import { WishlistService } from '../../../core/services/wishlist.service';
import { BookCardComponent } from '../../../shared/components/book-card/book-card';
import { AppIconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector:'app-wishlist',
  standalone:true,
  imports:[RouterLink,BookCardComponent,AppIconComponent],
  template:`
    <div class="bg-paper">
      <div class="site-container page-shell">
        <header class="page-header">
          <p class="eyebrow">Tài khoản</p>
          <h1 class="page-title">Sách đã lưu</h1>
          <p class="page-description">Danh sách để bạn quay lại so sánh hoặc mua sau.</p>
        </header>

        @if(loading()){
          <div class="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            @for(_ of [1,2,3,4]; track $index){<div class="rounded-xl border border-border bg-surface p-2.5"><div class="skeleton aspect-[3/4] rounded-lg"></div><div class="skeleton mt-4 h-4 w-3/4 rounded-sm"></div><div class="skeleton mt-2 h-5 w-1/2 rounded-sm"></div></div>}
          </div>
        } @else if(items().length===0){
          <div class="rounded-xl border border-border bg-surface px-5 py-20 text-center">
            <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream text-primary"><app-icon name="heart" class="h-6 w-6"/></span>
            <h2 class="mt-5 font-serif text-2xl font-semibold">Chưa có sách yêu thích</h2>
            <p class="mt-2 text-sm text-muted">Lưu những cuốn sách bạn muốn xem lại ở đây.</p>
            <a routerLink="/products" class="btn-primary mt-7 gap-2">Khám phá sách<app-icon name="arrow-right" class="h-[18px] w-[18px]"/></a>
          </div>
        } @else {
          <div class="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            @for(p of items();track p.productId){<app-book-card [product]="p"/>}
          </div>
        }
      </div>
    </div>`
})
export class WishlistComponent implements OnInit {
  private api=inject(WishlistService);
  items=signal<ProductResponse[]>([]);
  loading=signal(true);
  ngOnInit(){this.api.getWishlist().subscribe({next:r=>{this.items.set(r.items);this.loading.set(false);},error:()=>this.loading.set(false)});}
}