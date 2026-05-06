export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  passingScore: number;
  questions: Question[];
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  options: string[]; // Backend sends as semicolon separated, we'll parse it
  correctOptionIndex: number;
}

export interface QuizSubmission {
  quizId: string;
  studentId: string;
  answers: number[]; // Index of chosen options
}

export interface QuizResult {
  quizId: string;
  score: number;
  isPassed: boolean;
  correctAnswers: number[];
}
