import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LucideAngularModule, ChevronLeft, ChevronRight, Play, CheckCircle2, MessageSquare, FileText, HelpCircle, Trophy, Loader2, Send, User } from 'lucide-angular';
import { CourseService } from '../../../core/services/course';
import { ContentService } from '../../../core/services/content';
import { AssessmentService } from '../../../core/services/assessment';
import { DiscussionService } from '../../../core/services/discussion';
import { map, switchMap, shareReplay, tap } from 'rxjs';
import { QuizResult } from '../../../core/models/assessment.models';
import { Section } from '../../../core/models/content.models';

@Component({
  selector: 'app-learning-player',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, FormsModule],
  templateUrl: './player.html'
})
export class LearningPlayerComponent {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private contentService = inject(ContentService);
  private assessmentService = inject(AssessmentService);
  private discussionService = inject(DiscussionService);
  private sanitizer = inject(DomSanitizer);

  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Play = Play;
  readonly CheckCircle2 = CheckCircle2;
  readonly MessageSquare = MessageSquare;
  readonly FileText = FileText;
  readonly HelpCircle = HelpCircle;
  readonly Trophy = Trophy;
  readonly Loader2 = Loader2;
  readonly Send = Send;
  readonly User = User;

  course$ = this.route.params.pipe(
    map(params => params['courseId']),
    switchMap(id => this.courseService.getCourseById(id)),
    shareReplay(1)
  );

  sections$ = this.route.params.pipe(
    map(params => params['courseId']),
    switchMap(id => this.contentService.getSectionsByCourseId(id)),
    tap(sections => {
      this.currentSections = sections;
      if (sections.length > 0 && sections[0].lessons.length > 0) {
        this.activeModuleIndex = 0;
        this.activeLessonIndex = 0;
      }
    }),
    shareReplay(1)
  );

  quiz$ = this.route.params.pipe(
    map(params => params['courseId']),
    switchMap(id => this.assessmentService.getQuizByCourseId(id))
  );

  threads$ = this.route.params.pipe(
    map(params => params['courseId']),
    switchMap(id => this.discussionService.getThreadsByCourseId(id))
  );

  activeTab: 'overview' | 'resources' | 'quiz' | 'discussion' = 'overview';
  activeModuleIndex = 0;
  activeLessonIndex = 0;
  currentSections: Section[] = [];

  // Quiz state
  selectedAnswers: number[] = [];
  quizResult: QuizResult | null = null;
  isSubmittingQuiz = false;

  // Discussion state
  newThreadTitle = '';
  newThreadContent = '';
  isCreatingThread = false;

  get currentLesson() {
    if (this.currentSections.length > 0 && 
        this.currentSections[this.activeModuleIndex] && 
        this.currentSections[this.activeModuleIndex].lessons[this.activeLessonIndex]) {
      return this.currentSections[this.activeModuleIndex].lessons[this.activeLessonIndex];
    }
    return null;
  }

  getSafeUrl(url: string | undefined): SafeResourceUrl | null {
    if (!url) return null;
    let finalUrl = url;
    
    // Transform YouTube URLs for embedding
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      finalUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      finalUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
  }

  selectLesson(modIdx: number, lesIdx: number) {
    this.activeModuleIndex = modIdx;
    this.activeLessonIndex = lesIdx;
    this.activeTab = 'overview';
  }

  nextLesson() {
    if (!this.currentSections.length) return;
    
    const currentModule = this.currentSections[this.activeModuleIndex];
    if (this.activeLessonIndex < currentModule.lessons.length - 1) {
      this.activeLessonIndex++;
    } else if (this.activeModuleIndex < this.currentSections.length - 1) {
      this.activeModuleIndex++;
      this.activeLessonIndex = 0;
    }
    this.activeTab = 'overview';
  }

  previousLesson() {
    if (!this.currentSections.length) return;

    if (this.activeLessonIndex > 0) {
      this.activeLessonIndex--;
    } else if (this.activeModuleIndex > 0) {
      this.activeModuleIndex--;
      this.activeLessonIndex = this.currentSections[this.activeModuleIndex].lessons.length - 1;
    }
    this.activeTab = 'overview';
  }

  setTab(tab: 'overview' | 'resources' | 'quiz' | 'discussion') {
    this.activeTab = tab;
  }

  submitQuiz(quizId: string) {
    this.isSubmittingQuiz = true;
    this.assessmentService.submitQuiz({
      quizId,
      studentId: 'current-user',
      answers: this.selectedAnswers
    }).subscribe(result => {
      this.quizResult = result;
      this.isSubmittingQuiz = false;
    });
  }

  resetQuiz() {
    this.selectedAnswers = [];
    this.quizResult = null;
  }

  createThread(courseId: string) {
    if (!this.newThreadTitle || !this.newThreadContent) return;
    this.isCreatingThread = true;
    this.discussionService.createThread({
      courseId,
      title: this.newThreadTitle,
      content: this.newThreadContent
    }).subscribe(() => {
      this.newThreadTitle = '';
      this.newThreadContent = '';
      this.isCreatingThread = false;
      // Re-fetch threads
      this.threads$ = this.discussionService.getThreadsByCourseId(courseId);
    });
  }
}
