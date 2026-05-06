import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category.models';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/categories`;

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl).pipe(
      catchError(err => {
        console.error('Error fetching categories:', err);
        return of([]);
      })
    );
  }

  getCategoryById(id: string): Observable<Category | undefined> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.error(`Error fetching category ${id}:`, err);
        return of(undefined);
      })
    );
  }

  createCategory(name: string, description: string): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, { name, description });
  }
}
