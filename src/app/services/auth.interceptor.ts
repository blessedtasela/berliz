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
import * as e from 'cors';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) { }

  // PUBLIC ENDPOINTS
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

  // STRAPI REQUESTS (never touch)
  private isStrapiRequest(url: string): boolean {
    return url.includes('localhost:1337');
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // 1. Never modify Strapi requests
    if (this.isStrapiRequest(request.url)) {
      return next.handle(request);
    }

    const token = this.authService.getToken();

    // 2. Public requests → no auth needed
    if (this.isPublicRequest(request.url)) {
      return next.handle(request);
    }

    // 3. No token → continue without logout
    if (!token) {
      return next.handle(request);
    }

    // 4. Attach token
    const authRequest = request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {

        // ============================
        // CASE A: ACCESS TOKEN EXPIRED
        // ============================
        if (error.status === 401) {

          const errorMessage = error.error?.message?.toLowerCase() || '';

          const isTokenExpired =
            errorMessage.includes('expired') ||
            errorMessage.includes('invalid token') ||
            errorMessage.includes('jwt') ||
            errorMessage.includes('token');

          // ============================
          // CASE A: TOKEN EXPIRED → REFRESH
          // ============================
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
                  setHeaders: {
                    Authorization: `Bearer ${response.access_token}`
                  }
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

          if (!isTokenExpired) {
            // Do NOT logout or redirect
            return throwError(() => error);
          }


          // ============================
          // CASE B: USER VISITS UNAUTHORIZED PAGE
          // ============================
          if (error.status === 401 && errorMessage.includes('access denied')) {
            this.router.navigate(['/dashboard']);
            return throwError(() => error);
          }

          // ============================
          // CASE C: OTHER 401 ERRORS
          // DO NOT LOGOUT OR REDIRECT
          // ============================
          return throwError(() => error);
        }


        // ============================
        // CASE C: LOGIN FAILURE
        // ============================
        if (request.url.includes('/user/login')) {
          return throwError(() => error);
        }

        // ============================
        // CASE D: ALL OTHER ERRORS
        // Never logout
        // ============================
        return throwError(() => error);
      })
    );
  }
}
