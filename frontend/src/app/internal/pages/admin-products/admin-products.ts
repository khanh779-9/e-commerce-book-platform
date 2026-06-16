import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { AuthorResponse, BookTypeResponse, CategoryResponse, ProductResponse, ProviderResponse, PublisherResponse, UnitResponse } from '../../../core/models/models';
import { AdminPageHeaderComponent } from '../../../shared/admin-components/admin-page-header';
import { AdminModalComponent } from '../../../shared/admin-components/admin-modal';
import { AdminSearchInputComponent } from '../../../shared/admin-components/admin-search-input';
import { AdminPaginationComponent } from '../../../shared/admin-components/admin-pagination';

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 120 160%22%3E%3Crect width=%22120%22 height=%22160%22 fill=%22%23f1f5f9%22/%3E%3Cpath d=%22M32 35h56v90H32z%22 fill=%22none%22 stroke=%22%2394a3b8%22 stroke-width=%223%22/%3E%3Cpath d=%22M42 52h36M42 65h30%22 stroke=%22%2394a3b8%22 stroke-width=%223%22/%3E%3C/svg%3E';

type ProductForm = {
  name: string; type: 'book'|'other'; categoryId?: number; unitId?: number; providerId?: number; price: number; stockQuantity: number;
  description: string; imageUrl: string; dataJson: string; title: string; authorId?: number; publisherId?: number; publishedYear?: number; bookTypeCode?: string;
};

@Component({
  selector: 'app-admin-products', standalone: true,
  imports: [CommonModule, FormsModule, AdminPageHeaderComponent, AdminModalComponent, AdminSearchInputComponent, AdminPaginationComponent],
  template: `
    <div class="admin-page">
      <app-admin-page-header title="Sản phẩm & sách" description="Quản lý thông tin hàng hóa, metadata sách, giá bán, tồn kho và nhà cung cấp." [showAdd]="true" addLabel="Thêm sản phẩm" (add)="openCreate()" />

      <section class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
        <app-admin-search-input [value]="searchTerm" (valueChange)="searchTerm = $event; loadProducts(1)" placeholder="Tìm tên sách, tác giả, nhà xuất bản..." />
        <div class="flex items-center gap-2 text-sm text-slate-500"><span>{{ total() | number }} sản phẩm</span><span>·</span><span>{{ lowStockCount() }} sắp/hết hàng</span></div>
      </section>

      @if (loading()) { <div class="skeleton h-80 rounded-md"></div> }
      @else {
        <div class="overflow-hidden rounded-md border border-slate-200 bg-white">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[1120px] text-left text-sm">
              <thead class="border-b border-slate-200 bg-slate-50"><tr>
                <th class="admin-th">Sản phẩm</th><th class="admin-th">Phân loại</th><th class="admin-th">Nguồn hàng</th>
                <th class="admin-th text-right">Giá</th><th class="admin-th text-right">Tồn</th><th class="admin-th text-right">Đã bán</th><th class="admin-th text-right">Thao tác</th>
              </tr></thead>
              <tbody class="divide-y divide-slate-100">
                @for (p of products(); track p.productId) {
                  <tr class="align-top hover:bg-slate-50/70">
                    <td class="px-4 py-3.5"><div class="flex gap-3">
                      <div class="flex h-20 w-14 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-slate-200 bg-slate-50"><img [src]="p.imageUrl || fallbackImg" [alt]="p.name" class="h-full w-full object-contain" (error)="$any($event.target).src = fallbackImg" /></div>
                      <div class="min-w-0"><p class="max-w-[330px] truncate font-medium text-slate-950">{{ p.name }}</p>
                        @if (p.bookDetails?.authorName) { <p class="mt-1 max-w-[330px] truncate text-xs text-slate-500">{{ p.bookDetails?.authorName }}</p> }
                        <p class="mt-1 text-xs text-slate-400">#{{ p.productId }} @if(p.bookDetails?.publishedYear){ · {{ p.bookDetails?.publishedYear }} }</p>
                      </div></div></td>
                    <td class="px-4 py-3.5"><p class="text-slate-700">{{ p.categoryName || 'Chưa phân loại' }}</p><p class="mt-1 text-xs text-slate-400">{{ p.bookDetails?.bookTypeName || p.unitName || '-' }}</p></td>
                    <td class="px-4 py-3.5"><p class="text-slate-700">{{ p.providerName || '-' }}</p><p class="mt-1 text-xs text-slate-400">{{ p.bookDetails?.publisherName || '-' }}</p></td>
                    <td class="px-4 py-3.5 text-right"><p class="font-medium text-slate-950 tnum">{{ p.effectivePrice | currency:'VND':'symbol-narrow':'1.0-0' }}</p>@if(p.discountPercent){<p class="mt-1 text-xs text-red-600">-{{ p.discountPercent }}%</p>}</td>
                    <td class="px-4 py-3.5 text-right"><span class="rounded-sm px-2 py-1 text-xs font-medium" [class]="stockClass(p.stockQuantity)">{{ p.stockQuantity }}</span></td>
                    <td class="px-4 py-3.5 text-right text-slate-600 tnum">{{ p.soldQuantity }}</td>
                    <td class="px-4 py-3.5 text-right whitespace-nowrap"><button type="button" (click)="openEdit(p)" class="text-sm font-medium text-slate-700 hover:underline">Sửa</button><button type="button" (click)="remove(p)" class="ml-4 text-sm font-medium text-red-600 hover:underline">Xóa</button></td>
                  </tr>
                } @empty { <tr><td colspan="7" class="px-4 py-16 text-center text-slate-500">Không có sản phẩm phù hợp.</td></tr> }
              </tbody>
            </table>
          </div>
          @if(totalPages()>1){<app-admin-pagination [currentPage]="page()" [lastPage]="totalPages()" (pageChange)="loadProducts($event)" />}
        </div>
      }

      <app-admin-modal [isOpen]="showModal()" [title]="editing() ? 'Sửa sản phẩm' : 'Thêm sản phẩm'" subtitle="Các trường có dấu * là bắt buộc" (close)="closeModal()">
        <form (submit)="save($event)" class="space-y-6">
          <section class="space-y-4">
            <div><h3 class="text-sm font-semibold text-slate-950">Thông tin bán hàng</h3><p class="mt-1 text-xs text-slate-500">Dữ liệu chung trong bảng Products.</p></div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="sm:col-span-2"><label class="admin-label">Tên sản phẩm *</label><input [(ngModel)]="form.name" name="name" required maxlength="255" class="admin-field" /></div>
              <div><label class="admin-label">Loại bản ghi *</label><select [(ngModel)]="form.type" name="type" class="admin-field"><option value="book">Sách</option><option value="other">Sản phẩm khác</option></select></div>
              <div><label class="admin-label">Nhà cung cấp *</label><select [(ngModel)]="form.providerId" name="providerId" required class="admin-field"><option [ngValue]="undefined">Chọn nhà cung cấp</option>@for(x of providers();track x.providerId){<option [ngValue]="x.providerId">{{ x.name }}</option>}</select></div>
              <div><label class="admin-label">Danh mục</label><select [(ngModel)]="form.categoryId" name="categoryId" class="admin-field"><option [ngValue]="undefined">Không chọn</option>@for(x of categories();track x.categoryId){<option [ngValue]="x.categoryId">{{ x.name }}</option>}</select></div>
              <div><label class="admin-label">Đơn vị tính</label><select [(ngModel)]="form.unitId" name="unitId" class="admin-field"><option [ngValue]="undefined">Không chọn</option>@for(x of units();track x.unitId){<option [ngValue]="x.unitId">{{ x.name }}</option>}</select></div>
              <div><label class="admin-label">Giá bán (VNĐ) *</label><input type="number" min="0" max="999999.99" step="1000" [(ngModel)]="form.price" name="price" required class="admin-field tnum" /></div>
              <div><label class="admin-label">Tồn kho *</label><input type="number" min="0" [(ngModel)]="form.stockQuantity" name="stockQuantity" required class="admin-field tnum" /></div>
              <div class="sm:col-span-2"><label class="admin-label">URL ảnh bìa</label><input [(ngModel)]="form.imageUrl" name="imageUrl" maxlength="255" class="admin-field" placeholder="/uploads/products/... hoặc URL ảnh" /></div>
              <div class="sm:col-span-2"><label class="admin-label">Mô tả</label><textarea [(ngModel)]="form.description" name="description" rows="5" class="admin-field resize-y"></textarea></div>
            </div>
          </section>

          @if(form.type === 'book') {
            <section class="space-y-4 border-t border-slate-200 pt-6">
              <div><h3 class="text-sm font-semibold text-slate-950">Thông tin sách</h3><p class="mt-1 text-xs text-slate-500">Dữ liệu bảng Books; tác giả, NXB và loại sách phải khớp danh mục SQL.</p></div>
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="sm:col-span-2"><label class="admin-label">Tên hiển thị của sách</label><input [(ngModel)]="form.title" name="title" class="admin-field" placeholder="Để trống sẽ dùng tên sản phẩm" /></div>
                <div><label class="admin-label">Tác giả *</label><select [(ngModel)]="form.authorId" name="authorId" required class="admin-field"><option [ngValue]="undefined">Chọn tác giả</option>@for(x of authors();track x.authorId){<option [ngValue]="x.authorId">{{ x.fullName }}</option>}</select></div>
                <div><label class="admin-label">Nhà xuất bản *</label><select [(ngModel)]="form.publisherId" name="publisherId" required class="admin-field"><option [ngValue]="undefined">Chọn NXB</option>@for(x of publishers();track x.publisherId){<option [ngValue]="x.publisherId">{{ x.name }}</option>}</select></div>
                <div><label class="admin-label">Loại sách *</label><select [(ngModel)]="form.bookTypeCode" name="bookTypeCode" required class="admin-field"><option [ngValue]="undefined">Chọn loại sách</option>@for(x of bookTypes();track x.code){<option [value]="x.code">{{ x.name }}</option>}</select></div>
                <div><label class="admin-label">Năm xuất bản *</label><input type="number" min="1000" [max]="maxYear" [(ngModel)]="form.publishedYear" name="publishedYear" required class="admin-field tnum" /></div>
              </div>
            </section>
          }

          <details class="border-t border-slate-200 pt-5"><summary class="cursor-pointer text-sm font-medium text-slate-700">Dữ liệu mở rộng (JSON)</summary><div class="mt-3"><textarea [(ngModel)]="form.dataJson" name="dataJson" rows="4" class="admin-field font-mono text-xs" placeholder='{"isbn":"...","pages":320}'></textarea></div></details>

          @if(errorMessage()){<div class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ errorMessage() }}</div>}
          <div class="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end"><button type="button" (click)="closeModal()" class="btn-secondary">Hủy</button><button type="submit" [disabled]="saving()" class="btn-dark">{{ saving() ? 'Đang lưu...' : (editing() ? 'Lưu thay đổi' : 'Tạo sản phẩm') }}</button></div>
        </form>
      </app-admin-modal>
    </div>
  `
})
export class AdminProductsComponent implements OnInit {
  private api = inject(AdminApiService);
  products=signal<ProductResponse[]>([]); categories=signal<CategoryResponse[]>([]); units=signal<UnitResponse[]>([]); providers=signal<ProviderResponse[]>([]);
  authors=signal<AuthorResponse[]>([]); publishers=signal<PublisherResponse[]>([]); bookTypes=signal<BookTypeResponse[]>([]);
  loading=signal(false); saving=signal(false); showModal=signal(false); editing=signal<ProductResponse|null>(null); errorMessage=signal<string|null>(null);
  page=signal(1); totalPages=signal(1); total=signal(0); lowStockCount=signal(0); searchTerm=''; fallbackImg=FALLBACK_IMG; maxYear=new Date().getFullYear()+1;
  form:ProductForm=this.emptyForm();

  ngOnInit(){this.loadProducts();this.loadRefs();}
  loadProducts(page=1){this.loading.set(true);this.api.getProductsPage(page,20,this.searchTerm).subscribe({next:r=>{this.products.set(r.items);this.page.set(r.page);this.totalPages.set(r.totalPages);this.total.set(r.total);this.lowStockCount.set(r.items.filter(x=>x.stockQuantity<=10).length);this.loading.set(false);},error:()=>this.loading.set(false)});}
  private loadRefs(){
    this.api.getCategories().subscribe({next:x=>this.categories.set(x)}); this.api.getUnits().subscribe({next:x=>this.units.set(x)}); this.api.getProviders().subscribe({next:x=>this.providers.set(x)});
    this.api.getAuthors().subscribe({next:x=>this.authors.set(x)}); this.api.getPublishers().subscribe({next:x=>this.publishers.set(x)}); this.api.getBookTypes().subscribe({next:x=>this.bookTypes.set(x)});
  }
  openCreate(){this.editing.set(null);this.form=this.emptyForm();this.errorMessage.set(null);this.showModal.set(true);}
  openEdit(p:ProductResponse){this.editing.set(p);this.form={name:p.name,type:p.bookDetails?'book':'other',categoryId:p.categoryId,unitId:p.unitId,providerId:p.providerId,price:p.price,stockQuantity:p.stockQuantity,description:p.description||'',imageUrl:p.imageUrl||'',dataJson:p.dataJson||'',title:p.bookDetails?.title||'',authorId:p.bookDetails?.authorId,publisherId:p.bookDetails?.publisherId,publishedYear:p.bookDetails?.publishedYear,bookTypeCode:p.bookDetails?.bookTypeCode};this.errorMessage.set(null);this.showModal.set(true);}
  closeModal(){this.showModal.set(false);this.editing.set(null);this.errorMessage.set(null);}
  save(ev:Event){ev.preventDefault();if(!this.form.name.trim()||!this.form.providerId||this.form.price<0||this.form.stockQuantity<0){this.errorMessage.set('Vui lòng kiểm tra tên, nhà cung cấp, giá và tồn kho.');return;}if(this.form.type==='book'&&(!this.form.authorId||!this.form.publisherId||!this.form.bookTypeCode||!this.form.publishedYear)){this.errorMessage.set('Sản phẩm sách cần đủ tác giả, nhà xuất bản, loại sách và năm xuất bản.');return;}if(this.form.dataJson){try{JSON.parse(this.form.dataJson);}catch{this.errorMessage.set('Dữ liệu JSON không hợp lệ.');return;}}
    const payload:any={...this.form,title:this.form.title||this.form.name};if(this.form.type==='other'){delete payload.authorId;delete payload.publisherId;delete payload.publishedYear;delete payload.bookTypeCode;delete payload.title;}this.saving.set(true);this.errorMessage.set(null);const request=this.editing()?this.api.updateProduct(this.editing()!.productId,payload):this.api.createProduct(payload);request.subscribe({next:()=>{this.saving.set(false);this.closeModal();this.loadProducts(this.page());},error:e=>{this.saving.set(false);this.errorMessage.set(e?.error?.message||'Không thể lưu sản phẩm.');}});
  }
  remove(p:ProductResponse){if(!confirm(`Xóa “${p.name}”? Sản phẩm có lịch sử đơn hàng sẽ không được phép xóa.`))return;this.api.deleteProduct(p.productId).subscribe({next:()=>this.loadProducts(this.page()),error:e=>alert(e?.error?.message||'Không thể xóa sản phẩm.')});}
  stockClass(q:number){return q<=0?'bg-red-50 text-red-700':q<=10?'bg-amber-50 text-amber-700':'bg-emerald-50 text-emerald-700';}
  private emptyForm():ProductForm{return{name:'',type:'book',price:0,stockQuantity:0,description:'',imageUrl:'',dataJson:'',title:'',publishedYear:new Date().getFullYear()};}
}
