import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Star, Clock, BookOpen, User, Play, CheckCircle2, Globe, Calendar, Award, MessageSquare, Loader2, Send } from 'lucide-angular';
import { CourseService } from '../../../core/services/course';
import { ContentService } from '../../../core/services/content';
import { ReviewService } from '../../../core/services/review';
import { EnrollmentService } from '../../../core/services/enrollment';
import { map, switchMap, shareReplay, tap, of, catchError } from 'rxjs';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, FormsModule],
  templateUrl: './details.html'
})
export class CourseDetailsComponent {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private contentService = inject(ContentService);
  private reviewService = inject(ReviewService);
  private enrollmentService = inject(EnrollmentService);

  readonly Star = Star;
  readonly Clock = Clock;
  readonly BookOpen = BookOpen;
  readonly User = User;
  readonly Play = Play;
  readonly CheckCircle2 = CheckCircle2;
  readonly Globe = Globe;
  readonly Calendar = Calendar;
  readonly Award = Award;
  readonly MessageSquare = MessageSquare;
  readonly Loader2 = Loader2;
  readonly Send = Send;

  courseId$ = this.route.params.pipe(map(params => params['id']));

  course$ = this.courseId$.pipe(
    switchMap(id => this.courseService.getCourseById(id)),
    shareReplay(1)
  );

  sections$ = this.courseId$.pipe(
    switchMap(id => this.contentService.getSectionsByCourseId(id))
  );

  reviews$ = this.courseId$.pipe(
    switchMap(id => this.reviewService.getReviewsByCourseId(id)),
    shareReplay(1)
  );

  isEnrolled$ = this.enrollmentService.getMyEnrollments().pipe(
    switchMap(enrollments => this.courseId$.pipe(
      map(id => enrollments.some(e => e.courseId === id))
    )),
    catchError(() => of(false))
  );

  // Review submission state
  newReviewRating = 5;
  newReviewComment = '';
  isSubmittingReview = false;

  learningOutcomes = [
    'Master the fundamental concepts of the subject',
    'Build real-world projects from scratch',
    'Learn industry best practices and workflows',
    'Gain hands-on experience with modern tools',
    'Prepare for professional certification',
    'Join a global community of expert practitioners'
  ];

  submitReview(courseId: string) {
    if (!this.newReviewComment) return;
    this.isSubmittingReview = true;
    this.reviewService.addReview({
      courseId,
      rating: this.newReviewRating,
      comment: this.newReviewComment
    }).subscribe({
      next: () => {
        this.newReviewComment = '';
        this.newReviewRating = 5;
        this.isSubmittingReview = false;
        // Refresh reviews
        this.reviews$ = this.reviewService.getReviewsByCourseId(courseId);
      },
      error: () => this.isSubmittingReview = false
    });
  }
}
