import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { FooterComponent } from '../../../shared/components/footer/footer';
import { ToastsComponent } from '../../../shared/components/toasts/toasts';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastsComponent],
  template: `
    <div class="min-h-screen bg-background text-body">
      <app-navbar></app-navbar>
      <main>
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
      <app-toasts></app-toasts>
    </div>
  `
})
export class MainLayoutComponent {}
