import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { AppIconComponent } from '../icon/icon';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  template: `
    <div class="pointer-events-none fixed inset-x-4 bottom-4 z-[90] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div
          class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all"
          [ngClass]="{
            'border-emerald-200 bg-white text-secondary': t.type === 'success',
            'border-red-200 bg-white text-secondary': t.type === 'error',
            'border-border bg-white text-secondary': t.type === 'info'
          }">
          <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            [ngClass]="{
              'bg-emerald-50 text-emerald-600': t.type === 'success',
              'bg-red-50 text-red-600': t.type === 'error',
              'bg-cream text-primary': t.type === 'info'
            }">
            <app-icon class="h-4 w-4" [name]="t.type === 'success' ? 'check' : t.type === 'error' ? 'close' : 'sparkle'" />
          </span>
          <p class="flex-1 text-sm leading-6">{{ t.message }}</p>
          <button type="button" class="mt-0.5 text-muted transition-colors hover:text-secondary" (click)="toast.dismiss(t.id)" aria-label="Đóng">
            <app-icon name="close" class="h-4 w-4" />
          </button>
        </div>
      }
    </div>
  `
})
export class ToastsComponent {
  constructor(protected toast: ToastService) {}
}
