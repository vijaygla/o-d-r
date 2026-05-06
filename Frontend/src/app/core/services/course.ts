import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Course } from '../models/course.models';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/courses`;

  getCourses(): Observable<Course[]> {
    console.log(`Fetching courses from: ${this.apiUrl}`);
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(data => console.log('Raw data from API:', data)),
      map(courses => courses.map(c => this.mapToCourse(c))),
      catchError(err => {
        console.error('Error fetching courses:', err);
        return of([]); // Return empty array on error to stop spinner
      })
    );
  }

  getInstructorCourses(): Observable<Course[]> {
    return this.http.get<any[]>(`${this.apiUrl}/instructor`).pipe(
      map(courses => courses.map(c => this.mapToCourse(c))),
      catchError(err => {
        console.error('Error fetching instructor courses:', err);
        return of([]);
      })
    );
  }

  getCoursesByStatus(status: number): Observable<Course[]> {
    return this.http.get<any[]>(`${this.apiUrl}/status/${status}`).pipe(
      map(courses => courses.map(c => this.mapToCourse(c))),
      catchError(err => {
        console.error(`Error fetching courses with status ${status}:`, err);
        return of([]);
      })
    );
  }

  getCourseById(id: string): Observable<Course | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(c => this.mapToCourse(c)),
      catchError(err => {
        console.error(`Error fetching course ${id}:`, err);
        return of(undefined);
      })
    );
  }

  createCourse(course: { title: string, description: string, categoryId: string, price: number }): Observable<Course> {
    return this.http.post<any>(this.apiUrl, course).pipe(
      map(c => this.mapToCourse(c))
    );
  }

  updateCourse(id: string, course: { title: string, description: string, price: number }): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, course);
  }

  updateCourseStatus(id: string, status: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteCourse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private mapToCourse(apiCourse: any): Course {
    // Basic mapping from backend fields
    // We use placeholders for fields not currently returned by the Course entity
    
    // Log the raw course for debugging
    console.log('Mapping course:', apiCourse);

    const placeholderImages = [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800',
      'https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=800',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800',
      'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=800'
    ];
    
    const id = apiCourse.id || apiCourse.Id || '';
    const title = apiCourse.title || apiCourse.Title || 'Untitled Course';
    const description = apiCourse.description || apiCourse.Description || '';
    const price = apiCourse.price !== undefined ? apiCourse.price : (apiCourse.Price !== undefined ? apiCourse.Price : 0);
    const status = apiCourse.status !== undefined ? apiCourse.status : (apiCourse.Status !== undefined ? apiCourse.Status : 0);

    const imageIndex = Math.abs(this.hashCode(id)) % placeholderImages.length;

    // Simple category mapping based on known IDs if possible, or fallback
    let categoryName = 'General';
    if (title.toLowerCase().includes('java') || title.toLowerCase().includes('programming')) {
      categoryName = 'Development';
    } else if (title.toLowerCase().includes('learning')) {
      categoryName = 'Data Science';
    }

    return {
      id: id,
      title: title,
      description: description,
      instructorName: apiCourse.instructorName || apiCourse.InstructorName || 'Expert Instructor',
      price: price,
      rating: 4.5 + (Math.random() * 0.4), // Pseudo-random for visual polish
      reviewCount: Math.floor(Math.random() * 500) + 50,
      thumbnailUrl: apiCourse.thumbnailUrl || apiCourse.ThumbnailUrl || placeholderImages[imageIndex],
      category: categoryName,
      level: 'Intermediate',
      duration: '12h 45m',
      lessonCount: 15,
      status: status
    };
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
}
