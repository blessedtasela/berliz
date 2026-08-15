import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { ProgressShareService } from '../../services/progress-share.service';
import * as A from './progress-share.actions';

@Injectable()
export class ProgressShareEffects {

  constructor(
    private actions$: Actions,
    private svc: ProgressShareService,
  ) { }

  grantProgressShare$ = createEffect(() => this.actions$.pipe(
    ofType(A.grantProgressShare),
    mergeMap(({ trainerId }) => this.svc.grant(trainerId).pipe(
      map(response => A.grantProgressShareSuccess({ response })),
      catchError(e => of(A.grantProgressShareFailure({ error: e?.error?.message || 'Failed to grant access' })))
    ))
  ));

  revokeProgressShare$ = createEffect(() => this.actions$.pipe(
    ofType(A.revokeProgressShare),
    mergeMap(({ trainerId }) => this.svc.revoke(trainerId).pipe(
      map(response => A.revokeProgressShareSuccess({ response, trainerId })),
      catchError(e => of(A.revokeProgressShareFailure({ error: e?.error?.message || 'Failed to revoke access' })))
    ))
  ));

  loadMyGrants$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyGrants),
    mergeMap(() => this.svc.getMyGrants().pipe(
      map(response => A.loadMyGrantsSuccess({ response })),
      catchError(e => of(A.loadMyGrantsFailure({ error: e?.error?.message || 'Failed to load your grants' })))
    ))
  ));

  loadSharedWithMe$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadSharedWithMe),
    mergeMap(() => this.svc.getSharedWithMe().pipe(
      map(response => A.loadSharedWithMeSuccess({ response })),
      catchError(e => of(A.loadSharedWithMeFailure({ error: e?.error?.message || 'Failed to load clients shared with you' })))
    ))
  ));

  loadClientProgress$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadClientProgress),
    mergeMap(({ clientId }) => this.svc.getClientProgress(clientId).pipe(
      map(response => A.loadClientProgressSuccess({ response })),
      catchError(e => of(A.loadClientProgressFailure({ error: e?.error?.message || 'Failed to load client progress' })))
    ))
  ));
}
