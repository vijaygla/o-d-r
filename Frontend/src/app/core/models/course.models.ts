export interface Course {
  id: string;
  title: string;
  description: string;
  instructorName: string;
  price: number;
  rating: number;
  reviewCount: number;
  thumbnailUrl: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string; // e.g. "12h 30m"
  lessonCount: number;
  status: number;
  enrollmentCount?: number;
  revenue?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}
