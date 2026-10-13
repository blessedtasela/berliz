import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';

import { ApiResponse } from 'src/app/models/Api.interface';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';

export type DemoRole = 'client' | 'trainer' | 'center';

interface DemoAuth {
  accessToken?: string | null;
  refreshToken?: string | null;
  message?: string;
}

/** Demo accounts live on this reserved domain (mirrors DemoAccounts.DOMAIN on the backend). */
export const DEMO_EMAIL_DOMAIN = 'demo.berliz.fitness';

export function isDemoEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase().endsWith('@' + DEMO_EMAIL_DOMAIN);
}

/**
 * "Explore as a client / trainer / center": a populated, throwaway workspace to look around before signing up.
 * The backend decides whether demos are on (DEMO_ENABLED), so the buttons only appear when they will work.
 */
@Injectable({ providedIn: 'root' })
export class DemoService {

  private url = environment.api;
  private enabled$?: Observable<boolean>;

  constructor(private http: HttpClient, private userService: UserService) { }

  /** True when the backend has demos switched on. Cached for the page's life; any failure reads as "off". */
  isEnabled(): Observable<boolean> {
    this.enabled$ ??= this.http.get<ApiResponse<{ enabled: boolean }>>(this.url + '/demo/status').pipe(
      map(res => !!res?.data?.enabled),
      catchError(() => of(false)),
      shareReplay(1),
    );
    return this.enabled$;
  }

  /** Signs in as the shared demo account for `role` and stores the session exactly as a normal login does. */
  start(role: DemoRole): Observable<void> {
    return this.http.post<ApiResponse<DemoAuth>>(this.url + '/demo/session', { role }).pipe(
      tap(res => {
        const auth = res?.data;
        if (!auth?.accessToken || !auth?.refreshToken) {
          throw new Error(res?.message || 'The demo could not be started. Please try again later.');
        }
        localStorage.setItem('token', auth.accessToken);
        localStorage.setItem('refresh_token', auth.refreshToken);
        this.userService.startRefreshTokenTimer();
      }),
      map(() => void 0),
    );
  }

  /** Leaves the demo for the real sign-up page (tokens cleared first so nothing carries over). */
  leaveForSignup(): void {
    this.userService.clearLogOutLocalStorage();
    window.location.assign('/sign-up');
  }
}
