import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { CategoryResponse, PaginatedResponse } from '../../../core/models/models';
import { AdminPageHeaderComponent } from '../../../shared/admin-components/admin-page-header';
import { AdminDataTableComponent, TableColumn } from '../../../shared/admin-components/admin-data-table';
import { AdminModalComponent } from '../../../shared/admin-components/admin-modal';
import { AdminSearchInputComponent } from '../../../shared/admin-components/admin-search-input';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPageHeaderComponent, AdminDataTableComponent, AdminModalComponent, AdminSearchInputComponent],
  template: `
    <div class="admin-page">
      <app-admin-page-header
        title="Danh mục"
        description="Quản lý các loại sản phẩm và phân loại trong hệ thống."
        [showAdd]="true"
        addLabel="Thêm danh mục mới"
        (add)="openModal()"
      />

      <app-admin-search-input
        [value]="searchTerm"
        (valueChange)="searchTerm = $event; fetchData(1)"
        placeholder="Tìm kiếm danh mục..."
      />

      <app-admin-data-table
        [columns]="columns"
        [data]="categories()"
        [loading]="loading()"
        [idField]="'categoryId'"
        emptyMessage="Không tìm thấy danh mục nào"
        [pagination]="pagination() ? { currentPage: pagination()!.currentPage, lastPage: pagination()!.lastPage, onPageChange: (p) => fetchData(p) } : undefined"
        (edit)="openModal($event)"
        (delete)="remove($event)"
      />

      <app-admin-modal
        [isOpen]="showModal()"
        [title]="editingId() ? 'Sửa danh mục' : 'Thêm danh mục'"
        subtitle="Thông tin phân loại sản phẩm"
        (close)="closeModal()"
      >
        <form (submit)="save($event)" class="space-y-6">
          <div class="space-y-2">
            <label class="admin-label">Tên danh mục <span class="text-rose-500">*</span></label>
            <input
              type="text"
              required
              [(ngModel)]="form.name" name="name"
              class="admin-field"
              placeholder="Ví dụ: Sách Văn Học, Văn Phòng Phẩm..."
            />
          </div>

          <div class="space-y-2">
            <label class="admin-label">Mô tả chi tiết</label>
            <textarea
              [(ngModel)]="form.description" name="description"
              class="admin-field min-h-[120px] resize-y"
              placeholder="Mô tả tóm tắt về loại danh mục này..."
            ></textarea>
          </div>

          <div class="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              (click)="closeModal()"
              class="min-h-10 flex-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              [disabled]="saving()"
              class="min-h-10 flex-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {{ editingId() ? 'Lưu thay đổi' : 'Thêm danh mục' }}
            </button>
          </div>
        </form>
      </app-admin-modal>
    </div>
  `
})
export class AdminCategoriesComponent implements OnInit {
  private adminApi = inject(AdminApiService);

  categories = signal<CategoryResponse[]>([]);
  loading = signal(false);
  saving = signal(false);
  showModal = signal(false);
  editingId = signal<number | null>(null);
  searchTerm = '';
  pagination = signal<{ currentPage: number; lastPage: number } | null>(null);

  form = { name: '', description: '' };

  columns: TableColumn[] = [
    { header: 'ID', className: 'w-24', render: (item: CategoryResponse) => `#${item.categoryId}` },
    { header: 'Tên danh mục', render: (item: CategoryResponse) => item.name },
    { header: 'Mô tả', render: (item: CategoryResponse) => item.description || '---' },
  ];

  ngOnInit() { this.fetchData(); }

  fetchData(page = 1) {
    this.loading.set(true);
    this.adminApi.getAdminCategories(page, this.searchTerm).subscribe({
      next: (res) => {
        this.categories.set(res.data);
        this.pagination.set({ currentPage: res.currentPage, lastPage: res.lastPage });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openModal(cat?: CategoryResponse) {
    if (cat) {
      this.editingId.set(cat.categoryId);
      this.form = { name: cat.name, description: cat.description || '' };
    } else {
      this.editingId.set(null);
      this.form = { name: '', description: '' };
    }
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  save(ev: Event) {
    ev.preventDefault();
    if (!this.form.name) return;
    this.saving.set(true);
    const payload = { name: this.form.name, description: this.form.description };

    const done = () => { this.saving.set(false); this.closeModal(); this.fetchData(); };
    const err = () => { this.saving.set(false); };

    if (this.editingId()) {
      this.adminApi.updateCategory(this.editingId()!, payload).subscribe({ next: done, error: err });
    } else {
      this.adminApi.createCategory(payload).subscribe({ next: done, error: err });
    }
  }

  remove(id: number) {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    this.adminApi.deleteCategory(id).subscribe({ next: () => this.fetchData() });
  }
}
