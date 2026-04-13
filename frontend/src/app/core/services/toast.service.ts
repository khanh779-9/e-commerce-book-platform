import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

let nextId = 1;

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: Toast['type'] = 'info', duration = 4000) {
    if (!message) return;
    const toast: Toast = { id: nextId++, type, message };
    this.toasts.update(list => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), duration);
  }

  success(message: string) { this.show(message, 'success'); }
  error(message: string) { this.show(message, 'error', 6000); }

  dismiss(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
