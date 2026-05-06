import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Enrollment, EnrollmentRequest } from '../models/enrollment.models';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/enrollment`; // Using /enrollment based on Gateway config

  enroll(request: EnrollmentRequest): Observable<Enrollment | null> {
    return this.http.post<Enrollment>(this.apiUrl, request).pipe(
      catchError(err => {
        console.error('Enrollment failed:', err);
        return of(null);
      })
    );
  }

  getEnrollmentCount(courseId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/course/${courseId}/count`).pipe(
      catchError(err => {
        console.error(`Error fetching enrollment count for course ${courseId}:`, err);
        return of(0);
      })
    );
  }

  getMyEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/my-enrollments`).pipe(
      catchError(err => {
        console.error('Error fetching enrollments:', err);
        return of([]);
      })
    );
  }
}
