import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductResponse, ReviewResponse } from '../../../../core/models/models';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../core/services/cart.service';
import { ProductService } from '../../../../core/services/product.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { BookCardComponent } from '../../../../shared/components/book-card/book-card';
import { ProductImagePipe } from '../../../../shared/pipes/product-image.pipe';
import { AppIconComponent } from '../../../../shared/components/icon/icon';
import { PRODUCT_IMAGE_FALLBACK } from '../../../../core/utils/image';

@Component({ selector:'app-product-detail', standalone:true, imports:[CommonModule,FormsModule,RouterLink,BookCardComponent,AppIconComponent,ProductImagePipe], template:`
  <div class="bg-paper">
    <div class="site-container page-shell">
      @if (loading()) {
        <div class="grid gap-10 lg:grid-cols-2"><div class="skeleton aspect-square rounded-xl"></div><div class="space-y-4"><div class="skeleton h-5 w-28"></div><div class="skeleton h-12 w-4/5"></div><div class="skeleton h-6 w-40"></div><div class="skeleton h-28"></div></div></div>
      } @else if (!product()) {
        <div class="py-20 text-center"><h1 class="font-serif text-3xl font-semibold">Không tìm thấy sản phẩm</h1><a routerLink="/products" class="btn-primary mt-6">Quay lại cửa hàng</a></div>
      } @else {
        @let p = product()!;
        <nav class="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-muted"><a routerLink="/" class="transition-colors hover:text-primary">Trang chủ</a><app-icon name="chevron-right" class="h-4 w-4 text-muted"/><a routerLink="/products" class="transition-colors hover:text-primary">Sách</a>@if(p.categoryName && p.categoryName !== 'Sách'){<app-icon name="chevron-right" class="h-4 w-4 text-muted"/><span>{{p.categoryName}}</span>}</nav>
        <div class="grid gap-10 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)] lg:gap-16 xl:gap-20">
          <div class="flex min-h-[460px] items-center justify-center rounded-xl border border-border bg-cream p-8 lg:sticky lg:top-28 lg:self-start">
            @if(p.imageUrl && !imageFailed()){<img [src]="p.imageUrl | productImage" [alt]="p.name" (error)="imageFailed.set(true)" class="max-h-[560px] w-full object-contain" style="filter: drop-shadow(0 22px 32px rgb(36 30 23 / 0.2));"/>}@else{<div class="flex aspect-[3/4] w-[62%] items-center justify-center rounded-md border border-border-strong bg-surface p-8 text-center font-serif text-base font-medium text-muted">{{p.name}}</div>}
          </div>
          <section>
            <p class="eyebrow">{{p.bookDetails?.bookTypeName || p.categoryName || 'Sách'}}</p>
            <h1 class="mt-4 font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-secondary sm:text-5xl">{{p.name}}</h1>
            @if(p.bookDetails?.authorName){<p class="mt-4 text-base text-body">Tác giả <a routerLink="/products" [queryParams]="{authorId:p.bookDetails?.authorId}" class="font-semibold text-secondary underline decoration-primary/40 decoration-2 underline-offset-4 transition-colors hover:text-primary">{{p.bookDetails?.authorName}}</a></p>}
            <div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-4 text-sm text-body">
              @if(p.avgRating>0){<span class="inline-flex items-center gap-1.5"><app-icon name="star" class="h-4 w-4 text-gold" [filled]="p.avgRating>0"/><strong class="font-semibold text-secondary">{{p.avgRating | number:'1.1-1'}}</strong> / 5</span><span>{{p.totalReviews}} đánh giá</span>}@else{<span class="inline-flex items-center gap-1.5"><app-icon name="star" class="h-4 w-4 text-muted"/>Chưa có đánh giá</span>}<span>{{p.soldQuantity}} đã bán</span><span [class.text-danger]="p.stockQuantity<=0" class="font-medium">{{p.stockQuantity>0 ? 'Còn '+p.stockQuantity+' '+(p.unitName||'sản phẩm') : 'Hết hàng'}}</span>
            </div>
            <div class="mt-7 tnum">
              @if(p.effectivePrice < p.price){<p class="text-sm text-muted line-through">{{p.price|currency:'VND':'symbol-narrow':'1.0-0'}}</p><div class="mt-1 flex items-center gap-3"><p class="text-4xl font-semibold text-accent">{{p.effectivePrice|currency:'VND':'symbol-narrow':'1.0-0'}}</p><span class="badge-accent">Giảm {{p.discountPercent|number:'1.0-0'}}%</span></div>}@else{<p class="text-4xl font-semibold text-secondary">{{p.price|currency:'VND':'symbol-narrow':'1.0-0'}}</p>}
              @if(p.activePromotion?.name){<p class="mt-2 text-sm text-body">{{p.activePromotion?.name}}</p>}
            </div>
            <div class="mt-8 flex flex-col gap-3 sm:flex-row">
              <label class="flex min-h-12 items-center overflow-hidden rounded-full border border-border-strong bg-white"><span class="sr-only">Số lượng</span><button type="button" class="flex h-12 w-11 items-center justify-center text-body transition-colors hover:bg-cream hover:text-secondary" (click)="quantity=Math.max(1,quantity-1)" aria-label="Giảm số lượng"><app-icon name="minus" class="h-4 w-4"/></button><input class="h-12 w-14 border-x border-border text-center tnum outline-none" type="number" min="1" [max]="p.stockQuantity" [(ngModel)]="quantity"/><button type="button" class="flex h-12 w-11 items-center justify-center text-body transition-colors hover:bg-cream hover:text-secondary" (click)="quantity=Math.min(p.stockQuantity,quantity+1)" aria-label="Tăng số lượng"><app-icon name="plus" class="h-4 w-4"/></button></label>
              <button class="btn-primary min-h-12 flex-1 gap-2" [disabled]="p.stockQuantity<=0" (click)="addToCart()"><app-icon [name]="p.stockQuantity>0?'cart':'close'" class="h-5 w-5"/>{{p.stockQuantity>0?'Thêm vào giỏ hàng':'Sản phẩm tạm hết hàng'}}</button>
              <button class="icon-btn h-12 w-12 sm:h-12 sm:w-12" [ngClass]="p.isWishlisted ? '!border-primary !bg-primary !text-white' : ''" (click)="toggleWishlist()" [attr.aria-label]="p.isWishlisted?'Bỏ khỏi yêu thích':'Lưu yêu thích'" [title]="p.isWishlisted?'Bỏ khỏi yêu thích':'Lưu yêu thích'"><app-icon name="heart" class="h-5 w-5" [filled]="p.isWishlisted"/></button>
            </div>
            <div class="mt-9 grid gap-4 border-t border-border pt-6 sm:grid-cols-2 text-sm">
              <div class="flex items-center gap-3"><span class="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-primary"><app-icon name="book" class="h-4 w-4"/></span><div><p class="text-muted">Nhà xuất bản</p><p class="mt-0.5 font-medium text-secondary">{{p.bookDetails?.publisherName||'Đang cập nhật'}}</p></div></div>
              <div class="flex items-center gap-3"><span class="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-primary"><app-icon name="clock" class="h-4 w-4"/></span><div><p class="text-muted">Năm xuất bản</p><p class="mt-0.5 font-medium text-secondary">{{p.bookDetails?.publishedYear||'Đang cập nhật'}}</p></div></div>
              <div class="flex items-center gap-3"><span class="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-primary"><app-icon name="globe" class="h-4 w-4"/></span><div><p class="text-muted">Nhà cung cấp</p><p class="mt-0.5 font-medium text-secondary">{{p.providerName||'Đang cập nhật'}}</p></div></div>
              <div class="flex items-center gap-3"><span class="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-primary"><app-icon name="package" class="h-4 w-4"/></span><div><p class="text-muted">Đơn vị</p><p class="mt-0.5 font-medium text-secondary">{{p.unitName||'Đang cập nhật'}}</p></div></div>
            </div>
          </section>
        </div>

        <div class="mt-16 grid gap-12 border-t border-border pt-14 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-16">
          <section><h2 class="font-serif text-3xl font-semibold">Giới thiệu sách</h2><div class="mt-6 max-w-3xl whitespace-pre-line text-[15px] leading-8 text-body">{{p.description||'Nội dung giới thiệu đang được cập nhật.'}}</div></section>
          <aside class="lg:border-l lg:border-border lg:pl-10"><h2 class="font-serif text-xl font-semibold">Thông tin nhanh</h2><dl class="mt-5 divide-y divide-border text-sm"><div class="flex justify-between gap-4 py-3.5"><dt class="text-muted">Mã sản phẩm</dt><dd class="font-medium tnum">#{{p.productId}}</dd></div><div class="flex justify-between gap-4 py-3.5"><dt class="text-muted">Loại sách</dt><dd class="text-right font-medium">{{p.bookDetails?.bookTypeName||'-'}}</dd></div><div class="flex justify-between gap-4 py-3.5"><dt class="text-muted">Danh mục</dt><dd class="text-right font-medium">{{p.categoryName||'-'}}</dd></div></dl><div class="mt-5 rounded-xl bg-cream p-5"><p class="flex items-center gap-2 text-sm font-semibold text-secondary"><app-icon name="shield" class="h-4 w-4 text-primary"/>Cam kết BookZone</p><p class="mt-2 text-xs leading-6 text-muted">Sách chính hãng, đóng gói cẩn thận và hỗ trợ đổi trả linh hoạt.</p></div></aside>
        </div>

        <section class="mt-16 border-t border-border pt-14" id="reviews">
          <div class="section-heading"><div><p class="eyebrow">Người mua chia sẻ</p><h2 class="section-title mt-3">Đánh giá sản phẩm</h2></div>@if(p.totalReviews>0){<p class="text-sm text-muted">{{p.totalReviews}} đánh giá · trung bình {{p.avgRating|number:'1.1-1'}}/5</p>}@else{<p class="text-sm text-muted">Sản phẩm này chưa có đánh giá nào.</p>}</div>
          @if(auth.isAuthenticated()){
            <form (submit)="submitReview($event)" class="mt-8 max-w-2xl rounded-xl border border-border bg-surface p-6">
              <h3 class="font-serif text-lg font-semibold">Viết đánh giá</h3><p class="mt-1 text-xs text-muted">Chỉ tài khoản đã nhận hàng mới gửi được đánh giá.</p>
              <div class="mt-5 grid gap-4 sm:grid-cols-[150px_1fr]"><label><span class="field-label">Điểm</span><select class="field" [(ngModel)]="reviewRating" name="rating"><option [ngValue]="5">5 - Rất tốt</option><option [ngValue]="4">4 - Tốt</option><option [ngValue]="3">3 - Bình thường</option><option [ngValue]="2">2 - Chưa tốt</option><option [ngValue]="1">1 - Không hài lòng</option></select></label><label><span class="field-label">Nhận xét</span><textarea class="field min-h-24" [(ngModel)]="reviewComment" name="comment" placeholder="Chia sẻ trải nghiệm của bạn"></textarea></label></div>
              @if(reviewMessage()){<p class="mt-3 text-sm" [class.text-danger]="reviewError()" [class.text-success]="!reviewError()">{{reviewMessage()}}</p>}
              <button class="btn-primary mt-5" [disabled]="reviewSubmitting()">{{reviewSubmitting()?'Đang gửi...':'Gửi đánh giá'}}</button>
            </form>
          }
          <div class="mt-9 divide-y divide-border border-y border-border">
            @for(r of reviews(); track r.reviewId){<article class="py-6"><div class="flex flex-wrap items-center justify-between gap-3"><div><p class="font-semibold text-secondary">{{r.customerName||'Khách hàng'}}</p><p class="mt-1 text-xs text-muted">{{r.createdAt|date:'dd/MM/yyyy'}}</p></div><p class="tnum text-sm font-semibold text-secondary"><app-icon name="star" class="h-4 w-4 text-gold" [filled]="r.rating>0"/> {{r.rating}} / 5</p></div><p class="mt-3 max-w-3xl text-sm leading-7 text-body">{{r.comment||'Người mua không để lại nhận xét.'}}</p></article>}@empty{<p class="py-10 text-sm text-muted">Chưa có đánh giá nào cho sản phẩm này.</p>}
          </div>
        </section>

        @if(related().length){<section class="mt-16 border-t border-border pt-14"><div class="section-heading"><h2 class="section-title">Có thể bạn cũng quan tâm</h2><a routerLink="/products" [queryParams]="{categoryId:p.categoryId}" class="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-dark">Xem cùng danh mục<app-icon name="arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-0.5"/></a></div><div class="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">@for(x of related();track x.productId){<app-book-card [product]="x"/>}</div></section>}
      }
    </div>
  </div>` })
export class ProductDetailComponent implements OnInit {
  fallbackImg = PRODUCT_IMAGE_FALLBACK;
  imageFailed = signal(false);
  private route=inject(ActivatedRoute); private api=inject(ProductService); private cart=inject(CartService); private wishlist=inject(WishlistService); auth=inject(AuthService);
  Math=Math; loading=signal(true); product=signal<ProductResponse|null>(null); reviews=signal<ReviewResponse[]>([]); related=signal<ProductResponse[]>([]); quantity=1; reviewRating=5; reviewComment=''; reviewSubmitting=signal(false); reviewMessage=signal(''); reviewError=signal(false);
  ngOnInit(){this.route.paramMap.subscribe(pm=>{const id=Number(pm.get('id'));if(id>0)this.load(id);});}
  private load(id:number){this.loading.set(true);this.api.getProductById(id).subscribe({next:r=>{const p=r.data||null;this.product.set(p);this.reviews.set(p?.reviews||[]);this.loading.set(false);if(p?.categoryId)this.api.getProducts({categoryId:p.categoryId,limit:6,sortBy:'best_selling'}).subscribe(x=>this.related.set(x.items.filter(y=>y.productId!==id).slice(0,5)));},error:()=>this.loading.set(false)});}
  addToCart(){const p=this.product();if(p)this.cart.addToCart(p,Math.max(1,Math.min(this.quantity,p.stockQuantity)));}
  toggleWishlist(){const p=this.product();if(!p)return;if(!this.auth.isAuthenticated()){location.href='/login';return;}this.wishlist.toggleWishlist(p.productId).subscribe(r=>p.isWishlisted=r.data?.added??!p.isWishlisted);}
  submitReview(e:Event){e.preventDefault();const p=this.product();if(!p)return;this.reviewSubmitting.set(true);this.reviewMessage.set('');this.api.submitReview(p.productId,this.reviewRating,this.reviewComment).subscribe({next:r=>{if(r.data)this.reviews.update(x=>[r.data!,...x]);this.reviewMessage.set(r.message||'Đã gửi đánh giá.');this.reviewError.set(false);this.reviewSubmitting.set(false);this.reviewComment='';},error:err=>{this.reviewMessage.set(err.error?.message||'Không thể gửi đánh giá.');this.reviewError.set(true);this.reviewSubmitting.set(false);}});}
}