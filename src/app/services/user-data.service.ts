import { ElementRef, EventEmitter, Injectable } from '@angular/core';
import { UserService } from './user.service';
import { Observable, tap, catchError, of, debounceTime, fromEvent, map, switchMap } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { Users } from '../models/users.interface';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from './snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  usersData: Users[] = [];
  userData!: Users;
  responseMessage: any;
  profilePhoto: any;

  constructor(private userService: UserService,
    private snackbarService: SnackBarService,) {
  }

  ngOnInit() {
  }

  getAllUsers(): Observable<Users[]> {
    return this.userService.getAllUsers().pipe(
      tap((response: any) => {
        this.usersData = response;
      }),
      catchError((error) => {
        this.snackbarService.openSnackBar(error, 'error');
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = genericError;
        }
        this.snackbarService.openSnackBar(this.responseMessage, 'error');
        return of([]);
      })
    );
  }

  getUser(): Observable<Users> {
    return this.userService.getUser().pipe(
      tap((response: any) => {
        this.userData = response;
        this.profilePhoto = 'data:image/jpeg;base64,' + this.userData.profilePhoto;
      }), catchError((error: any) => {
        this.snackbarService.openSnackBar(error, 'error');
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = "You are currently logged out";
        }
        this.snackbarService.openSnackBar(this.responseMessage, 'error');
        return of();
      })
    );
  }
}

export const UserDataInjectable: Array<any> = [
  { provide: UserDataService, useClass: UserDataService },
]
