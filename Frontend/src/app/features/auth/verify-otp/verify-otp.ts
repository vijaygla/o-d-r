import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';
import { LucideAngularModule, ShieldCheck, ArrowRight, Loader2 } from 'lucide-angular';
import { timeout, catchError, EMPTY } from 'rxjs';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center px-6">
      <div class="bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-slate-200/50 w-full max-w-md border border-slate-100">
        <div class="text-center mb-10">
          <div class="w-20 h-20 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <lucide-icon [name]="ShieldCheck" size="40"></lucide-icon>
          </div>
          <h1 class="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Verify Email</h1>
          <p class="text-slate-500 font-medium">We've sent a 6-digit code to <br><span class="text-slate-900 font-bold">{{email}}</span></p>
        </div>

        <div class="space-y-8">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Enter Verification Code</label>
            <div class="flex justify-center">
               <input 
                type="text" 
                [(ngModel)]="otp" 
                maxlength="6"
                placeholder="000000"
                class="w-full text-center text-4xl font-black tracking-[0.5em] py-6 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white transition-all outline-none text-slate-900 placeholder:text-slate-200"
              >
            </div>
          </div>

          <button 
            (click)="verify()" 
            [disabled]="otp.length !== 6 || isLoading"
            class="w-full py-5 rounded-3xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-primary-600 hover:shadow-2xl hover:shadow-primary-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:bg-slate-900 disabled:hover:shadow-none"
          >
            <lucide-icon *ngIf="!isLoading" [name]="ArrowRight" size="18"></lucide-icon>
            <lucide-icon *ngIf="isLoading" [name]="Loader2" class="animate-spin" size="18"></lucide-icon>
            {{isVerifying ? 'Verifying...' : (isResending ? 'Resending...' : 'Verify & Complete')}}
          </button>

          <p class="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            Didn't receive the code? 
            <button (click)="resend()" class="text-primary-600 hover:underline disabled:opacity-50" [disabled]="isLoading">Resend OTP</button>
          </p>
        </div>
      </div>
    </div>
  `
})
export class VerifyOtpComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  readonly ShieldCheck = ShieldCheck;
  readonly ArrowRight = ArrowRight;
  readonly Loader2 = Loader2;

  email = this.route.snapshot.queryParams['email'] || '';
  otp = '';
  isVerifying = false;
  isResending = false;

  get isLoading() {
    return this.isVerifying || this.isResending;
  }

  ngOnInit() {
    // Automatically trigger resend if landing here from a failed login attempt
    if (this.route.snapshot.queryParams['resend'] === 'true') {
      this.resend();
    }
  }

  verify() {
    if (this.otp.length === 6) {
      this.isVerifying = true;
      this.authService.verifyOtp(this.email, this.otp).pipe(
        timeout(15000),
        catchError(err => {
          this.isVerifying = false;
          const msg = err.name === 'TimeoutError' ? 'Verification timed out. Please try again.' : (err.error?.message || 'Invalid verification code.');
          this.toastService.error(msg);
          return EMPTY;
        })
      ).subscribe({
        next: () => {
          this.isVerifying = false;
          this.toastService.success('Email verified successfully! You can now log in.');
          this.router.navigate(['/auth/login']);
        }
      });
    }
  }

  resend() {
    this.isResending = true;
    this.authService.resendOtp(this.email).pipe(
      timeout(15000),
      catchError(err => {
        this.isResending = false;
        const msg = err.name === 'TimeoutError' ? 'Resend timed out. Please check if RabbitMQ and Notification services are running.' : (err.error?.message || 'Failed to resend OTP.');
        this.toastService.error(msg);
        return EMPTY;
      })
    ).subscribe({
      next: () => {
        this.isResending = false;
        this.toastService.success('A new OTP has been sent to your email.');
      }
    });
  }
}
