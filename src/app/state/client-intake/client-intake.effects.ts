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

  createClientIntake$ = createEffect(() => this.actions$.pipe(
    ofType(A.createClientIntake),
    mergeMap(({ data }) => this.svc.createIntake(data).pipe(
      map(response => A.createClientIntakeSuccess({ response })),
      catchError(e => of(A.createClientIntakeFailure({ error: e?.error?.message || 'Failed to submit intake' })))
    ))
  ));

  loadClientIntake$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadClientIntake),
    mergeMap(({ id }) => this.svc.getIntake(id).pipe(
      map(response => A.loadClientIntakeSuccess({ response })),
      catchError(e => of(A.loadClientIntakeFailure({ error: e?.error?.message || 'Failed to load intake' })))
    ))
  ));

  updateClientIntake$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateClientIntake),
    mergeMap(({ data }) => this.svc.updateIntake(data).pipe(
      map(response => A.updateClientIntakeSuccess({ response })),
      catchError(e => of(A.updateClientIntakeFailure({ error: e?.error?.message || 'Failed to update intake' })))
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
