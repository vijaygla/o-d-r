export interface Review {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewDto {
  courseId: string;
  rating: number;
  comment: string;
}
