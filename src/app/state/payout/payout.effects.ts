import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { PayoutService } from '../../services/payout.service';
import * as A from './payout.actions';

@Injectable()
export class PayoutEffects {

  constructor(
    private actions$: Actions,
    private svc: PayoutService,
  ) { }

  loadMyPayouts$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyPayouts),
    mergeMap(() => this.svc.getMyPayouts().pipe(
      map(response => A.loadMyPayoutsSuccess({ response })),
      catchError(e => of(A.loadMyPayoutsFailure({ error: e?.error?.message || 'Failed to load your payouts' })))
    ))
  ));

  loadAllPayouts$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadAllPayouts),
    mergeMap(() => this.svc.getAllPayouts().pipe(
      map(response => A.loadAllPayoutsSuccess({ response })),
      catchError(e => of(A.loadAllPayoutsFailure({ error: e?.error?.message || 'Failed to load payouts' })))
    ))
  ));

  payOutViaStripe$ = createEffect(() => this.actions$.pipe(
    ofType(A.payOutViaStripe),
    mergeMap(({ id }) => this.svc.payOutViaStripe(id).pipe(
      map(response => A.payOutViaStripeSuccess({ response })),
      catchError(e => of(A.payOutViaStripeFailure({ error: e?.error?.message || 'Failed to send payout' })))
    ))
  ));
}
