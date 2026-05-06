import { Component, inject, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';
import { LucideAngularModule, Mail, Lock, Loader2, ArrowRight } from 'lucide-angular';
import { environment } from '../../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './login.html'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly Loader2 = Loader2;
  readonly ArrowRight = ArrowRight;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
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
            text: 'continue_with', 
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
          this.toastService.success(`Welcome back, ${res.name}!`);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading = false;
          this.toastService.error('Google login failed. Please try again.');
          console.error('Google login error', err);
        }
      });
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const { email, password } = this.loginForm.value;
      this.authService.login({ email: email!, password: password! }).subscribe({
        next: (res) => {
          this.toastService.success(`Welcome back, ${res.name}!`);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Invalid email or password.';
          
          // Redirect to verification if account exists but isn't verified
          if (this.errorMessage.toLowerCase().includes('verify your email')) {
            this.toastService.info('Account exists but email is not verified.');
            this.router.navigate(['/auth/verify-email'], { queryParams: { email, resend: 'true' } });
          } else {
            this.toastService.error(this.errorMessage);
          }
        }
      });
    }
  }
}
