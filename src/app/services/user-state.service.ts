import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of, BehaviorSubject } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { SnackBarService } from './snack-bar.service';
import { UserService } from './user.service';
import { Users } from '../models/users.interface';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  responseMessage: any;

  private userSubject = new BehaviorSubject<any>(null);
  public userData$: Observable<Users> = this.userSubject.asObservable();
  private allUsersSubject = new BehaviorSubject<any>(null);
  public allUsersData$: Observable<Users[]> = this.allUsersSubject.asObservable();

  constructor(private userService: UserService,
    private snackbarService: SnackBarService,) {
  }

  ngOnInit() {
  }

  getAllUsers(): Observable<Users[]> {
    return this.userService.getAllUsers().pipe(
      tap((response: any) => {
        return response.sort((a: Users, b: Users) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        })
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
        return response;
      }), catchError((error: any) => {
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = "You are currently logged out";
        }
        console.log(this.responseMessage, 'error');
        return of();
      })
    );
  }

setUserSubject(data: Users) {
  this.userSubject.next(data);
}

setAllUsersSubject(data: Users[]) {
  this.allUsersSubject.next(data);
}

}
export const UserDataInjectable: Array<any> = [
  { provide: UserStateService, useClass: UserStateService },
]

