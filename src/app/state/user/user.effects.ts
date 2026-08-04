import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UserService } from '../../services/user.service';
import * as UserActions from './user.actions';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class UserEffects {

  constructor(
    private actions$: Actions,
    private userService: UserService
  ) {}

  // LOAD USER + REFRESH
  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUser, UserActions.refreshUser),
      mergeMap(() =>
        this.userService.getUser().pipe(
          map(res => UserActions.loadUserSuccess({ response: res })),
          catchError(err =>
            of(UserActions.loadUserFailure({
              error: err.error?.message || 'Error loading user'
            }))
          )
        )
      )
    )
  );

  // LOGIN
  loginUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loginUser),
      mergeMap(({ data }) =>
        this.userService.login(data).pipe(
          map(res => {
            // STORE TOKENS
            localStorage.setItem('token', res.data.accessToken);
            localStorage.setItem('refresh_token', res.data.refreshToken);

            return UserActions.loginUserSuccess({ response: res });
          }),
          catchError(err =>
            of(UserActions.loginUserFailure({
              error: err.error?.message || 'Login failed'
            }))
          )
        )
      )
    )
  );

  // LOGOUT
  logoutUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.logoutUser),
      map(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        return UserActions.loadUser(); // reset state
      })
    )
  );

  // TOKEN EXPIRED HANDLER
  tokenExpired$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.tokenExpired),
      map(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        return UserActions.logoutUser();
      })
    )
  );

  // UPDATE USER
  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUser),
      mergeMap(({ data }) =>
        this.userService.updateUser(data).pipe(
          map(res => UserActions.updateUserSuccess({ response: res })),
          catchError(err =>
            of(UserActions.updateUserFailure({
              error: err.error?.message || 'Update failed'
            }))
          )
        )
      )
    )
  );

  // UPDATE EMAIL
  updateEmail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUserEmail),
      mergeMap(({ data }) =>
        this.userService.updateEmail(data).pipe(
          map(res => UserActions.updateUserSuccess({ response: res })),
          catchError(err =>
            of(UserActions.updateUserFailure({
              error: err.error?.message || 'Email update failed'
            }))
          )
        )
      )
    )
  );

  // UPDATE BIO
  updateBio$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUserBio),
      mergeMap(({ data }) =>
        this.userService.updateBio(data).pipe(
          map(res => UserActions.updateUserSuccess({ response: res })),
          catchError(err =>
            of(UserActions.updateUserFailure({
              error: err.error?.message || 'Bio update failed'
            }))
          )
        )
      )
    )
  );

  // UPDATE PHOTO
  updateProfilePhoto$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUserProfilePhoto),
      mergeMap(({ data }) =>
        this.userService.updateProfilePhoto(data).pipe(
          map(res => UserActions.updateUserSuccess({ response: res })),
          catchError(err =>
            of(UserActions.updateUserFailure({
              error: err.error?.message || 'Photo update failed'
            }))
          )
        )
      )
    )
  );

  // UPDATE STATUS
  updateStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUserStatus),
      mergeMap(({ id }) =>
        this.userService.updateStatus(id).pipe(
          map(res => UserActions.updateUserSuccess({ response: res })),
          catchError(err =>
            of(UserActions.updateUserFailure({
              error: err.error?.message || 'Status update failed'
            }))
          )
        )
      )
    )
  );

  // UPDATE ROLE
  updateRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUserRole),
      mergeMap(({ data }) =>
        this.userService.updateUserRole(data).pipe(
          map(res => UserActions.updateUserSuccess({ response: res })),
          catchError(err =>
            of(UserActions.updateUserFailure({
              error: err.error?.message || 'Role update failed'
            }))
          )
        )
      )
    )
  );

  // PASSWORD
  forgotPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.forgotPassword),
      mergeMap(({ data }) =>
        this.userService.forgotPassword(data).pipe(
          map(res => UserActions.updateUserSuccess({ response: res })),
          catchError(err =>
            of(UserActions.updateUserFailure({
              error: err.error?.message || 'Forgot password failed'
            }))
          )
        )
      )
    )
  );

  resetPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.resetPassword),
      mergeMap(({ data }) =>
        this.userService.resetPassword(data).pipe(
          map(res => UserActions.updateUserSuccess({ response: res })),
          catchError(err =>
            of(UserActions.updateUserFailure({
              error: err.error?.message || 'Reset password failed'
            }))
          )
        )
      )
    )
  );

  changePassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.changePassword),
      mergeMap(({ data }) =>
        this.userService.changePassword(data).pipe(
          map(res => UserActions.updateUserSuccess({ response: res })),
          catchError(err =>
            of(UserActions.updateUserFailure({
              error: err.error?.message || 'Change password failed'
            }))
          )
        )
      )
    )
  );

  // LIST USERS
  loadAllUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadAllUsers, UserActions.refreshUsers),
      mergeMap(() =>
        this.userService.getAllUsers().pipe(
          map(res => UserActions.loadUsersSuccess({ response: res })),
          catchError(err =>
            of(UserActions.loadUsersFailure({
              error: err.error?.message || 'Error loading users'
            }))
          )
        )
      )
    )
  );

  loadActiveUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadActiveUsers),
      mergeMap(() =>
        this.userService.getActiveUsers().pipe(
          map(res => UserActions.loadUsersSuccess({ response: res })),
          catchError(err =>
            of(UserActions.loadUsersFailure({
              error: err.error?.message || 'Error loading active users'
            }))
          )
        )
      )
    )
  );


}
