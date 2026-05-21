import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { Router } from '@angular/router';
import { UserService } from './user.service';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) { }

  private isPublicRequest(url: string): boolean {
    const publicEndpoints = [
      '/user/login',
      '/user/signup',
      '/user/refreshToken',
      '/user/forgotPassword',
      '/user/resetPassword',
      '/user/activateAccount',
      '/user/checkToken',
      '/newsletter/',
      '/contactUs/',
      '/static/',
      '/images/',
      '/videos/',
      '/public/',
      '/stomp'
    ];

    return publicEndpoints.some(route => url.includes(route));
  }

  private isStrapiRequest(url: string): boolean {
    return url.includes('localhost:1337');
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (this.isStrapiRequest(request.url)) {
      return next.handle(request);
    }

    const token = this.authService.getToken();

    if (this.isPublicRequest(request.url) || !token) {
      return next.handle(request);
    }

    const authRequest = request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {

        // 401 handling
        if (error.status === 401) {

          const msg = (error.error?.message || '').toLowerCase();

          const isTokenExpired =
            msg.includes('jwt expired') ||
            msg.includes('token expired') ||
            msg.includes('refresh token expired');

          // ✅ only here we try refresh / logout
          if (isTokenExpired) {

            const refreshToken = this.authService.getRefreshToken();

            if (!refreshToken) {
              this.authService.logout();
              this.router.navigate(['/login']);
              return throwError(() => error);
            }

            return this.userService.refreshToken({ token: refreshToken }).pipe(
              switchMap((response: any) => {
                localStorage.setItem('token', response.access_token);
                localStorage.setItem('refresh_token', response.refresh_token);

                const retryRequest = request.clone({
                  setHeaders: { Authorization: `Bearer ${response.access_token}` }
                });

                return next.handle(retryRequest);
              }),
              catchError((refreshError: HttpErrorResponse) => {
                this.authService.logout();
                this.router.navigate(['/login']);
                return throwError(() => refreshError);
              })
            );
          }

          // ❌ not a token problem → do NOT logout, just bubble error
          return throwError(() => error);
        }

        // 403 → forbidden, but no logout
        if (error.status === 403) {
          this.router.navigate(['/dashboard']);
          return throwError(() => error);
        }

        // all other errors: just bubble
        return throwError(() => error);
      })
    );
  }
}
