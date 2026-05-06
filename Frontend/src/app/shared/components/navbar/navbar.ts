import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Search, Menu, X, User, Bell, LogOut, ChevronDown } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';
import { NotificationService } from '../../../core/services/notification';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent {
  authService = inject(AuthService);
  toastService = inject(ToastService);
  notificationService = inject(NotificationService);
  router = inject(Router);
  private eRef = inject(ElementRef);
  
  readonly Search = Search;
  readonly Menu = Menu;
  readonly X = X;
  readonly User = User;
  readonly Bell = Bell;
  readonly LogOut = LogOut;
  readonly ChevronDown = ChevronDown;

  isMenuOpen = false;
  isScrolled = false;
  isProfileOpen = signal(false);
  isNotificationsOpen = signal(false);
  imageError = signal(false);

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isProfileOpen.set(false);
      this.isNotificationsOpen.set(false);
    }
  }

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled = window.scrollY > 20;
      });
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleProfile(event: Event) {
    event.stopPropagation();
    this.isNotificationsOpen.set(false);
    this.isProfileOpen.update(v => !v);
  }

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.isProfileOpen.set(false);
    this.isNotificationsOpen.update(v => !v);
  }

  markAsRead(id: string) {
    this.notificationService.markAsRead(id).subscribe();
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe();
  }

  handleImageError() {
    this.imageError.set(true);
  }

  logout() {
    this.authService.logout();
    this.toastService.success('Logged out successfully');
    this.isProfileOpen.set(false);
    this.imageError.set(false);
  }

  getInitials(name: string | undefined): string {
    if (!name || name.trim() === '') return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
