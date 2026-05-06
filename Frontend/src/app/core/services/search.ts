import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Course } from '../models/course.models';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/search`;

  search(query: string): Observable<Course[]> {
    if (!query || query.trim().length === 0) {
      return of([]);
    }

    return this.http.get<Course[]>(this.apiUrl, {
      params: { q: query }
    }).pipe(
      catchError(err => {
        console.error('Search failed:', err);
        return of([]);
      })
    );
  }

  searchUsers(query: string): Observable<any[]> {
    if (!query || query.trim().length === 0) {
      return of([]);
    }

    return this.http.get<any[]>(`${this.apiUrl}/users`, {
      params: { q: query }
    }).pipe(
      catchError(err => {
        console.error('User search failed:', err);
        return of([]);
      })
    );
  }

  testConnection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/test`);
  }
}
