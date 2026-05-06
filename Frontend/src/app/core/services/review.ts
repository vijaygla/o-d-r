import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Review, CreateReviewDto } from '../models/review.models';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reviews`;

  getReviewsByCourseId(courseId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/course/${courseId}`).pipe(
      catchError(err => {
        console.error(`Error fetching reviews for course ${courseId}:`, err);
        return of([]);
      })
    );
  }

  getCourseRating(courseId: string): Observable<{ averageRating: number, reviewCount: number }> {
    return this.http.get<{ averageRating: number, reviewCount: number }>(`${this.apiUrl}/course/${courseId}/rating`).pipe(
      catchError(err => {
        console.error(`Error fetching rating for course ${courseId}:`, err);
        return of({ averageRating: 0, reviewCount: 0 });
      })
    );
  }

  addReview(review: CreateReviewDto): Observable<Review | null> {
    return this.http.post<Review>(this.apiUrl, review).pipe(
      catchError(err => {
        console.error('Error adding review:', err);
        return of(null);
      })
    );
  }

  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
