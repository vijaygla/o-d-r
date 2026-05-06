export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  courseTitle?: string;
  courseThumbnail?: string;
}

export interface EnrollmentRequest {
  courseId: string;
  courseName: string;
}
