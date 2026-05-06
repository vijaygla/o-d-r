import { Routes } from '@angular/router';
import { LandingComponent } from './features/home/landing/landing';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { VerifyOtpComponent } from './features/auth/verify-otp/verify-otp';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password';
import { CatalogComponent } from './features/courses/catalog/catalog';
import { CourseDetailsComponent } from './features/courses/details/details';
import { StudentDashboardComponent } from './features/student/dashboard/dashboard';
import { LearningPlayerComponent } from './features/learn/player/player';
import { CheckoutComponent } from './features/checkout/checkout';
import { InstructorDashboardComponent } from './features/instructor/dashboard/dashboard';
import { CourseBuilderComponent } from './features/instructor/builder/builder';
import { AdminDashboardComponent } from './features/admin/dashboard/dashboard';
import { ProfileComponent } from './features/student/profile/profile';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/verify-email', component: VerifyOtpComponent },
  { path: 'auth/forgot-password', component: ForgotPasswordComponent },
  { path: 'auth/reset-password', component: ResetPasswordComponent },
  { path: 'courses', component: CatalogComponent },
  { path: 'courses/:id', component: CourseDetailsComponent },
  { path: 'student/dashboard', component: StudentDashboardComponent },
  { path: 'learn/:courseId', component: LearningPlayerComponent },
  { path: 'checkout/:courseId', component: CheckoutComponent },
  { path: 'instructor/dashboard', component: InstructorDashboardComponent },
  { path: 'instructor/builder', component: CourseBuilderComponent },
  { path: 'instructor/builder/:id', component: CourseBuilderComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: '' }
];
