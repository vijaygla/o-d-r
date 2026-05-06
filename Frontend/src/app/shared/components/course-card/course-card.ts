import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Star, Clock, BookOpen, User } from 'lucide-angular';
import { Course } from '../../../core/models/course.models';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './course-card.html'
})
export class CourseCardComponent {
  @Input({ required: true }) course!: Course;

  readonly Star = Star;
  readonly Clock = Clock;
  readonly BookOpen = BookOpen;
  readonly User = User;
}
