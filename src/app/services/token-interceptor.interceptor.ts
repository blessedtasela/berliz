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

  constructor(private userService: UserService,
    private route: Router,
    private overlayService: OverlayService,
    private ngxService: NgxUiLoaderService,
    private dialog: MatDialog) { }

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
          this.overlayService.showRefreshTokenOverlay();
          const dialogConfig = new MatDialogConfig();
          dialogConfig.data = {
            confirmation: true,
            disableClose: true,
          };
          const dialogRef = this.dialog.open(ResfreshTokenModalComponent, dialogConfig);
          const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
            this.ngxService.start();
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
              }))
          })
          this.ngxService.stop();
          dialogRef.close('Token refresed successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              this.route.navigate(['/home']);
              console.log('Dialog closed withoutrefreshing token');
            }
          })
        }
        return throwError(error);
      })
    )
  }
}
