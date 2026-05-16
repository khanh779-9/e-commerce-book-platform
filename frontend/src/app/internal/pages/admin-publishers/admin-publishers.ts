import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { PublisherListResponse } from '../../../core/models/models';
import { AdminPageHeaderComponent } from '../../../shared/admin-components/admin-page-header';
import { AdminDataTableComponent, TableColumn } from '../../../shared/admin-components/admin-data-table';
import { AdminModalComponent } from '../../../shared/admin-components/admin-modal';
import { AdminSearchInputComponent } from '../../../shared/admin-components/admin-search-input';

@Component({
  selector: 'app-admin-publishers',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPageHeaderComponent, AdminDataTableComponent, AdminModalComponent, AdminSearchInputComponent],
  template: `
    <div class="admin-page">
      <app-admin-page-header
        title="Nhà xuất bản"
        description="Danh sách các đối tác xuất bản sách của BookZone."
        [showAdd]="true"
        addLabel="Thêm nhà xuất bản"
        (add)="openModal()"
      />

      <app-admin-search-input
        [value]="searchTerm"
        (valueChange)="searchTerm = $event; fetchData(1)"
        placeholder="Tìm theo tên NXB..."
      />

      <app-admin-data-table
        [columns]="columns"
        [data]="items()"
        [loading]="loading()"
        [idField]="'publisherId'"
        emptyMessage="Không có dữ liệu NXB"
        [pagination]="pagination() ? { currentPage: pagination()!.currentPage, lastPage: pagination()!.lastPage, onPageChange: (p) => fetchData(p) } : undefined"
        (edit)="openModal($event)"
        (delete)="remove($event)"
      />

      <app-admin-modal
        [isOpen]="showModal()"
        [title]="editingId() ? 'Sửa nhà xuất bản' : 'Thêm nhà xuất bản'"
        subtitle="Thông tin đơn vị đối tác"
        (close)="closeModal()"
      >
        <form (submit)="save($event)" class="space-y-5">
          <div class="space-y-1.5">
            <label class="admin-label">Tên nhà xuất bản <span class="text-rose-500">*</span></label>
            <input type="text" placeholder="Nhập tên NXB..." required [(ngModel)]="form.name" name="name" class="admin-field" />
          </div>

          <div class="space-y-1.5">
            <label class="admin-label">Địa chỉ</label>
            <input type="text" placeholder="Địa chỉ trụ sở..." [(ngModel)]="form.address" name="address" class="admin-field" />
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <label class="admin-label">Email liên hệ</label>
              <input type="email" placeholder="nxb@example.com" [(ngModel)]="form.email" name="email" class="admin-field" />
            </div>
            <div class="space-y-1.5">
              <label class="admin-label">Số điện thoại</label>
              <input type="text" placeholder="024..." [(ngModel)]="form.phone" name="phone" class="admin-field" />
            </div>
          </div>

          <div class="flex gap-3 pt-6 border-t border-slate-100">
            <button type="button" (click)="closeModal()" class="min-h-10 flex-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy bỏ</button>
            <button type="submit" [disabled]="saving()" class="min-h-10 flex-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
              {{ editingId() ? 'Lưu thay đổi' : 'Thêm đối tác' }}
            </button>
          </div>
        </form>
      </app-admin-modal>
    </div>
  `
})
export class AdminPublishersComponent implements OnInit {
  private adminApi = inject(AdminApiService);

  items = signal<PublisherListResponse[]>([]);
  loading = signal(false);
  saving = signal(false);
  showModal = signal(false);
  editingId = signal<number | null>(null);
  searchTerm = '';
  pagination = signal<{ currentPage: number; lastPage: number } | null>(null);

  form = { name: '', address: '', email: '', phone: '' };

  columns: TableColumn[] = [
    { header: 'ID', className: 'w-24', render: (item: PublisherListResponse) => `#${item.publisherId}` },
    { header: 'Tên NXB', render: (item: PublisherListResponse) => item.name || '' },
    { header: 'Địa chỉ', render: (item: PublisherListResponse) => item.address || '---' },
    { header: 'Liên hệ', render: (item: PublisherListResponse) => `${item.email || ''}${item.phone ? ' · ' + item.phone : ''}` },
  ];

  ngOnInit() { this.fetchData(); }

  fetchData(page = 1) {
    this.loading.set(true);
    this.adminApi.getAdminPublishers(page, this.searchTerm).subscribe({
      next: (res) => {
        this.items.set(res.data);
        this.pagination.set({ currentPage: res.currentPage, lastPage: res.lastPage });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openModal(item?: PublisherListResponse) {
    if (item) {
      this.editingId.set(item.publisherId);
      this.form = { name: item.name || '', address: item.address || '', email: item.email || '', phone: item.phone || '' };
    } else {
      this.editingId.set(null);
      this.form = { name: '', address: '', email: '', phone: '' };
    }
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); this.editingId.set(null); }

  save(ev: Event) {
    ev.preventDefault();
    if (!this.form.name) return;
    this.saving.set(true);
    const done = () => { this.saving.set(false); this.closeModal(); this.fetchData(); };
    const err = () => { this.saving.set(false); };
    if (this.editingId()) {
      this.adminApi.updatePublisher(this.editingId()!, this.form).subscribe({ next: done, error: err });
    } else {
      this.adminApi.createPublisher(this.form).subscribe({ next: done, error: err });
    }
  }

  remove(id: number) {
    if (!confirm('Xác nhận xóa?')) return;
    this.adminApi.deletePublisher(id).subscribe({ next: () => this.fetchData() });
  }
}
