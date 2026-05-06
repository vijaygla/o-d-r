import { Component, inject, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';
import { LucideAngularModule, Mail, Lock, User, Loader2, ArrowRight, Shield } from 'lucide-angular';
import { environment } from '../../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './register.html'
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly User = User;
  readonly Loader2 = Loader2;
  readonly ArrowRight = ArrowRight;
  readonly Shield = Shield;

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['Student', [Validators.required]]
  });

  isLoading = false;
  errorMessage = '';

  ngOnInit() {
    this.initializeGoogleLogin();
  }

  private initializeGoogleLogin() {
    if (typeof google !== 'undefined') {
      // Prevent multiple initializations
      if (!(window as any).googleInitialized) {
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (response: any) => this.handleGoogleLogin(response),
          auto_select: false,
          cancel_on_tap_outside: true
        });
        (window as any).googleInitialized = true;
      }

      // Always try to render the button
      setTimeout(() => {
        const btn = document.getElementById('google-btn');
        if (btn) {
          google.accounts.id.renderButton(btn, { 
            theme: 'outline', 
            size: 'large', 
            width: '100%', 
            text: 'signup_with', 
            shape: 'pill' 
          });
        }
      }, 100);
    }
  }

  private handleGoogleLogin(response: any) {
    this.ngZone.run(() => {
      this.isLoading = true;
      this.authService.googleLogin(response.credential).subscribe({
        next: (res) => {
          this.toastService.success(`Account created successfully! Welcome, ${res.name}`);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading = false;
          this.toastService.error('Google registration failed.');
        }
      });
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const formData = this.registerForm.value;
      this.authService.register({
        name: formData.name!,
        email: formData.email!,
        password: formData.password!,
        role: formData.role!
      }).subscribe({
        next: (res) => {
          this.toastService.success(`Registration initiated! Please verify your email.`);
          this.router.navigate(['/auth/verify-email'], { queryParams: { email: formData.email } });
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Registration failed.';
          if (err.error?.detail) {
            this.errorMessage += ` (${err.error.detail})`;
          }
          this.toastService.error(this.errorMessage);
        }
      });
    }
  }
}
