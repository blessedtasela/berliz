import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
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

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    // 1. Skip public routes
    if (this.isPublicRequest(request.url) || !token) {
      return next.handle(request);
    }

    // 2. Attach token
    const authRequest = request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });

    return next.handle(authRequest).pipe(
      catchError(error => {

        // Only refresh on 401
        if (error.status === 401 && !request.url.includes('/user/refreshToken')) {

          const refreshToken = this.authService.getRefreshToken();
          if (!refreshToken) {
            this.authService.logout();
            return throwError(() => error);
          }

          return this.userService.refreshToken({ token: refreshToken }).pipe(
            switchMap((response: any) => {
              localStorage.setItem('token', response.access_token);
              localStorage.setItem('refresh_token', response.refresh_token);

              const newAuthRequest = request.clone({
                setHeaders: { Authorization: `Bearer ${response.access_token}` }
              });

              return next.handle(newAuthRequest);
            }),
            catchError(err => {
              this.authService.logout();
              return throwError(() => err);
            })
          );
        }

        // For all other errors → pass them to the component
        return throwError(() => error);
      })
    );
  }
}
