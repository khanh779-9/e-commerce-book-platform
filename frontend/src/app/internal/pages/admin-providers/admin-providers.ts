import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { ProviderListResponse } from '../../../core/models/models';
import { AdminPageHeaderComponent } from '../../../shared/admin-components/admin-page-header';
import { AdminDataTableComponent, TableColumn } from '../../../shared/admin-components/admin-data-table';
import { AdminModalComponent } from '../../../shared/admin-components/admin-modal';
import { AdminSearchInputComponent } from '../../../shared/admin-components/admin-search-input';

@Component({
  selector: 'app-admin-providers',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPageHeaderComponent, AdminDataTableComponent, AdminModalComponent, AdminSearchInputComponent],
  template: `
    <div class="admin-page">
      <app-admin-page-header
        title="Nhà cung cấp"
        description="Quản lý các đơn vị cung cấp hàng hóa cho kho sách."
        [showAdd]="true"
        addLabel="Thêm nhà cung cấp"
        (add)="openModal()"
      />

      <app-admin-search-input
        [value]="searchTerm"
        (valueChange)="searchTerm = $event; fetchData(1)"
        placeholder="Tìm theo tên NCC..."
      />

      <app-admin-data-table
        [columns]="columns"
        [data]="items()"
        [loading]="loading()"
        [idField]="'providerId'"
        emptyMessage="Không tìm thấy nhà cung cấp nào"
        [pagination]="pagination() ? { currentPage: pagination()!.currentPage, lastPage: pagination()!.lastPage, onPageChange: (p) => fetchData(p) } : undefined"
        (edit)="openModal($event)"
        (delete)="remove($event)"
      />

      <app-admin-modal
        [isOpen]="showModal()"
        [title]="editingId() ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'"
        subtitle="Thông tin đơn vị cung ứng"
        (close)="closeModal()"
      >
        <form (submit)="save($event)" class="space-y-5">
          <div class="space-y-1.5">
            <label class="admin-label">Tên nhà cung cấp <span class="text-rose-500">*</span></label>
            <input type="text" placeholder="Nhập tên NCC..." required [(ngModel)]="form.name" name="name" class="admin-field" />
          </div>

          <div class="space-y-1.5">
            <label class="admin-label">Địa chỉ trụ sở</label>
            <input type="text" placeholder="Địa chỉ chi tiết..." [(ngModel)]="form.address" name="address" class="admin-field" />
          </div>

          <div class="space-y-1.5">
            <label class="admin-label">Số điện thoại liên hệ <span class="text-rose-500">*</span></label>
            <input type="text" placeholder="Nhập số điện thoại..." required [(ngModel)]="form.phone" name="phone" class="admin-field" />
          </div>

          <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
            <button type="button" (click)="closeModal()" class="min-h-10 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy bỏ</button>
            <button type="submit" [disabled]="saving()" class="min-h-10 flex-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
              {{ editingId() ? 'Lưu thay đổi' : 'Thêm nhà cung cấp' }}
            </button>
          </div>
        </form>
      </app-admin-modal>
    </div>
  `
})
export class AdminProvidersComponent implements OnInit {
  private adminApi = inject(AdminApiService);

  items = signal<ProviderListResponse[]>([]);
  loading = signal(false);
  saving = signal(false);
  showModal = signal(false);
  editingId = signal<number | null>(null);
  searchTerm = '';
  pagination = signal<{ currentPage: number; lastPage: number } | null>(null);

  form = { name: '', address: '', phone: '' };

  columns: TableColumn[] = [
    { header: 'ID', className: 'w-24', render: (item: ProviderListResponse) => `#${item.providerId}` },
    { header: 'Tên nhà cung cấp', render: (item: ProviderListResponse) => item.name || '' },
    { header: 'Địa chỉ', render: (item: ProviderListResponse) => item.address || '---' },
    { header: 'Số điện thoại', render: (item: ProviderListResponse) => item.phone || '---' },
  ];

  ngOnInit() { this.fetchData(); }

  fetchData(page = 1) {
    this.loading.set(true);
    this.adminApi.getAdminProviders(page, this.searchTerm).subscribe({
      next: (res) => {
        this.items.set(res.data);
        this.pagination.set({ currentPage: res.currentPage, lastPage: res.lastPage });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openModal(item?: ProviderListResponse) {
    if (item) {
      this.editingId.set(item.providerId);
      this.form = { name: item.name || '', address: item.address || '', phone: item.phone || '' };
    } else {
      this.editingId.set(null);
      this.form = { name: '', address: '', phone: '' };
    }
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); this.editingId.set(null); }

  save(ev: Event) {
    ev.preventDefault();
    if (!this.form.name || !this.form.phone) return;
    this.saving.set(true);
    const done = () => { this.saving.set(false); this.closeModal(); this.fetchData(); };
    const err = () => { this.saving.set(false); };
    if (this.editingId()) {
      this.adminApi.updateProvider(this.editingId()!, this.form).subscribe({ next: done, error: err });
    } else {
      this.adminApi.createProvider(this.form).subscribe({ next: done, error: err });
    }
  }

  remove(id: number) {
    if (!confirm('Xác nhận xóa?')) return;
    this.adminApi.deleteProvider(id).subscribe({ next: () => this.fetchData() });
  }
}
