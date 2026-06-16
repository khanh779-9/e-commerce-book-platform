import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ProductResponse, CategoryResponse } from '../../../core/models/models';
import { BookCardComponent } from '../../../shared/components/book-card/book-card';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, BookCardComponent, FormsModule],
  template: `
    <div class="space-y-12">
      <!-- Title Header -->
      <div class="border-b border-slate-100 pb-10">
        <h1 class="text-4xl font-black text-secondary uppercase tracking-tight">Cửa hàng sách</h1>
        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Tìm kiếm và lọc theo sở thích của bạn</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <!-- Sidebar Filters -->
        <aside class="col-span-1 space-y-8">
          
          <!-- Search -->
          <div class="space-y-4">
            <h3 class="font-black text-secondary text-xs uppercase tracking-widest">Tìm kiếm</h3>
            <div class="relative">
              <input type="text" 
                     [(ngModel)]="searchKeyword" 
                     (ngModelChange)="onFilterChange()" 
                     placeholder="Tên sách, tác giả..."
                     class="input-premium pl-10" />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
              </svg>
            </div>
          </div>

          <!-- Categories -->
          <div class="space-y-4">
            <h3 class="font-black text-secondary text-xs uppercase tracking-widest">Thể Loại</h3>
            <div class="flex flex-col space-y-1.5">
              <button (click)="selectCategory(null)" 
                      [class]="!selectedCategoryId() ? 'bg-secondary text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-secondary'"
                      class="w-full text-left px-4 py-3 text-xs font-black uppercase tracking-widest rounded-none transition-all cursor-pointer">
                Tất cả sách
              </button>
              @for (cat of categories(); track cat.categoryId) {
                <button (click)="selectCategory(cat.categoryId)" 
                        [class]="selectedCategoryId() === cat.categoryId ? 'bg-secondary text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-secondary'"
                        class="w-full text-left px-4 py-3 text-xs font-black uppercase tracking-widest rounded-none transition-all cursor-pointer">
                  {{ cat.name }}
                </button>
              }
            </div>
          </div>

        </aside>

        <!-- Main Catalog -->
        <section class="col-span-1 lg:col-span-3 space-y-8">
          
          <!-- Filter Header -->
          <div class="bg-slate-50 border border-slate-200/60 p-4 rounded-none flex flex-wrap items-center justify-between gap-4">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tìm thấy <span class="text-secondary font-black">{{ products().length }}</span> sản phẩm</span>
            
            <div class="flex items-center space-x-3">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sắp xếp:</label>
              <select [(ngModel)]="sortBy" 
                      (change)="onFilterChange()"
                      class="text-xs font-bold bg-white border border-slate-300 rounded-none px-3 py-1.5 focus:outline-none focus:border-slate-900">
                <option value="">Mặc định</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao đến Thấp</option>
                <option value="newest">Mới nhất</option>
              </select>
            </div>
          </div>

          <!-- Products Grid -->
          @if (loading()) {
            <div class="py-24 text-center">
              <div class="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-none mx-auto mb-4"></div>
              <p class="text-slate-400 font-bold text-xs uppercase tracking-widest">Đang tải sách...</p>
            </div>
          } @else {
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-6">
              @for (prod of products(); track prod.productId) {
                <app-book-card [product]="prod"></app-book-card>
              } @empty {
                <div class="col-span-full bg-white p-16 text-center border border-slate-200 rounded-none space-y-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-slate-200 mx-auto">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  <h3 class="font-black text-secondary uppercase tracking-tight text-lg">Không tìm thấy sách</h3>
                  <p class="text-xs text-slate-400 font-bold">Thử thay đổi từ khóa hoặc bộ lọc danh mục khác.</p>
                </div>
              }
            </div>
          }

        </section>

      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);

  // States
  categories = signal<CategoryResponse[]>([]);
  products = signal<ProductResponse[]>([]);
  loading = signal<boolean>(true);

  // Filter params
  searchKeyword = '';
  selectedCategoryId = signal<number | null>(null);
  sortBy = '';

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['categoryId']) {
        this.selectedCategoryId.set(+params['categoryId']);
      } else {
        this.selectedCategoryId.set(null);
      }
      this.loadProducts();
    });
  }

  ngOnInit() {
    this.productService.getCategories().subscribe(res => {
      this.categories.set(res);
    });
  }

  selectCategory(id: number | null) {
    this.selectedCategoryId.set(id);
    this.onFilterChange();
  }

  onFilterChange() {
    this.loadProducts();
  }

  private loadProducts() {
    this.loading.set(true);
    
    let isDescending: boolean | undefined = undefined;
    let sortKey = '';

    if (this.sortBy === 'price_asc') {
      sortKey = 'price';
      isDescending = false;
    } else if (this.sortBy === 'price_desc') {
      sortKey = 'price';
      isDescending = true;
    } else if (this.sortBy === 'newest') {
      sortKey = 'newest';
    }

    this.productService.getProducts({
      keyword: this.searchKeyword || undefined,
      categoryId: this.selectedCategoryId() || undefined,
      sortBy: sortKey || undefined,
      isDescending: isDescending
    }).subscribe({
      next: (res) => {
        this.products.set(Array.isArray(res) ? res : ((res as any).items || (res as any).data || []));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
