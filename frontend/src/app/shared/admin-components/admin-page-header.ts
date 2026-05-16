import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AppIconComponent } from '../components/icon/icon';

@Component({
  selector: 'app-admin-page-header',
  standalone: true,
  imports: [AppIconComponent],
  template: `
    <header class="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-950">{{ title }}</h1>
        @if (description) {
          <p class="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{{ description }}</p>
        }
      </div>
      @if (showAdd) {
        <button type="button" (click)="add.emit()" class="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 sm:self-auto">
          <app-icon name="plus" class="h-[18px] w-[18px]" />
          {{ addLabel || 'Thêm mới' }}
        </button>
      }
    </header>
  `
})
export class AdminPageHeaderComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() showAdd = false;
  @Input() addLabel = 'Thêm mới';
  @Output() add = new EventEmitter<void>();
}
