import { Injectable } from '@angular/core';
import { of, delay } from 'rxjs';
import { Quiz, QuizSubmission, QuizResult } from '../models/assessment.models';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private mockQuizzes: Quiz[] = [
    {
      id: 'q1',
      courseId: '1',
      title: 'Web Development Basics Quiz',
      description: 'Test your knowledge on HTML, CSS, and basic JS.',
      passingScore: 70,
      questions: [
        {
          id: 'ques1',
          quizId: 'q1',
          text: 'What does HTML stand for?',
          options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyperlink and Text Markup Language', 'Home Tool Markup Language'],
          correctOptionIndex: 0
        },
        {
          id: 'ques2',
          quizId: 'q1',
          text: 'Which property is used to change the background color in CSS?',
          options: ['color', 'bgcolor', 'background-color', 'fill-color'],
          correctOptionIndex: 2
        }
      ]
    }
  ];

  getQuizByCourseId(courseId: string) {
    return of(this.mockQuizzes.find(q => q.courseId === courseId)).pipe(delay(500));
  }

  submitQuiz(submission: QuizSubmission) {
    const quiz = this.mockQuizzes.find(q => q.id === submission.quizId);
    if (!quiz) throw new Error('Quiz not found');

    let correctCount = 0;
    submission.answers.forEach((ans, idx) => {
      if (ans === quiz.questions[idx].correctOptionIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const result: QuizResult = {
      quizId: quiz.id,
      score,
      isPassed: score >= quiz.passingScore,
      correctAnswers: quiz.questions.map(q => q.correctOptionIndex)
    };

    return of(result).pipe(delay(1000));
  }
}
