import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) {}

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwt_decode(token);
      const now = Date.now() / 1000;

      if (!decoded.exp) return false;
      return decoded.exp > now;
    } catch {
      return false;
    }
  }

  getCurrentUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwt_decode(token);
      return decoded.sub ?? null;
    } catch {
      return null;
    }
  }

  getCurrentUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwt_decode(token);
      return decoded.id ?? null;
    } catch {
      return null;
    }
  }

  getCurrentUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwt_decode(token);
      return decoded.role ?? null;
    } catch {
      return null;
    }
  }

  isAdmin(): boolean {
    return this.getCurrentUserRole() === 'admin';
  }

  isUser(): boolean {
    return this.getCurrentUserRole() === 'user';
  }

  isPartner(): boolean {
    return this.getCurrentUserRole() === 'partner';
  }

  isCenter(): boolean {
    return this.getCurrentUserRole() === 'center';
  }

  isTrainer(): boolean {
    return this.getCurrentUserRole() === 'trainer';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }
}
