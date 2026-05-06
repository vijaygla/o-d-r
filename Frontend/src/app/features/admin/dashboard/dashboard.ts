import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ShieldCheck, Users, BookOpen, AlertCircle, Check, X, Search, Loader2, Trash2, RefreshCw } from 'lucide-angular';
import { CourseService } from '../../../core/services/course';
import { UserService } from '../../../core/services/user';
import { SearchService } from '../../../core/services/search';
import { ToastService } from '../../../core/services/toast';
import { map, forkJoin, of, switchMap, shareReplay, BehaviorSubject, combineLatest, startWith, catchError, timer, Subject, takeUntil, merge, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Course } from '../../../core/models/course.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html'
})
export class AdminDashboardComponent implements OnDestroy {
  private courseService = inject(CourseService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  readonly ShieldCheck = ShieldCheck;
  readonly Users = Users;
  readonly BookOpen = BookOpen;
  readonly AlertCircle = AlertCircle;
  readonly Check = Check;
  readonly X = X;
  readonly Search = Search;
  readonly Loader2 = Loader2;
  readonly Trash2 = Trash2;
  readonly RefreshCw = RefreshCw;

  private destroy$ = new Subject<void>();
  public refreshSubject = new BehaviorSubject<void>(undefined);
  
  // Real-time polling: Refresh data every 15 seconds
  private autoRefresh$ = timer(15000, 15000).pipe(
    takeUntil(this.destroy$),
    map(() => undefined)
  );

  private triggerRefresh$ = merge(this.refreshSubject, this.autoRefresh$);

  userSearchQuery = '';
  private userSearchSubject = new BehaviorSubject<string>('');
  isSearchingUsers = false;

  // Track loading state for specific actions
  processingIds = new Set<string>();

  pendingCourses$ = this.triggerRefresh$.pipe(
    switchMap(() => this.courseService.getCoursesByStatus(0)), // 0 = Pending
    map(courses => courses.map(c => ({
      ...c,
      submittedDate: 'Just now'
    }))),
    shareReplay(1)
  );

  private searchService = inject(SearchService);

  users$ = combineLatest([
    this.triggerRefresh$.pipe(switchMap(() => this.userService.getAllUsers())),
    this.userSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      startWith('')
    )
  ]).pipe(
    switchMap(([allUsers, query]: [any[], string]) => {
      if (!query.trim()) return of(allUsers);
      
      this.isSearchingUsers = true;
      return this.searchService.searchUsers(query).pipe(
        map((searchResults: any[]) => {
          this.isSearchingUsers = false;
          // If we have search results from MeiliSearch, we might want to 
          // ensure they match the structure of the users from UserService
          // or just use them if they are compatible.
          return searchResults.length > 0 ? searchResults : [];
        }),
        catchError(() => {
          this.isSearchingUsers = false;
          // Fallback to local filtering if backend search fails
          const lowerQuery = query.toLowerCase();
          return of(allUsers.filter((u: any) => 
            u.name.toLowerCase().includes(lowerQuery) || 
            u.email.toLowerCase().includes(lowerQuery)
          ));
        })
      );
    }),
    shareReplay(1)
  );

  stats$ = this.triggerRefresh$.pipe(
    switchMap(() => forkJoin({
      totalUsers: this.userService.getUserCount().pipe(catchError(() => of(0))),
      activeCourses: this.courseService.getCoursesByStatus(1).pipe(catchError(() => of([]))), // 1 = Approved
      pendingCourses: this.courseService.getCoursesByStatus(0).pipe(catchError(() => of([]))) // 0 = Pending
    })),
    map(({ totalUsers, activeCourses, pendingCourses }: { totalUsers: number, activeCourses: Course[], pendingCourses: Course[] }) => [
      { label: 'Total Users', value: totalUsers.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Active Courses', value: activeCourses.length.toString(), icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Pending Approval', value: pendingCourses.length.toString(), icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'System Health', value: 'Optimal', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' }
    ])
  );

  allCourses$ = this.triggerRefresh$.pipe(
    switchMap(() => this.courseService.getCourses()),
    shareReplay(1)
  );

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onUserSearchChange() {
    this.userSearchSubject.next(this.userSearchQuery);
  }

  approveCourse(id: string) {
    if (this.processingIds.has(id)) return;
    
    this.processingIds.add(id);
    this.courseService.updateCourseStatus(id, 1).subscribe({ // 1 = Approved
      next: () => {
        this.toastService.success('Course approved successfully');
        this.processingIds.delete(id);
        this.refreshSubject.next();
      },
      error: () => {
        this.toastService.error('Failed to approve course');
        this.processingIds.delete(id);
      }
    });
  }

  rejectCourse(id: string) {
    if (this.processingIds.has(id)) return;

    if (!confirm('Are you sure you want to reject this course?')) return;
    
    this.processingIds.add(id);
    this.courseService.updateCourseStatus(id, 2).subscribe({ // 2 = Rejected
      next: () => {
        this.toastService.success('Course rejected');
        this.processingIds.delete(id);
        this.refreshSubject.next();
      },
      error: () => {
        this.toastService.error('Failed to reject course');
        this.processingIds.delete(id);
      }
    });
  }

  deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.toastService.success('User deleted successfully');
          this.refreshSubject.next();
        },
        error: () => this.toastService.error('Failed to delete user')
      });
    }
  }

  isProcessing(id: string): boolean {
    return this.processingIds.has(id);
  }
}
