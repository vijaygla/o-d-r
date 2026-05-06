import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/auth.models';
import { tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);

  constructor() {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        this.token.set(savedToken);
        this.currentUser.set(JSON.parse(savedUser));
      }
    }
  }

  register(data: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  login(data: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(res => this.handleAuth(res))
    );
  }

  googleLogin(idToken: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/google-login`, { idToken }).pipe(
      tap(res => this.handleAuth(res))
    );
  }

  verifyOtp(email: string, otp: string) {
    return this.http.post<any>(`${this.apiUrl}/verify-otp`, { email, otp });
  }

  resendOtp(email: string) {
    return this.http.post<any>(`${this.apiUrl}/resend-otp`, { email });
  }

  forgotPassword(email: string) {
    // Wrap email in object to ensure it's sent as valid JSON { "email": "..." }
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(data: any) {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, data);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  private handleAuth(res: AuthResponse) {
    const user: User = {
      name: res.name,
      email: res.email,
      role: res.role,
      profilePictureUrl: res.profilePictureUrl
    };

    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(user));
    
    this.token.set(res.token);
    this.currentUser.set(user);
  }
}
