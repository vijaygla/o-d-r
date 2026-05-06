export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  contentUrl: string;
  contentType: 'Video' | 'PDF' | 'Text';
  order: number;
  completed?: boolean;
}

export interface Section {
  title: string;
  lessons: Lesson[];
}
