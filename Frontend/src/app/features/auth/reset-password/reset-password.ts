import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';
import { LucideAngularModule, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center px-6">
      <div class="bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-slate-200/50 w-full max-w-md border border-slate-100">
        <div class="text-center mb-10">
          <div class="w-20 h-20 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <lucide-icon [name]="ShieldCheck" size="40"></lucide-icon>
          </div>
          <h1 class="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Reset Password</h1>
          <p class="text-slate-500 font-medium">Create a new secure password for <br><span class="text-slate-900 font-bold">{{email}}</span></p>
        </div>

        <div class="space-y-6">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">6-Digit Verification Code</label>
            <div class="flex justify-center">
               <input 
                type="text" 
                [(ngModel)]="otp" 
                maxlength="6"
                placeholder="000000"
                class="w-full text-center text-4xl font-black tracking-[0.5em] py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white transition-all outline-none text-slate-900 placeholder:text-slate-200"
              >
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">New Password</label>
            <div class="relative">
              <input 
                type="password" 
                [(ngModel)]="newPassword" 
                placeholder="••••••••"
                class="w-full pl-14 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white transition-all outline-none text-slate-900 font-bold"
              >
              <lucide-icon [name]="Lock" class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size="20"></lucide-icon>
            </div>
          </div>

          <button 
            (click)="reset()" 
            [disabled]="otp.length !== 6 || newPassword.length < 8 || isLoading"
            class="w-full py-5 rounded-3xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-primary-600 hover:shadow-2xl hover:shadow-primary-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:bg-slate-900"
          >
            <lucide-icon *ngIf="!isLoading" [name]="ArrowRight" size="18"></lucide-icon>
            <lucide-icon *ngIf="isLoading" [name]="Loader2" class="animate-spin" size="18"></lucide-icon>
            {{isLoading ? 'Resetting...' : 'Update Password'}}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  readonly ShieldCheck = ShieldCheck;
  readonly Lock = Lock;
  readonly ArrowRight = ArrowRight;
  readonly Loader2 = Loader2;

  email = this.route.snapshot.queryParams['email'] || '';
  otp = '';
  newPassword = '';
  isLoading = false;

  reset() {
    this.isLoading = true;
    this.authService.resetPassword({
      email: this.email,
      otp: this.otp,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.toastService.success('Password updated successfully! Please login.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error(err.error?.message || 'Failed to reset password.');
      }
    });
  }
}
