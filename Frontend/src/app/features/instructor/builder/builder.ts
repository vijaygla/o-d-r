import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { LucideAngularModule, ChevronLeft, ChevronRight, Save, Plus, Trash2, Upload, FileVideo, FileText, Image as ImageIcon, Loader2, CheckCircle2, BookOpen } from 'lucide-angular';
import { CourseService } from '../../../core/services/course';
import { ContentService } from '../../../core/services/content';
import { MediaService } from '../../../core/services/media';
import { CategoryService } from '../../../core/services/category';
import { Lesson } from '../../../core/models/content.models';
import { Category } from '../../../core/models/category.models';

@Component({
  selector: 'app-course-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule, RouterLink],
  templateUrl: './builder.html'
})
export class CourseBuilderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);
  private contentService = inject(ContentService);
  private mediaService = inject(MediaService);
  private categoryService = inject(CategoryService);

  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Save = Save;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly Upload = Upload;
  readonly FileVideo = FileVideo;
  readonly FileText = FileText;
  readonly ImageIcon = ImageIcon;
  readonly Loader2 = Loader2;
  readonly CheckCircle2 = CheckCircle2;
  readonly BookOpen = BookOpen;

  currentStep = 1;
  courseId: string | null = null;
  isEditMode = false;
  isSaving = false;
  isUploading = false;
  errorMessage: string | null = null;
  showCategoryModal = false;
  newCategory = { name: '', description: '' };
  isCreatingCategory = false;

  courseForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    categoryId: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    thumbnailUrl: ['']
  });

  lessons: Lesson[] = [];
  categories: Category[] = [];

  ngOnInit() {
    this.loadCategories();
    this.courseId = this.route.snapshot.paramMap.get('id');
    if (this.courseId) {
      this.isEditMode = true;
      this.loadCourseData();
    }
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
      if (this.categories.length > 0 && !this.isEditMode) {
        this.courseForm.patchValue({ categoryId: this.categories[0].id });
      }
    });
  }

  loadCourseData() {
    if (!this.courseId) return;
    this.courseService.getCourseById(this.courseId).subscribe(course => {
      if (course) {
        this.courseForm.patchValue({
          title: course.title,
          description: course.description,
          price: course.price,
          thumbnailUrl: course.thumbnailUrl,
          // Note: Category matching would go here if backend returned categoryId
        });
      }
    });

    this.contentService.getLessonsByCourseId(this.courseId).subscribe(lessons => {
      this.lessons = lessons.sort((a, b) => a.order - b.order);
    });
  }

  nextStep() {
    if (this.currentStep === 1 && this.courseForm.invalid) return;
    this.currentStep++;
    this.errorMessage = null;
  }

  prevStep() {
    this.currentStep--;
    this.errorMessage = null;
  }

  saveCourse() {
    if (this.courseForm.invalid) return;
    this.isSaving = true;
    this.errorMessage = null;

    const courseData = this.courseForm.value;

    if (this.isEditMode && this.courseId) {
      this.courseService.updateCourse(this.courseId, courseData).subscribe({
        next: () => {
          this.isSaving = false;
          this.nextStep();
        },
        error: (err) => {
          this.isSaving = false;
          this.errorMessage = 'Failed to update course. Please check your data and try again.';
          console.error('Update course error:', err);
        }
      });
    } else {
      this.courseService.createCourse(courseData).subscribe({
        next: (createdCourse) => {
          this.courseId = createdCourse.id;
          this.isEditMode = true;
          this.isSaving = false;
          this.nextStep();
        },
        error: (err) => {
          this.isSaving = false;
          this.errorMessage = 'Failed to create course. Ensure all fields are valid.';
          console.error('Create course error:', err);
        }
      });
    }
  }

  onThumbnailUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading = true;
    this.mediaService.upload(file).subscribe({
      next: (res) => {
        this.courseForm.patchValue({ thumbnailUrl: res.url });
        this.isUploading = false;
      },
      error: () => this.isUploading = false
    });
  }

  onLessonFileUpload(event: any, lesson: Lesson) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading = true;
    this.mediaService.upload(file).subscribe({
      next: (res) => {
        lesson.contentUrl = res.url;
        this.updateLesson(lesson);
        this.isUploading = false;
      },
      error: () => this.isUploading = false
    });
  }

  addLesson() {
    if (!this.courseId) return;
    const newLesson: Partial<Lesson> = {
      courseId: this.courseId,
      title: 'New Lesson',
      description: 'Enter lesson description',
      contentType: 'Video',
      order: this.lessons.length + 1,
      contentUrl: ''
    };

    this.contentService.createLesson(newLesson).subscribe(lesson => {
      this.lessons.push(lesson);
    });
  }

  deleteLesson(lessonId: string) {
    this.contentService.deleteLesson(lessonId).subscribe(() => {
      this.lessons = this.lessons.filter(l => l.id !== lessonId);
    });
  }

  updateLesson(lesson: Lesson) {
    this.contentService.updateLesson(lesson.id, lesson).subscribe({
      next: () => {
        // Optional: show a success toast here
        console.log('Lesson updated successfully');
      },
      error: (err) => {
        console.error('Failed to update lesson', err);
      }
    });
  }

  createCategory() {
    if (!this.newCategory.name) return;
    this.isCreatingCategory = true;
    this.categoryService.createCategory(this.newCategory.name, this.newCategory.description).subscribe({
      next: (category) => {
        this.categories.push(category);
        this.courseForm.patchValue({ categoryId: category.id });
        this.showCategoryModal = false;
        this.newCategory = { name: '', description: '' };
        this.isCreatingCategory = false;
      },
      error: (err) => {
        this.isCreatingCategory = false;
        console.error('Failed to create category', err);
      }
    });
  }
}
