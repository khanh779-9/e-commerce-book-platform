import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-admin-modal',
  standalone: true,
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/45 p-3 sm:p-6" (click)="closeModal()">
        <section class="my-auto flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
          <header class="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
            <div>
              <h2 class="text-lg font-semibold text-slate-950">{{ title }}</h2>
              @if (subtitle) { <p class="mt-1 text-sm text-slate-500">{{ subtitle }}</p> }
            </div>
            <button type="button" (click)="closeModal()" class="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Đóng hộp thoại">Đóng</button>
          </header>
          <div class="flex-1 overflow-y-auto p-5 sm:p-6">
            <ng-content></ng-content>
          </div>
        </section>
      </div>
    }
  `
})
export class AdminModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Output() close = new EventEmitter<void>();
  closeModal() { this.close.emit(); }
}
