export interface DiscussionThread {
  id: string;
  courseId: string;
  lessonId?: string;
  studentId: string;
  studentName: string;
  title: string;
  content: string;
  createdAt: string;
  replies: DiscussionReply[];
}

export interface DiscussionReply {
  id: string;
  threadId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  isInstructor: boolean;
}

export interface CreateThreadDto {
  courseId: string;
  lessonId?: string;
  title: string;
  content: string;
}

export interface CreateReplyDto {
  threadId: string;
  content: string;
}
