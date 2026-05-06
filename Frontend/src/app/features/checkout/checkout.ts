import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, CreditCard, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-angular';
import { CourseService } from '../../core/services/course';
import { EnrollmentService } from '../../core/services/enrollment';
import { ToastService } from '../../core/services/toast';
import { map, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './checkout.html'
})
export class CheckoutComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);
  private enrollmentService = inject(EnrollmentService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  readonly CreditCard = CreditCard;
  readonly Lock = Lock;
  readonly ShieldCheck = ShieldCheck;
  readonly ArrowRight = ArrowRight;
  readonly Loader2 = Loader2;

  course$ = this.route.params.pipe(
    map(params => params['courseId']),
    switchMap(id => this.courseService.getCourseById(id))
  );

  checkoutForm = this.fb.group({
    cardName: ['', Validators.required],
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvc: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
  });

  isLoading = false;

  onSubmit() {
   if (this.checkoutForm.valid) {
     this.isLoading = true;

     this.course$.pipe(
       take(1),
       switchMap(course => {
         if (!course) throw new Error('Course not found');
         return this.enrollmentService.enroll({ 
           courseId: course.id,
           courseName: course.title
         });
       })
     ).subscribe({        next: (enrollment) => {
          this.isLoading = false;
          if (enrollment) {
            this.toastService.success('Course enrolled successfully!');
            this.router.navigate(['/student/dashboard']);
          } else {
            this.toastService.error('Enrollment failed. Please try again.');
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.toastService.error('An error occurred during enrollment.');
          console.error('Checkout error:', err);
        }
      });
    }
  }
}
