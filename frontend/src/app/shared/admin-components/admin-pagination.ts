import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AppIconComponent } from '../components/icon/icon';

@Component({
  selector: 'app-admin-pagination',
  standalone: true,
  imports: [AppIconComponent],
  template: `
    @if (lastPage > 1) {
      <div class="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p class="text-sm text-slate-500">Trang <span class="font-semibold text-slate-800">{{ currentPage }}</span> / {{ lastPage }}</p>
        <div class="flex flex-wrap items-center gap-1.5">
          <button type="button" (click)="goPage(currentPage - 1)" [disabled]="currentPage <= 1" class="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Trang trước" title="Trang trước"><app-icon name="chevron-left" class="h-[18px] w-[18px]" /></button>
          @for (p of pages; track p) {
            <button type="button" (click)="goPage(p)"
                    [class]="p === currentPage ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'"
                    class="min-h-9 min-w-9 rounded-md border px-2 text-sm font-medium">{{ p }}</button>
          }
          <button type="button" (click)="goPage(currentPage + 1)" [disabled]="currentPage >= lastPage" class="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Trang sau" title="Trang sau"><app-icon name="chevron-right" class="h-[18px] w-[18px]" /></button>
        </div>
      </div>
    }
  `
})
export class AdminPaginationComponent {
  @Input() currentPage = 1;
  @Input() lastPage = 1;
  @Output() pageChange = new EventEmitter<number>();

  get pages(): number[] {
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.lastPage, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    const result: number[] = [];
    for (let i = start; i <= end; i++) result.push(i);
    return result;
  }

  goPage(p: number) {
    if (p >= 1 && p <= this.lastPage && p !== this.currentPage) this.pageChange.emit(p);
  }
}
