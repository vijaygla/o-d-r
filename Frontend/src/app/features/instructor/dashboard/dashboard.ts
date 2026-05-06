import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Users, DollarSign, BookOpen, Star, TrendingUp, MoreVertical, Loader2 } from 'lucide-angular';
import { CourseService } from '../../../core/services/course';
import { CategoryService } from '../../../core/services/category';
import { EnrollmentService } from '../../../core/services/enrollment';
import { map, switchMap, forkJoin, of, shareReplay } from 'rxjs';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink, FormsModule],
  templateUrl: './dashboard.html'
})
export class InstructorDashboardComponent {
  private courseService = inject(CourseService);
  private categoryService = inject(CategoryService);
  private enrollmentService = inject(EnrollmentService);

  readonly Plus = Plus;
  readonly Users = Users;
  readonly DollarSign = DollarSign;
  readonly BookOpen = BookOpen;
  readonly Star = Star;
  readonly TrendingUp = TrendingUp;
  readonly MoreVertical = MoreVertical;
  readonly Loader2 = Loader2;

  showCategoryModal = false;
  newCategory = { name: '', description: '' };
  isCreatingCategory = false;
  errorMessage: string | null = null;

  myCoursesWithStats$ = this.courseService.getInstructorCourses().pipe(
    switchMap(courses => {
      if (courses.length === 0) return of([]);
      
      const courseStatsRequests = courses.map(course => 
        this.enrollmentService.getEnrollmentCount(course.id).pipe(
          map(count => ({
            ...course,
            enrollmentCount: count,
            revenue: count * course.price
          }))
        )
      );
      
      return forkJoin(courseStatsRequests);
    }),
    shareReplay(1)
  );

  stats$ = this.myCoursesWithStats$.pipe(
    map(courses => {
      const totalStudents = courses.reduce((acc, c) => acc + c.enrollmentCount, 0);
      const totalRevenue = courses.reduce((acc, c) => acc + c.revenue, 0);
      const avgRating = courses.length > 0 
        ? (courses.reduce((acc, c) => acc + c.rating, 0) / courses.length).toFixed(1)
        : '0.0';

      return [
        { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Total Students', value: totalStudents.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Avg. Rating', value: avgRating, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Active Courses', value: courses.length.toString(), icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' }
      ];
    })
  );

  createCategory() {
    if (!this.newCategory.name) return;
    this.isCreatingCategory = true;
    this.errorMessage = null;
    this.categoryService.createCategory(this.newCategory.name, this.newCategory.description).subscribe({
      next: () => {
        this.showCategoryModal = false;
        this.newCategory = { name: '', description: '' };
        this.isCreatingCategory = false;
      },
      error: (err) => {
        this.isCreatingCategory = false;
        this.errorMessage = 'Failed to create category. Please try again.';
        console.error('Failed to create category', err);
      }
    });
  }
}
