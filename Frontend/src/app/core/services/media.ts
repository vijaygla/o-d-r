import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';

export interface MediaResponse {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  url: string;
  uploadedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/media`;

  upload(file: File): Observable<MediaResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<MediaResponse>(`${this.apiUrl}/upload`, formData).pipe(
      catchError(err => {
        console.error('Media upload failed:', err);
        return throwError(() => err);
      })
    );
  }

  getMedia(id: string): Observable<MediaResponse> {
    return this.http.get<MediaResponse>(`${this.apiUrl}/${id}`);
  }

  deleteMedia(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
