import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import jwt_decode from 'jwt-decode';
import { AuthRedirectService } from './auth-redirect.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private authRedirect: AuthRedirectService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  // `localStorage` doesn't exist during build-time prerendering (Node has no
  // browser globals) — every accessor below goes through this so a prerendered
  // page always renders as "logged out" instead of crashing the build.
  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('token') : null;
  }

  getRefreshToken(): string | null {
    return this.isBrowser ? localStorage.getItem('refresh_token') : null;
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
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
    }
    this.authRedirect.goToLogin();
  }
}
