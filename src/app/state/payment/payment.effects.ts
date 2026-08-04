import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { PaymentService } from '../../services/payment.service';
import * as A from './payment.actions';

@Injectable()
export class PaymentEffects {

  constructor(
    private actions$: Actions,
    private svc: PaymentService,
  ) { }

  loadPayments$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadPayments),
    mergeMap(() => this.svc.getAllPayments().pipe(
      map(r => A.loadPaymentsSuccess({ response: r })),
      catchError(e => of(A.loadPaymentsFailure({ error: e?.error?.message || 'Failed to load payments' })))
    ))
  ));

  loadActivePayments$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadActivePayments),
    mergeMap(() => this.svc.getActivePayments().pipe(
      map(r => A.loadActivePaymentsSuccess({ response: r })),
      catchError(e => of(A.loadActivePaymentsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadMyPayments$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyPayments),
    mergeMap(() => this.svc.getMyPayments().pipe(
      map(r => A.loadMyPaymentsSuccess({ response: r })),
      catchError(e => of(A.loadMyPaymentsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadPayment$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadPayment),
    mergeMap(({ id }) => this.svc.getPayment(id).pipe(
      map(r => A.loadPaymentSuccess({ response: r })),
      catchError(e => of(A.loadPaymentFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  addPayment$ = createEffect(() => this.actions$.pipe(
    ofType(A.addPayment),
    mergeMap(({ data }) => this.svc.addPayment(data).pipe(
      map(r => A.addPaymentSuccess({ response: r })),
      catchError(e => of(A.addPaymentFailure({ error: e?.error?.message || 'Failed to add payment' })))
    ))
  ));

  updatePayment$ = createEffect(() => this.actions$.pipe(
    ofType(A.updatePayment),
    mergeMap(({ data }) => this.svc.updatePayment(data).pipe(
      map(r => A.updatePaymentSuccess({ response: r })),
      catchError(e => of(A.updatePaymentFailure({ error: e?.error?.message || 'Failed to update payment' })))
    ))
  ));

  updatePaymentStatus$ = createEffect(() => this.actions$.pipe(
    ofType(A.updatePaymentStatus),
    mergeMap(({ id }) => this.svc.updateStatus(id).pipe(
      map(r => A.updatePaymentStatusSuccess({ response: r })),
      catchError(e => of(A.updatePaymentStatusFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  deletePayment$ = createEffect(() => this.actions$.pipe(
    ofType(A.deletePayment),
    mergeMap(({ id }) => this.svc.deletePayment(id).pipe(
      map(() => A.deletePaymentSuccess({ id })),
      catchError(e => of(A.deletePaymentFailure({ error: e?.error?.message || 'Failed to delete payment' })))
    ))
  ));
}
