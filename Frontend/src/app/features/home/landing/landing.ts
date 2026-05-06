import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="py-16 sm:py-24">
      <div class="text-center">
        <h2 class="text-4xl font-extrabold text-slate-900 sm:text-6xl tracking-tight mb-6">
          Master New Skills Today
        </h2>
        <p class="mt-4 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Join our community of learners and start your journey to success. 
          Access high-quality courses from expert instructors around the world.
        </p>
        <div class="mt-10 flex flex-col sm:flex-row justify-center gap-4 px-4">
          <a routerLink="/auth/register" 
             class="px-8 py-4 bg-sky-500 text-white rounded-xl font-bold shadow-lg shadow-sky-500/30 hover:bg-sky-600 transition-all active:scale-95 text-center">
            Get Started for Free
          </a>
          <a routerLink="/courses" 
             class="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95 text-center">
            Browse All Courses
          </a>
        </div>
      </div>

      <!-- Feature Section -->
      <div class="mt-32 grid grid-cols-1 gap-y-12 sm:grid-cols-3 sm:gap-x-8">
        <div class="text-center px-4">
          <div class="mx-auto h-12 w-12 text-sky-500 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-slate-900">Expert-Led Courses</h3>
          <p class="mt-2 text-slate-500 italic">Learn from industry professionals with real-world experience.</p>
        </div>
        <div class="text-center px-4">
          <div class="mx-auto h-12 w-12 text-sky-500 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040L3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622l-0.382-3.016z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-slate-900">Recognized Certificates</h3>
          <p class="mt-2 text-slate-500">Earn certificates of completion to showcase your achievements.</p>
        </div>
        <div class="text-center px-4">
          <div class="mx-auto h-12 w-12 text-sky-500 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-slate-900">Flexible Learning</h3>
          <p class="mt-2 text-slate-500">Study at your own pace, anytime and anywhere on any device.</p>
        </div>
      </div>
    </div>
  `
})
export class LandingComponent {}
