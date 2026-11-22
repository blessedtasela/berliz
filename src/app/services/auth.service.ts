import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Store } from '@ngrx/store';
import jwt_decode from 'jwt-decode';
import { AuthRedirectService } from './auth-redirect.service';
import { logoutUser } from '../state/user/user.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private authRedirect: AuthRedirectService,
    private store: Store,
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

  /**
   * GN-59: a session exists as long as we hold a token -- deliberately NOT
   * `isAuthenticated()`, which compares the access token's `exp` against
   * THIS DEVICE's own clock. The access token lives only 1 hour, but the
   * refresh token lives 30 days and silently renews on any 401
   * (AuthInterceptor) -- so a merely access-token-expired session is still
   * perfectly alive. `isAuthenticated()`'s local-clock check is fine for a
   * refresh TRIGGER (my-rx-stomp.config.ts) or for cosmetic display
   * (the navbar/hero CTA, where a wrong guess just self-corrects on the
   * next load), but using it to GATE navigation is what caused GN-59: on
   * any device whose clock runs ahead of the server's -- common, and this
   * project has already hit a real one (see the BC-permanent-UTC-7 clock
   * drift) -- the access token looks expired within minutes of signing in,
   * and a route guard has no 401 to refresh against, so it hard-redirects
   * to /login while the refresh token (and the real session) is still
   * completely valid. Guards and other hard "are you logged in" gates
   * should check this instead; `isAuthenticated()` stays as-is for the
   * cases above that actually want the stricter, clock-sensitive check.
   */
  hasSession(): boolean {
    return !!this.getToken();
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

  /**
   * Drops the stored tokens without navigating anywhere -- see AuthInterceptor.forceLogout for
   * why a dead session shouldn't always yank the visitor to /login. Also drops any stashed
   * impersonator tokens (GN-78): a real logout ends impersonation too, so a later, completely
   * unrelated login session never finds a leftover `impersonator_token` and misreports itself
   * as "impersonating" someone.
   */
  clearTokens(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('impersonator_token');
      localStorage.removeItem('impersonator_refresh_token');
    }
  }

  /**
   * GN-78: true while the super admin is acting as another account -- the original admin
   * session's tokens are stashed under the `impersonator_*` keys, set only by
   * {@link startImpersonation} and cleared only by {@link stopImpersonation}.
   */
  isImpersonating(): boolean {
    return this.isBrowser && !!localStorage.getItem('impersonator_token');
  }

  /**
   * Swaps the live session for the impersonated user's freshly-issued tokens, stashing the
   * CURRENT session aside first so {@link stopImpersonation} can restore it. If impersonation
   * is already active (the admin switched targets without returning first), the already-stashed
   * original admin tokens are left alone -- they must always point back to the real admin, never
   * to whichever account was being impersonated a moment ago.
   */
  startImpersonation(accessToken: string, refreshToken: string): void {
    if (!this.isBrowser) return;
    if (!this.isImpersonating()) {
      const adminToken = this.getToken();
      const adminRefreshToken = this.getRefreshToken();
      if (adminToken) localStorage.setItem('impersonator_token', adminToken);
      if (adminRefreshToken) localStorage.setItem('impersonator_refresh_token', adminRefreshToken);
    }
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  /** Restores the super admin's own session. A no-op (returns false) if impersonation isn't active. */
  stopImpersonation(): boolean {
    if (!this.isImpersonating()) return false;
    const adminToken = localStorage.getItem('impersonator_token');
    const adminRefreshToken = localStorage.getItem('impersonator_refresh_token');
    localStorage.removeItem('impersonator_token');
    localStorage.removeItem('impersonator_refresh_token');
    if (adminToken) localStorage.setItem('token', adminToken);
    if (adminRefreshToken) localStorage.setItem('refresh_token', adminRefreshToken);
    return true;
  }

  /** GN-49: must reset the NgRx `user` state too, not just localStorage -- see
   *  UserService#logout for the full explanation (this is the InactivityService's own logout
   *  path, the other of the two real "sign this browser tab out" entry points). */
  logout(): void {
    this.clearTokens();
    this.store.dispatch(logoutUser());
    this.authRedirect.goToLogin();
  }
}
