import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap, timer, switchMap, catchError, of, Subject, takeUntil } from 'rxjs';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'Info' | 'Success' | 'Warning' | 'Error';
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notification`;

  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);
  
  private destroy$ = new Subject<void>();

  constructor() {
    // Poll for notifications every 30 seconds (Production-grade alternative to SignalR for simplicity)
    timer(0, 30000)
      .pipe(
        switchMap(() => this.getNotifications()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl).pipe(
      tap(notifs => {
        this.notifications.set(notifs);
        this.unreadCount.set(notifs.filter(n => !n.isRead).length);
      }),
      catchError(() => of([]))
    );
  }

  markAsRead(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        this.notifications.update(notifs => 
          notifs.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        this.unreadCount.update(c => Math.max(0, c - 1));
      })
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        this.notifications.update(notifs => 
          notifs.map(n => ({ ...n, isRead: true }))
        );
        this.unreadCount.set(0);
      })
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
