export interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  profilePictureUrl?: string;
}

export interface AuthResponse {
  name: string;
  email: string;
  token: string;
  role: string;
  profilePictureUrl?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}
