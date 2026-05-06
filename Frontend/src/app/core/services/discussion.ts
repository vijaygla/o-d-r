import { Injectable } from '@angular/core';
import { of, delay } from 'rxjs';
import { DiscussionThread, CreateThreadDto, CreateReplyDto, DiscussionReply } from '../models/discussion.models';

@Injectable({
  providedIn: 'root'
})
export class DiscussionService {
  private mockThreads: DiscussionThread[] = [
    {
      id: 't1',
      courseId: '1',
      lessonId: 'l1',
      studentId: 'u1',
      studentName: 'John Doe',
      title: 'Question about HTML structure',
      content: 'Should I always use a <main> tag in every page?',
      createdAt: new Date().toISOString(),
      replies: [
        {
          id: 'r1',
          threadId: 't1',
          userId: 'i1',
          userName: 'Dr. Angela Yu',
          content: 'Yes, it is good practice for accessibility!',
          createdAt: new Date().toISOString(),
          isInstructor: true
        }
      ]
    }
  ];

  getThreadsByCourseId(courseId: string) {
    return of(this.mockThreads.filter(t => t.courseId === courseId)).pipe(delay(500));
  }

  createThread(dto: CreateThreadDto) {
    const newThread: DiscussionThread = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: 'current-user',
      studentName: 'Current User',
      ...dto,
      createdAt: new Date().toISOString(),
      replies: []
    };
    this.mockThreads.unshift(newThread);
    return of(newThread).pipe(delay(500));
  }

  addReply(dto: CreateReplyDto) {
    const thread = this.mockThreads.find(t => t.id === dto.threadId);
    if (!thread) throw new Error('Thread not found');

    const newReply: DiscussionReply = {
      id: Math.random().toString(36).substr(2, 9),
      threadId: dto.threadId,
      userId: 'current-user',
      userName: 'Current User',
      content: dto.content,
      createdAt: new Date().toISOString(),
      isInstructor: false
    };
    thread.replies.push(newReply);
    return of(newReply).pipe(delay(500));
  }
}
