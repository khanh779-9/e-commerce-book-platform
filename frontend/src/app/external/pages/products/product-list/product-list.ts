import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthorResponse, BookTypeResponse, CategoryResponse, PaginatedResponse, ProductResponse, ProviderResponse, PublisherResponse, ProductSearchParams } from '../../../../core/models/models';
import { ProductService } from '../../../../core/services/product.service';
import { BookCardComponent } from '../../../../shared/components/book-card/book-card';
import { AppIconComponent } from '../../../../shared/components/icon/icon';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [FormsModule, BookCardComponent, AppIconComponent],
  template: `
    <div class="bg-paper">
      <div class="site-container page-shell">
        <header class="page-header">
          <div class="mt-0 grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(420px,620px)] lg:items-end">
            <div>
              <h1 class="page-title">Tất cả sách</h1>
              <p class="page-description">Khám phá theo tác giả, thể loại, nhà xuất bản và mức giá phù hợp với bạn.</p>
            </div>
            <form (submit)="applySearch($event)" class="flex gap-2">
              <label class="relative min-w-0 flex-1">
                <span class="sr-only">Tìm kiếm sách</span>
                <app-icon name="search" class="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
                <input [(ngModel)]="q" name="q" class="field rounded-full pl-11" placeholder="Tên sách, tác giả, nhà xuất bản..." />
              </label>
              <button class="icon-btn-primary" type="submit" aria-label="Tìm kiếm" title="Tìm kiếm">
                <app-icon name="search" class="h-5 w-5" />
              </button>
            </form>
          </div>
        </header>

        <div class="mb-3 flex items-center justify-between gap-2 lg:hidden">
          <button type="button" class="btn-secondary gap-2" (click)="filtersOpen.set(!filtersOpen())" [attr.aria-expanded]="filtersOpen()">
            <app-icon name="filter" class="h-[18px] w-[18px]" />
            Bộ lọc
          </button>
          <p class="text-sm text-muted"><strong class="font-semibold text-secondary tnum">{{ result().total || 0 }}</strong> cuốn sách</p>
        </div>

        <div class="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)]">
          <aside
            class="h-fit rounded-xl border border-border bg-surface p-3 lg:sticky lg:top-28 lg:block lg:self-start"
            [class.hidden]="!filtersOpen()"
            aria-label="Bộ lọc sách">
            <div class="mb-6 flex items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <div class="flex items-center gap-2">
                  <app-icon name="filter" class="h-[18px] w-[18px] text-primary" />
                  <h2 class="font-serif text-lg font-semibold text-secondary">Bộ lọc</h2>
                </div>
                <p class="mt-1.5 text-xs leading-5 text-muted">{{ result().total || 0 }} kết quả</p>
              </div>
              <button type="button" class="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-primary" (click)="clearFilters()">
                <app-icon name="close" class="h-4 w-4" />
                Xóa
              </button>
            </div>

            <div class="space-y-3">
              <label class="block"><span class="field-label">Danh mục</span><select class="field" [(ngModel)]="categoryId" (change)="applyFilters()"><option [ngValue]="undefined">Tất cả danh mục</option>@for (x of categories(); track x.categoryId) { <option [ngValue]="x.categoryId">{{ x.name }} ({{ x.productCount }})</option> }</select></label>
              <label class="block"><span class="field-label">Tác giả</span><select class="field" [(ngModel)]="authorId" (change)="applyFilters()"><option [ngValue]="undefined">Tất cả tác giả</option>@for (x of authors(); track x.authorId) { <option [ngValue]="x.authorId">{{ x.fullName }}</option> }</select></label>
              <label class="block"><span class="field-label">Nhà xuất bản</span><select class="field" [(ngModel)]="publisherId" (change)="applyFilters()"><option [ngValue]="undefined">Tất cả NXB</option>@for (x of publishers(); track x.publisherId) { <option [ngValue]="x.publisherId">{{ x.name }}</option> }</select></label>
              <label class="block"><span class="field-label">Loại sách</span><select class="field" [(ngModel)]="bookTypeCode" (change)="applyFilters()"><option value="">Tất cả loại sách</option>@for (x of bookTypes(); track x.code) { <option [value]="x.code">{{ x.name }}</option> }</select></label>
              <label class="block"><span class="field-label">Nhà cung cấp</span><select class="field" [(ngModel)]="providerId" (change)="applyFilters()"><option [ngValue]="undefined">Tất cả NCC</option>@for (x of providers(); track x.providerId) { <option [ngValue]="x.providerId">{{ x.name }}</option> }</select></label>
              <div>
                <span class="field-label">Khoảng giá</span>
                <div class="grid grid-cols-2 gap-2"><input class="field" type="number" min="0" [(ngModel)]="minPrice" placeholder="Từ" (change)="applyFilters()" /><input class="field" type="number" min="0" [(ngModel)]="maxPrice" placeholder="Đến" (change)="applyFilters()" /></div>
              </div>
              <div class="space-y-3 border-t border-border pt-5">
                <label class="flex cursor-pointer items-center gap-3 text-sm text-body"><input type="checkbox" [(ngModel)]="promotedOnly" (change)="applyFilters()" class="h-4 w-4 rounded border-border-strong accent-[var(--color-primary)]" /> Đang khuyến mãi</label>
                <label class="flex cursor-pointer items-center gap-3 text-sm text-body"><input type="checkbox" [(ngModel)]="inStockOnly" (change)="applyFilters()" class="h-4 w-4 rounded border-border-strong accent-[var(--color-primary)]" /> Còn hàng</label>
              </div>
            </div>
          </aside>

          <main>
            <div class="mb-4 flex flex-wrap items-center justify-between border-b border-border pb-4">
              <p class="hidden text-sm text-muted lg:block"><strong class="font-semibold text-secondary tnum">{{ result().total || 0 }}</strong> cuốn sách</p>
              <label class="ml-auto flex items-center gap-2 text-sm text-body">Sắp xếp
                <select class="min-h-10 rounded-full border border-border-strong bg-white px-4 text-sm text-secondary outline-none transition-colors focus:border-primary" [(ngModel)]="sortBy" (change)="applyFilters()">
                  <option value="newest">Mới nhất</option>
                  <option value="best_selling">Bán chạy</option>
                  <option value="rating">Đánh giá cao</option>
                  <option value="price_asc">Giá thấp đến cao</option>
                  <option value="price_desc">Giá cao đến thấp</option>
                </select>
              </label>
            </div>

            @if (loading()) {
              <div class="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
                @for (_ of skeletons; track $index) {
                  <div class="rounded-xl border border-border bg-surface p-2.5 sm:p-3">
                    <div class="skeleton aspect-[3/4] rounded-lg"></div>
                    <div class="skeleton mt-4 h-4 w-3/4 rounded-sm"></div>
                    <div class="skeleton mt-2 h-4 w-full rounded-sm"></div>
                    <div class="skeleton mt-4 h-5 w-1/2 rounded-sm"></div>
                  </div>
                }
              </div>
            } @else if (result().items.length === 0) {
              <div class="rounded-xl border border-border bg-surface px-5 py-20 text-center">
                <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream text-primary"><app-icon name="search" class="h-6 w-6"/></span>
                <h2 class="mt-5 font-serif text-2xl font-semibold">Không tìm thấy sách phù hợp</h2>
                <p class="mt-2 text-sm text-muted">Hãy thử xóa bớt bộ lọc hoặc tìm bằng từ khóa khác.</p>
                <button class="btn-secondary mt-6 gap-2" (click)="clearFilters()"><app-icon name="close" class="h-[18px] w-[18px]" />Xóa bộ lọc</button>
              </div>
            } @else {
              <div class="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
                @for (book of result().items; track book.productId) { <app-book-card [product]="book" /> }
              </div>

              @if (result().totalPages > 1) {
                <nav class="mt-5 flex items-center justify-center gap-2" aria-label="Phân trang">
                  <button class="icon-btn" [disabled]="result().page <= 1" (click)="goPage(result().page - 1)" aria-label="Trang trước" title="Trang trước"><app-icon name="chevron-left" class="h-5 w-5" /></button>
                  <span class="min-w-20 px-3 text-center text-sm text-body"><strong class="font-semibold text-secondary tnum">{{ result().page }}</strong> / {{ result().totalPages }}</span>
                  <button class="icon-btn" [disabled]="result().page >= result().totalPages" (click)="goPage(result().page + 1)" aria-label="Trang sau" title="Trang sau"><app-icon name="chevron-right" class="h-5 w-5" /></button>
                </nav>
              }
            }
          </main>
        </div>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  private api = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(true);
  filtersOpen = signal(false);
  result = signal<PaginatedResponse<ProductResponse>>({ items: [], total: 0, page: 1, pageSize: 12, totalPages: 0 });
  categories = signal<CategoryResponse[]>([]);
  authors = signal<AuthorResponse[]>([]);
  publishers = signal<PublisherResponse[]>([]);
  providers = signal<ProviderResponse[]>([]);
  bookTypes = signal<BookTypeResponse[]>([]);

  q=''; categoryId?: number; authorId?: number; publisherId?: number; providerId?: number; bookTypeCode=''; minPrice?: number; maxPrice?: number; sortBy='newest'; promotedOnly=false; inStockOnly=true; page=1;
  readonly skeletons = Array(8);

  ngOnInit() {
    forkJoin({
      categories:this.api.getCategories(), authors:this.api.getAuthors(), publishers:this.api.getPublishers(),
      providers:this.api.getProviders(), bookTypes:this.api.getBookTypes()
    }).subscribe(r => {
      this.categories.set(r.categories); this.authors.set(r.authors); this.publishers.set(r.publishers);
      this.providers.set(r.providers); this.bookTypes.set(r.bookTypes);
    });

    this.route.queryParamMap.subscribe(qp => {
      this.q=qp.get('q')||''; this.categoryId=this.num(qp.get('categoryId')); this.authorId=this.num(qp.get('authorId'));
      this.publisherId=this.num(qp.get('publisherId')); this.providerId=this.num(qp.get('providerId'));
      this.bookTypeCode=qp.get('bookTypeCode')||''; this.minPrice=this.num(qp.get('minPrice')); this.maxPrice=this.num(qp.get('maxPrice'));
      this.sortBy=qp.get('sortBy')||'newest'; this.promotedOnly=qp.get('promotedOnly')==='true';
      this.inStockOnly=qp.get('inStockOnly')!=='false'; this.page=this.num(qp.get('page'))||1; this.load();
    });
  }

  private num(v:string|null){const n=v?Number(v):NaN;return Number.isFinite(n)?n:undefined;}
  private params():ProductSearchParams{return {q:this.q||undefined,categoryId:this.categoryId,authorId:this.authorId,publisherId:this.publisherId,providerId:this.providerId,bookTypeCode:this.bookTypeCode||undefined,minPrice:this.minPrice,maxPrice:this.maxPrice,sortBy:this.sortBy,promotedOnly:this.promotedOnly||undefined,inStockOnly:this.inStockOnly,page:this.page,limit:12};}
  load(){this.loading.set(true);this.api.getProducts(this.params()).subscribe({next:r=>{this.result.set(r);this.loading.set(false);},error:()=>this.loading.set(false)});}
  applySearch(e:Event){e.preventDefault();this.page=1;this.navigate();}
  applyFilters(){this.page=1;this.navigate();}
  goPage(page:number){this.page=page;this.navigate();window.scrollTo({top:0,behavior:'smooth'});}
  clearFilters(){this.q='';this.categoryId=this.authorId=this.publisherId=this.providerId=this.minPrice=this.maxPrice=undefined;this.bookTypeCode='';this.sortBy='newest';this.promotedOnly=false;this.inStockOnly=true;this.page=1;this.navigate();}
  private navigate(){const p=this.params();const clean=Object.fromEntries(Object.entries(p).filter(([,v])=>v!==undefined&&v!==''));this.router.navigate([], {relativeTo:this.route,queryParams:clean});}
}