import { Component, Input } from '@angular/core';

export type AppIconName =
  | 'search' | 'heart' | 'cart' | 'user' | 'menu' | 'close'
  | 'chevron-left' | 'chevron-right' | 'chevron-down' | 'arrow-left' | 'arrow-right'
  | 'filter' | 'trash' | 'minus' | 'plus' | 'star' | 'bell'
  | 'package' | 'check' | 'edit' | 'more'
  | 'book' | 'bookmark' | 'truck' | 'shield' | 'sparkle' | 'quote'
  | 'map-pin' | 'clock' | 'globe' | 'credit-card' | 'wallet' | 'banknote';

@Component({
  selector: 'app-icon',
  standalone: true,
  host: { class: 'inline-flex shrink-0 align-middle' },
  template: `
    <svg
      viewBox="0 0 24 24"
      class="h-full w-full"
      [attr.fill]="filled ? 'currentColor' : 'none'"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false">
      @switch (name) {
        @case ('search') {
          <circle cx="11" cy="11" r="6.75" />
          <path d="m16 16 4.25 4.25" />
        }
        @case ('heart') {
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
        }
        @case ('cart') {
          <circle cx="9" cy="20" r="1" />
          <circle cx="18" cy="20" r="1" />
          <path d="M3 4h2l2.4 10.4a2 2 0 0 0 1.95 1.55h7.9a2 2 0 0 0 1.95-1.55L21 7H6" />
        }
        @case ('user') {
          <circle cx="12" cy="8" r="3.25" />
          <path d="M5.5 20c.7-4 3-6 6.5-6s5.8 2 6.5 6" />
        }
        @case ('menu') {
          <path d="M4 7h16M4 12h16M4 17h16" />
        }
        @case ('close') {
          <path d="m6 6 12 12M18 6 6 18" />
        }
        @case ('chevron-left') {
          <path d="m15 18-6-6 6-6" />
        }
        @case ('chevron-right') {
          <path d="m9 18 6-6-6-6" />
        }
        @case ('arrow-left') {
          <path d="M19 12H5M11 18l-6-6 6-6" />
        }
        @case ('arrow-right') {
          <path d="M5 12h14M13 6l6 6-6 6" />
        }
        @case ('filter') {
          <path d="M4 6h16M7 12h10M10 18h4" />
        }
        @case ('trash') {
          <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" />
        }
        @case ('minus') {
          <path d="M5 12h14" />
        }
        @case ('plus') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('star') {
          <path d="m12 3 2.75 5.57 6.15.9-4.45 4.33 1.05 6.12L12 17.03l-5.5 2.89 1.05-6.12L3.1 9.47l6.15-.9L12 3Z" />
        }
        @case ('bell') {
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7M10 19h4" />
        }
        @case ('package') {
          <path d="m4 7 8-4 8 4-8 4-8-4Z" />
          <path d="m4 7 8 4 8-4v10l-8 4-8-4V7Z" />
          <path d="M12 11v10" />
        }
        @case ('check') {
          <path d="m5 12 4 4L19 6" />
        }
        @case ('edit') {
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
        }
        @case ('more') {
          <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
        }
        @case ('book') {
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        }
        @case ('bookmark') {
          <path d="m6 4 6 3.5L18 4v16l-6-3.5L6 20V4Z" />
        }
        @case ('truck') {
          <path d="M1 5h13v11H1z" />
          <path d="M14 9h4l4 4v3h-8V9Z" />
          <circle cx="6" cy="19" r="2" />
          <circle cx="17" cy="19" r="2" />
        }
        @case ('shield') {
          <path d="M12 2 4 5.5v6c0 4.5 3.2 8 8 10.5 4.8-2.5 8-6 8-10.5v-6L12 2Z" />
          <path d="m8.5 12 2.3 2.3 4.7-4.6" />
        }
        @case ('sparkle') {
          <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
          <path d="M19 16l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16Z" />
        }
        @case ('quote') {
          <path d="M9 7c-2.8 0-5 2.2-5 5v5h5v-5H6.5A2.5 2.5 0 0 1 9 9.5V7Z" fill="currentColor" stroke="none" />
          <path d="M20 7c-2.8 0-5 2.2-5 5v5h5v-5h-2.5A2.5 2.5 0 0 1 20 9.5V7Z" fill="currentColor" stroke="none" />
        }
        @case ('map-pin') {
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        }
        @case ('clock') {
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        }
        @case ('globe') {
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.4 3.8 5.5 3.8 9S14.5 18.6 12 21c-2.5-2.4-3.8-5.5-3.8-9S9.5 5.4 12 3Z" />
        }
        @case ('credit-card') {
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20M6 15h4" />
        }
        @case ('wallet') {
          <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H20v16H5.5A2.5 2.5 0 0 1 3 17.5v-11Z" />
          <path d="M16 10h5v4h-5a2 2 0 0 1 0-4Z" />
        }
        @case ('banknote') {
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M6 12h.01M18 12h.01" />
        }
      }
    </svg>
  `
})
export class AppIconComponent {
  @Input({ required: true }) name!: AppIconName;
  @Input() filled = false;
}
