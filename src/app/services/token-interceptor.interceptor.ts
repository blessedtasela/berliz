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
import { MatDialog } from '@angular/material/dialog';

@Injectable()
export class TokenInterceptorInterceptor implements HttpInterceptor {

  constructor(
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  private isPublicRequest(url: string): boolean {
    const publicEndpoints = [
      '/user/login',
      '/user/signup',
      '/user/refreshToken',
      '/user/forgotPassword',
      '/user/validatePasswordToken',
      '/user/resetPassword',
      '/user/activateAccount',
      '/user/quickAdd',
      '/user/sendActivationToken',
      '/newsletter/add',
      '/newsletter/updateStatus',
      '/contactUs/add',
      '/category/getActiveCategories',
      '/dashboard/berliz',
      '/trainer/getActiveTrainers',
      '/center/getActiveCenters',
      '/static/',
      '/images/',
      '/videos/',
      '/public/',
      '/css/',
      '/js/',
      '/webjars/',
      '/stomp'
    ];

    return publicEndpoints.some(route => url.includes(route));
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');

    // Skip adding Authorization header to public routes or if no token
    if (this.isPublicRequest(request.url) || !token) {
      return next.handle(request);
    }

    const authRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next.handle(authRequest).pipe(
      catchError(error => {
        if (error.status === 401 || error.status === 403) {
          const refreshToken = localStorage.getItem('refresh_token');

          if (!refreshToken) {
            this.router.navigate(['/login']);
            return throwError(() => error);
          }

          return this.userService.refreshToken({ token: refreshToken }).pipe(
            switchMap((response: any) => {
              localStorage.setItem('token', response.access_token);
              localStorage.setItem('refresh_token', response.refresh_token);

              const newAuthRequest = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.access_token}`
                }
              });

              return next.handle(newAuthRequest);
            }),
            catchError(err => {
              this.router.navigate(['/login']);
              return throwError(() => err);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }
}
