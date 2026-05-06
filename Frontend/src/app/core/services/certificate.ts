import { Injectable } from '@angular/core';
import { of, delay } from 'rxjs';
import { Certificate } from '../models/certificate.models';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private mockCertificates: Certificate[] = [
    {
      id: 'cert1',
      courseId: '1',
      courseName: 'Complete Web Development Bootcamp',
      studentId: 'current-user',
      studentName: 'Current User',
      issueDate: '2025-10-15',
      certificateUrl: '#'
    },
    {
      id: 'cert2',
      courseId: '4',
      courseName: 'UX/UI Design Fundamentals',
      studentId: 'current-user',
      studentName: 'Current User',
      issueDate: '2025-11-20',
      certificateUrl: '#'
    }
  ];

  getStudentCertificates() {
    return of(this.mockCertificates).pipe(delay(500));
  }
}
