export interface CourseProgress {
  courseId: string;
  studentId: string;
  percentageComplete: number;
  completedLessons: string[];
  lastAccessedAt: string;
}

export interface ProgressRequest {
  courseId: string;
  lessonId: string;
}
