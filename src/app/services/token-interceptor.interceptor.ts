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
import { OverlayService } from './overlay.service';
import { ResfreshTokenModalComponent } from '../resfresh-token-modal/resfresh-token-modal.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Injectable()
export class TokenInterceptorInterceptor implements HttpInterceptor {

  constructor(
    private userService: UserService,
    private route: Router,
    private overlayService: OverlayService,
    private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');

    const publicRoutes = ['/upload'];

    const isPublic = publicRoutes.some(url => request.url.includes(url));
    if (isPublic || request.headers.has('Authorization')) {
      return next.handle(request);
    }

    let modRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next.handle(modRequest).pipe(
      catchError((error) => {
        if (error.status === 401 || error.status === 403) {
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) {
            this.route.navigate(['/login']);
            return throwError(() => error);
          }


          return this.userService.refreshToken({ token: refreshToken }).pipe(
            switchMap((response: any) => {
              localStorage.setItem('token', response.access_token);
              localStorage.setItem('refresh_token', response.refresh_token);

              // Retry the original request with the new token
              const newRequest = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.access_token}`
                }
              });
              return next.handle(newRequest);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }

}
