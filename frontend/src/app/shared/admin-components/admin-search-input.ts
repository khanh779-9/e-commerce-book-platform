import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AppIconComponent } from '../components/icon/icon';

@Component({
  selector: 'app-admin-search-input',
  standalone: true,
  imports: [AppIconComponent],
  template: `
    <label class="relative block w-full max-w-md">
      <span class="sr-only">Tìm kiếm</span>
      <app-icon name="search" class="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        [placeholder]="placeholder"
        class="admin-field w-full pl-10"
        [value]="value"
        (input)="onInput($event)" />
    </label>
  `
})
export class AdminSearchInputComponent {
  @Input() value = '';
  @Input() placeholder = 'Tìm kiếm...';
  @Output() valueChange = new EventEmitter<string>();

  onInput(event: Event) {
    const el = event.target as HTMLInputElement;
    this.valueChange.emit(el.value);
  }
}
