import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CourseProgress, ProgressRequest } from '../models/progress.models';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/progress`;

  markComplete(request: ProgressRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-complete`, request).pipe(
      catchError(err => {
        console.error('Error updating progress:', err);
        return of(null);
      })
    );
  }

  getCourseProgress(courseId: string): Observable<CourseProgress | null> {
    return this.http.get<CourseProgress>(`${this.apiUrl}/course/${courseId}`).pipe(
      catchError(err => {
        console.error(`Error fetching progress for course ${courseId}:`, err);
        return of(null);
      })
    );
  }
}
