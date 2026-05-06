import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast';
import { LucideAngularModule, CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-angular';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(-20px) scale(0.95)', opacity: 0 }),
        animate('300ms cubic-bezier(0.2, 0, 0, 1.2)', style({ transform: 'translateY(0) scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'scale(0.95)', opacity: 0 }))
      ])
    ])
  ],
  template: `
    <div class="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 items-center pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div [@toastAnimation]
             class="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white shadow-2xl border border-slate-100 min-w-[320px] pointer-events-auto">
          
          <div [ngClass]="{
            'text-green-500': toast.type === 'success',
            'text-red-500': toast.type === 'error',
            'text-blue-500': toast.type === 'info',
            'text-amber-500': toast.type === 'warning'
          }">
            @switch (toast.type) {
              @case ('success') { <lucide-icon [name]="CheckCircle2" size="20"></lucide-icon> }
              @case ('error') { <lucide-icon [name]="AlertCircle" size="20"></lucide-icon> }
              @case ('info') { <lucide-icon [name]="Info" size="20"></lucide-icon> }
              @case ('warning') { <lucide-icon [name]="AlertTriangle" size="20"></lucide-icon> }
            }
          </div>

          <span class="text-sm font-semibold text-slate-800 flex-1">{{ toast.message }}</span>

          <button (click)="toastService.remove(toast.id)" class="text-slate-400 hover:text-slate-600 transition-colors">
            <lucide-icon [name]="X" size="16"></lucide-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  readonly CheckCircle2 = CheckCircle2;
  readonly AlertCircle = AlertCircle;
  readonly Info = Info;
  readonly AlertTriangle = AlertTriangle;
  readonly X = X;
}
