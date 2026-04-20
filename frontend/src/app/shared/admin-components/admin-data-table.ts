import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AdminPaginationComponent } from './admin-pagination';
import { AppIconComponent } from '../components/icon/icon';

export interface TableColumn {
  header: string;
  accessor?: string;
  render?: (item: any) => string;
  className?: string;
  cellClassName?: string;
}

@Component({
  selector: 'app-admin-data-table',
  standalone: true,
  imports: [AdminPaginationComponent, AppIconComponent],
  template: `
    <div class="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[680px] text-left text-sm">
          <thead class="border-b border-slate-200 bg-slate-50">
            <tr>
              @for (col of columns; track col) {
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.05em] text-slate-500" [class]="col.className || ''">{{ col.header }}</th>
              }
              @if (showActions) { <th class="w-28 px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.05em] text-slate-500">Thao tác</th> }
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @if (loading) {
              @for (x of [1,2,3,4,5]; track x) {
                <tr>
                  @for (col of columns; track col) { <td class="px-4 py-4"><div class="skeleton h-4 w-3/4 rounded-sm"></div></td> }
                  @if (showActions) { <td class="px-4 py-4"><div class="skeleton ml-auto h-8 w-20 rounded-sm"></div></td> }
                </tr>
              }
            } @else if (data.length === 0) {
              <tr><td [attr.colspan]="columnCount" class="px-4 py-14 text-center text-sm text-slate-500">{{ emptyMessage }}</td></tr>
            } @else {
              @for (item of data; track item[idField] || $index) {
                <tr class="hover:bg-slate-50/70">
                  @for (col of columns; track col) {
                    <td class="px-4 py-3.5 align-top text-slate-700" [class]="col.cellClassName || ''">{{ col.render ? col.render(item) : item[col.accessor || ''] }}</td>
                  }
                  @if (showActions) {
                    <td class="px-4 py-2.5 align-top">
                      <div class="flex justify-end gap-1.5">
                        @if (showEdit) {
                          <button type="button" (click)="edit.emit(item)" class="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-950" aria-label="Sửa" title="Sửa"><app-icon name="edit" class="h-4 w-4" /></button>
                        }
                        @if (showDelete) {
                          <button type="button" (click)="delete.emit(item[idField])" class="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label="Xóa" title="Xóa"><app-icon name="trash" class="h-4 w-4" /></button>
                        }
                      </div>
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
      @if (pagination) {
        <app-admin-pagination [currentPage]="pagination.currentPage" [lastPage]="pagination.lastPage" (pageChange)="pagination.onPageChange($event)" />
      }
    </div>
  `
})
export class AdminDataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() emptyMessage = 'Không có dữ liệu';
  @Input() idField = 'id';
  @Input() showEdit = true;
  @Input() showDelete = true;
  @Input() pagination?: { currentPage: number; lastPage: number; onPageChange: (p: number) => void };
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  get showActions(): boolean { return this.showEdit || this.showDelete; }
  get columnCount(): number { return this.columns.length + (this.showActions ? 1 : 0); }
}
