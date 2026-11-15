import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { ClientIntakeService } from '../../services/client-intake.service';
import * as A from './client-intake.actions';

@Injectable()
export class ClientIntakeEffects {

  constructor(
    private actions$: Actions,
    private svc: ClientIntakeService,
  ) { }

  sendClientIntake$ = createEffect(() => this.actions$.pipe(
    ofType(A.sendClientIntake),
    mergeMap(({ data }) => this.svc.sendIntake(data).pipe(
      map(response => A.sendClientIntakeSuccess({ response })),
      catchError(e => of(A.sendClientIntakeFailure({ error: e?.error?.message || 'Failed to send PAR-Q' })))
    ))
  ));

  loadClientIntake$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadClientIntake),
    mergeMap(({ id }) => this.svc.getIntake(id).pipe(
      map(response => A.loadClientIntakeSuccess({ response })),
      catchError(e => of(A.loadClientIntakeFailure({ error: e?.error?.message || 'Failed to load PAR-Q' })))
    ))
  ));

  saveClientIntakeDraft$ = createEffect(() => this.actions$.pipe(
    ofType(A.saveClientIntakeDraft),
    mergeMap(({ data }) => this.svc.saveDraft(data).pipe(
      map(response => A.saveClientIntakeDraftSuccess({ response })),
      catchError(e => of(A.saveClientIntakeDraftFailure({ error: e?.error?.message || 'Failed to save' })))
    ))
  ));

  signClientIntake$ = createEffect(() => this.actions$.pipe(
    ofType(A.signClientIntake),
    mergeMap(({ data }) => this.svc.signIntake(data).pipe(
      map(response => A.signClientIntakeSuccess({ response })),
      catchError(e => of(A.signClientIntakeFailure({ error: e?.error?.message || 'Failed to sign PAR-Q' })))
    ))
  ));

  loadMyClientIntakes$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyClientIntakes),
    mergeMap(() => this.svc.getMyIntakes().pipe(
      map(response => A.loadMyClientIntakesSuccess({ response })),
      catchError(e => of(A.loadMyClientIntakesFailure({ error: e?.error?.message || 'Failed to load client intakes' })))
    ))
  ));
}
