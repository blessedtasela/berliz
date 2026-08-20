import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';

import { UserService } from '../../services/user.service';
import * as A from './user-profile.actions';

@Injectable()
export class UserProfileEffects {

  constructor(
    private actions$: Actions,
    private userService: UserService
  ) {}

  // Only the newest /user/:id request matters — switchMap so a fast back/forward
  // can't land an older profile on top of the current one.
  loadPublicProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.loadPublicProfile),
      switchMap(({ id }) =>
        this.userService.getPublicProfile(id).pipe(
          map(response => A.loadPublicProfileSuccess({ response })),
          catchError(err =>
            of(A.loadPublicProfileFailure({
              error: err.error?.message || 'Could not load this profile'
            }))
          )
        )
      )
    )
  );

  updateProfileVisibility$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.updateProfileVisibility),
      mergeMap(({ profileVisibility }) =>
        this.userService.updateProfileVisibility(profileVisibility).pipe(
          map(response => A.updateProfileVisibilitySuccess({ response, profileVisibility })),
          catchError(err =>
            of(A.updateProfileVisibilityFailure({
              error: err.error?.message || 'Could not update your profile visibility'
            }))
          )
        )
      )
    )
  );

  updateSidebarDisplay$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.updateSidebarDisplay),
      mergeMap(({ sidebarDisplay }) =>
        this.userService.updateSidebarDisplay(sidebarDisplay).pipe(
          map(response => A.updateSidebarDisplaySuccess({ response, sidebarDisplay })),
          catchError(err =>
            of(A.updateSidebarDisplayFailure({
              error: err.error?.message || 'Could not update your sidebar display preference'
            }))
          )
        )
      )
    )
  );

  // Only the newest search/role combo matters — switchMap so a fast typist
  // can't land a stale response on top of the current filter.
  loadPublicDirectory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.loadPublicDirectory),
      switchMap(({ search, role }) =>
        this.userService.getPublicDirectory(search, role).pipe(
          map(response => A.loadPublicDirectorySuccess({ response })),
          catchError(err =>
            of(A.loadPublicDirectoryFailure({
              error: err.error?.message || 'Could not load the member directory'
            }))
          )
        )
      )
    )
  );
}
