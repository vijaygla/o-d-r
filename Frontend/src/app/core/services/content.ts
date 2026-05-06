import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Lesson, Section } from '../models/content.models';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/lessons`;

  getLessonsByCourseId(courseId: string): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.apiUrl}/course/${courseId}`).pipe(
      catchError(err => {
        console.error(`Error fetching lessons for course ${courseId}:`, err);
        return of([]);
      })
    );
  }

  // Helper to group lessons into sections if needed
  // Since the backend doesn't have sections yet, we group by a naming convention 
  // or just return them as a single "Course Content" section for now.
  getSectionsByCourseId(courseId: string): Observable<Section[]> {
    return this.getLessonsByCourseId(courseId).pipe(
      map(lessons => {
        if (lessons.length === 0) return [];
        
        // Group by 'Order' range or just put all in one for now
        // A more advanced logic could group by title prefixes like "Module 1: ..."
        return [{
          title: 'Course Content',
          lessons: lessons.sort((a, b) => a.order - b.order)
        }];
      })
    );
  }

  createLesson(lesson: Partial<Lesson>): Observable<Lesson> {
    return this.http.post<Lesson>(this.apiUrl, lesson);
  }

  updateLesson(id: string, lesson: Partial<Lesson>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, lesson);
  }

  deleteLesson(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
