// import { Injectable } from '@angular/core';
// import {
//   BehaviorSubject,
//   Observable,
//   catchError,
//   map,
//   of,
//   tap
// } from 'rxjs';

// import { SnackBarService } from '../../app/services/snack-bar.service';
// import { UserService } from '../../app/services/user.service';
// import { Users } from '../../app/models/users.interface';
// import { genericError } from 'src/validators/form-validators.module';
// import { ApiResponse } from '../../app/models/Api.interface';

// @Injectable({
//   providedIn: 'root'
// })
// export class UserStateService {

//   responseMessage: any;

//   private userSubject = new BehaviorSubject<Users | null>(null);
//   userData$ = this.userSubject.asObservable();

//   private allUsersSubject = new BehaviorSubject<Users[]>([]);
//   allUsersData$ = this.allUsersSubject.asObservable();

//   private activeUsersSubject = new BehaviorSubject<Users[]>([]);
//   activeUserData$ = this.activeUsersSubject.asObservable();

//   constructor(
//     private userService: UserService,
//     private snackbarService: SnackBarService
//   ) { }

//   getAllUsers(): Observable<Users[]> {

//     return this.userService.getAllUsers().pipe(

//       map((response: ApiResponse<Users[]>) => {

//         const users = response.data || [];

//         return users.sort((a: Users, b: Users) =>
//           new Date(b.date).getTime() - new Date(a.date).getTime()
//         );
//       }),

//       tap(users => {
//         this.setAllUsersSubject(users);
//       }),

//       catchError((error) => {

//         this.responseMessage =
//           error.error?.message || genericError;

//         this.snackbarService.openSnackBar(
//           this.responseMessage,
//           'error'
//         );

//         return of([]);
//       })
//     );
//   }

//   getActiveUsers(): Observable<Users[]> {

//     return this.userService.getActiveUsers().pipe(

//       map((response: ApiResponse<Users[]>) => {

//         const users = response.data || [];

//         return users.sort((a: Users, b: Users) =>
//           new Date(b.date).getTime() - new Date(a.date).getTime()
//         );
//       }),

//       tap(users => {
//         this.setActiveUsersSubject(users);
//       }),

//       catchError((error) => {

//         this.responseMessage =
//           error.error?.message || genericError;

//         this.snackbarService.openSnackBar(
//           this.responseMessage,
//           'error'
//         );

//         return of([]);
//       })
//     );
//   }

//   getUser(): Observable<Users | null> {

//     return this.userService.getUser().pipe(

//       map((response: ApiResponse<Users>) => response.data),

//       tap(user => {
//         this.setUserSubject(user);
//       }),

//       catchError((error) => {

//         this.responseMessage =
//           error.error?.message || 'You are currently logged out';

//         console.log(this.responseMessage);

//         return of(null);
//       })
//     );
//   }

//   setUserSubject(data: Users | null) {
//     this.userSubject.next(data);
//   }

//   setAllUsersSubject(data: Users[]) {
//     this.allUsersSubject.next(data);
//   }

//   setActiveUsersSubject(data: Users[]) {
//     this.activeUsersSubject.next(data);
//   }
// }

// export const UserDataInjectable: Array<any> = [
//   {
//     provide: UserStateService,
//     useClass: UserStateService
//   }
// ];