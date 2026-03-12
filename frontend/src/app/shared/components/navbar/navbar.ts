import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { ProductResponse } from '../../../core/models/models';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { ProductImagePipe } from '../../pipes/product-image.pipe';
import { AppIconComponent } from '../icon/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AppIconComponent, FormsModule, ProductImagePipe],
  template: `
    <header class="sticky top-0 z-50 border-b border-border bg-paper/95 backdrop-blur-sm">
      <div class="bg-secondary text-white">
        <div class="site-container flex min-h-9 items-center justify-between gap-4 py-1.5 text-xs">
          <p class="flex items-center gap-2 truncate text-[13px] tracking-wide text-[#cbd3df]">
            <app-icon name="truck" class="h-4 w-4 text-primary-light" />
            Miễn phí vận chuyển cho đơn hàng đủ điều kiện
          </p>
          <a routerLink="/contact" class="hidden items-center gap-1.5 text-[13px] text-[#cbd3df] transition-colors hover:text-white sm:flex">
            <app-icon name="bell" class="h-3.5 w-3.5" />
            Hỗ trợ khách hàng
          </a>
        </div>
      </div>

      <div class="site-container">
        <div class="flex min-h-[76px] items-center gap-3 lg:gap-8">
          <a routerLink="/" class="group shrink-0" aria-label="BookZone - Trang chủ">
            <span class="block font-serif text-[26px] font-semibold leading-none tracking-tight text-secondary">Book<span class="text-primary">Zone</span></span>
            <span class="mt-1.5 hidden text-[10px] font-medium uppercase tracking-[0.22em] text-muted sm:block">Nhà sách trực tuyến</span>
          </a>

          <nav class="hidden items-center gap-1 lg:flex" aria-label="Điều hướng chính">
            <a routerLink="/products" routerLinkActive="bg-cream text-secondary" class="rounded-full px-4 py-2 text-sm font-medium text-body hover:bg-cream hover:text-secondary">Cửa hàng</a>
            <a routerLink="/about" routerLinkActive="bg-cream text-secondary" class="rounded-full px-4 py-2 text-sm font-medium text-body hover:bg-cream hover:text-secondary">Giới thiệu</a>
            <a routerLink="/contact" routerLinkActive="bg-cream text-secondary" class="rounded-full px-4 py-2 text-sm font-medium text-body hover:bg-cream hover:text-secondary">Liên hệ</a>
          </nav>

          <div class="relative ml-auto hidden min-h-11 max-w-[440px] flex-1 md:block" role="search">
            <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-muted">
              <app-icon name="search" class="h-[18px] w-[18px]" />
            </span>
            <input
              type="search"
              class="min-h-11 w-full rounded-full border border-border-strong bg-white pl-12 pr-5 text-sm text-secondary outline-none transition-all duration-200 placeholder:text-muted focus:border-primary focus:shadow-sm"
              placeholder="Tìm sách, tác giả, thể loại..."
              autocomplete="off"
              [ngModel]="searchText()"
              (ngModelChange)="onSearch($event)"
              (focus)="searchOpen.set(suggestions().length > 0 || searchText().length > 0)"
              (keydown.escape)="searchOpen.set(false)"
              (keydown.enter)="submitSearch($event)"
              aria-label="Tìm sách" />
            @if (searchOpen() && suggestions().length) {
              <ul class="absolute left-1 right-1 top-[calc(100%+8px)] z-10 overflow-hidden rounded-xl border border-border bg-white shadow-lg" role="listbox">
                @for (s of suggestions(); track s.productId) {
                  <li>
                    <a
                      [routerLink]="['/products', s.productId]"
                      (mousedown)="$event.preventDefault()"
                      (click)="searchOpen.set(false)"
                      class="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-cream">
                      <span class="flex h-10 w-8 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-cream">
                        @if (s.imageUrl) {
                          <img [src]="s.imageUrl | productImage" [alt]="s.name" class="h-full w-full object-contain" />
                        }
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="line-clamp-1 block text-sm font-medium text-secondary">{{ s.name }}</span>
                        <span class="block text-xs text-muted">{{ s.categoryName || 'Sản phẩm' }}</span>
                      </span>
                    </a>
                  </li>
                }
                <li class="border-t border-border">
                  <a routerLink="/products" [queryParams]="{q: searchText()}" (mousedown)="$event.preventDefault()" (click)="searchOpen.set(false)" class="block px-4 py-2.5 text-center text-xs font-semibold text-primary hover:bg-cream">
                    Xem tất cả kết quả cho "{{ searchText() }}"
                  </a>
                </li>
              </ul>
            }
          </div>

          <div class="ml-auto flex items-center gap-1.5 md:ml-0">
            @if (isAuthenticated()) {
              <a routerLink="/wishlist" class="icon-btn" aria-label="Danh sách yêu thích" title="Yêu thích">
                <app-icon name="heart" class="h-5 w-5" />
              </a>
              <a routerLink="/account" class="icon-btn xl:hidden" aria-label="Tài khoản" title="Tài khoản">
                <app-icon name="user" class="h-5 w-5" />
              </a>
              <a routerLink="/account" class="hidden max-w-44 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-body hover:bg-cream hover:text-secondary xl:inline-flex">
                <span class="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-serif text-sm font-semibold text-primary">
                  {{ (currentUser()?.displayName || 'U').charAt(0) }}
                </span>
                <span class="truncate">{{ currentUser()?.displayName || 'Tài khoản' }}</span>
              </a>
            } @else {
              <a routerLink="/login" class="hidden rounded-full px-4 py-2 text-sm font-semibold text-primary hover:bg-cream sm:inline-flex">Đăng nhập</a>
              <a routerLink="/register" class="hidden rounded-full border border-border-strong bg-white px-4 py-2 text-sm font-medium text-secondary hover:border-primary hover:text-primary lg:inline-flex">Đăng ký</a>
            }

            <a routerLink="/cart" class="icon-btn relative" [attr.aria-label]="'Giỏ hàng, ' + cartCount() + ' sản phẩm'" title="Giỏ hàng">
              <app-icon name="cart" class="h-5 w-5" />
              @if (cartCount() > 0) {
                <span class="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-paper bg-primary px-1 text-[10px] font-semibold leading-none text-white tnum">{{ cartCount() }}</span>
              }
            </a>

            <button type="button" class="icon-btn ml-0.5 lg:hidden" (click)="mobileOpen.set(!mobileOpen())" [attr.aria-expanded]="mobileOpen()" aria-controls="mobile-nav" [attr.aria-label]="mobileOpen() ? 'Đóng menu' : 'Mở menu'" [title]="mobileOpen() ? 'Đóng menu' : 'Menu'">
              <app-icon [name]="mobileOpen() ? 'close' : 'menu'" class="h-5 w-5" />
            </button>
          </div>
        </div>

        @if (mobileOpen()) {
          <div class="border-t border-border py-3 lg:hidden" role="navigation" aria-label="Điều hướng di động">
            <div class="relative mb-3" role="search">
              <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted">
                <app-icon name="search" class="h-[18px] w-[18px]" />
              </span>
              <input type="search" class="min-h-11 w-full rounded-full border border-border-strong bg-white pl-11 pr-4 text-sm text-secondary outline-none transition-all placeholder:text-muted focus:border-primary" placeholder="Tìm sách, tác giả, thể loại..." autocomplete="off" [ngModel]="searchText()" (ngModelChange)="searchText.set($event)" (keydown.enter)="submitSearch($event)" aria-label="Tìm sách" />
            </div>
            <div class="grid gap-1">
              <a routerLink="/products" (click)="mobileOpen.set(false)" class="rounded-lg px-3 py-2.5 text-sm font-medium text-secondary hover:bg-cream">Cửa hàng sách</a>
              <a routerLink="/about" (click)="mobileOpen.set(false)" class="rounded-lg px-3 py-2.5 text-sm font-medium text-secondary hover:bg-cream">Giới thiệu</a>
              <a routerLink="/contact" (click)="mobileOpen.set(false)" class="rounded-lg px-3 py-2.5 text-sm font-medium text-secondary hover:bg-cream">Liên hệ</a>
              @if (isAuthenticated()) {
                <a routerLink="/wishlist" (click)="mobileOpen.set(false)" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary hover:bg-cream"><app-icon name="heart" class="h-[18px] w-[18px]" />Danh sách yêu thích</a>
                <a routerLink="/orders" (click)="mobileOpen.set(false)" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary hover:bg-cream"><app-icon name="package" class="h-[18px] w-[18px]" />Đơn hàng của tôi</a>
                <a routerLink="/account" (click)="mobileOpen.set(false)" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary hover:bg-cream"><app-icon name="user" class="h-[18px] w-[18px]" />Tài khoản</a>
                <button (click)="logout(); mobileOpen.set(false)" class="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-danger hover:bg-red-50">Đăng xuất</button>
              } @else {
                <a routerLink="/login" (click)="mobileOpen.set(false)" class="rounded-lg px-3 py-2.5 text-sm font-semibold text-primary hover:bg-cream">Đăng nhập</a>
                <a routerLink="/register" (click)="mobileOpen.set(false)" class="rounded-lg px-3 py-2.5 text-sm font-medium text-secondary hover:bg-cream">Đăng ký</a>
              }
            </div>
          </div>
        }
      </div>
    </header>
  `
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private router = inject(Router);
  private searchTerms = new Subject<string>();

  mobileOpen = signal(false);
  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;
  cartCount = this.cartService.cartCount;

  searchText = signal('');
  suggestions = signal<ProductResponse[]>([]);
  searchOpen = signal(false);

  ngOnInit() {
    this.searchTerms.pipe(
      distinctUntilChanged(),
      debounceTime(280),
      switchMap(q => {
        const keyword = q.trim();
        if (!keyword) return [];
        return this.productService.getProducts({ q: keyword, limit: 5 });
      })
    ).subscribe({
      next: res => {
        this.suggestions.set(res.items);
        this.searchOpen.set(res.items.length > 0);
      },
      error: () => {
        this.suggestions.set([]);
        this.searchOpen.set(false);
      }
    });

    this.router.events.subscribe(() => {
      this.searchOpen.set(false);
    });
  }

  onSearch(term: string) {
    this.searchText.set(term);
    if (!term.trim()) {
      this.suggestions.set([]);
      this.searchOpen.set(false);
      return;
    }
    this.searchTerms.next(term);
  }

  submitSearch(e: Event) {
    e.preventDefault();
    this.searchOpen.set(false);
    this.router.navigate(['/products'], { queryParams: { q: this.searchText().trim() } });
  }

  logout() {
    this.authService.logout();
  }
}