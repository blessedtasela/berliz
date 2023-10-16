import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { UserService } from './user.service';

@Injectable()
export class TokenInterceptorInterceptor implements HttpInterceptor {
  constructor(private userService: UserService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    let modRequest = request.clone({
      setHeaders: {
        Authorization: "Bearer " + token
      }
    });

    return next.handle(modRequest).pipe(
      catchError((error) => {
        if (error.status === 401) {

          const refreshToken = localStorage.getItem('refresh_token');

          return this.userService.refreshToken({ token: refreshToken }).pipe(
            switchMap((response: any) => {
              localStorage.setItem('token', response.access_token)
              localStorage.setItem('refresh_token', response.refresh_token)
            
              // Create a new request with the new acess token
              const newRequest = request.clone({
                setHeaders: {
                  Authorization: "Bearer " + token
                }
              });
              return next.handle(newRequest);
            }));
        }

        return throwError(error);
      })
    )
  }
}
