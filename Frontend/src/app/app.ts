import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { FooterComponent } from './shared/components/footer/footer';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, ToastContainerComponent],
  template: `
    <app-navbar></app-navbar>
    
    <main class="min-h-screen pt-20">
      <router-outlet></router-outlet>
    </main>

    <app-footer></app-footer>
    <app-toast-container></app-toast-container>
  `
})
export class App {}
