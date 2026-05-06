import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';
import { LucideAngularModule, Mail, ArrowRight, Loader2, KeyRound } from 'lucide-angular';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterLink],
  template: `
    <div class="min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center px-6">
      <div class="bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-slate-200/50 w-full max-w-md border border-slate-100">
        <div class="text-center mb-10">
          <div class="w-20 h-20 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <lucide-icon [name]="KeyRound" size="40"></lucide-icon>
          </div>
          <h1 class="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Forgot Password</h1>
          <p class="text-slate-500 font-medium text-sm">No worries! Enter your email and we'll send you an OTP to reset it.</p>
        </div>

        <div class="space-y-6">
          <div>
            <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Email Address</label>
            <div class="relative">
              <input 
                type="email" 
                [(ngModel)]="email" 
                placeholder="name@company.com"
                class="w-full pl-14 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white transition-all outline-none text-slate-900 font-bold"
              >
              <lucide-icon [name]="Mail" class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size="20"></lucide-icon>
            </div>
          </div>

          <button 
            (click)="requestReset()" 
            [disabled]="!email || isLoading"
            class="w-full py-5 rounded-3xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-primary-600 hover:shadow-2xl hover:shadow-primary-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:bg-slate-900"
          >
            <lucide-icon *ngIf="!isLoading" [name]="ArrowRight" size="18"></lucide-icon>
            <lucide-icon *ngIf="isLoading" [name]="Loader2" class="animate-spin" size="18"></lucide-icon>
            {{isLoading ? 'Sending...' : 'Send Reset OTP'}}
          </button>

          <div class="text-center">
            <a routerLink="/auth/login" class="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Back to Login</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  readonly Mail = Mail;
  readonly ArrowRight = ArrowRight;
  readonly Loader2 = Loader2;
  readonly KeyRound = KeyRound;

  email = '';
  isLoading = false;

  requestReset() {
    this.isLoading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.toastService.success('Reset code sent to your email.');
        this.router.navigate(['/auth/reset-password'], { queryParams: { email: this.email } });
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error(err.error?.message || 'Failed to send reset code.');
      }
    });
  }
}
