import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { SubscriptionService } from '../../services/subscription.service';
import * as A from './subscription.actions';

@Injectable()
export class SubscriptionEffects {

  constructor(
    private actions$: Actions,
    private svc: SubscriptionService,
  ) { }

  loadSubscriptions$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadSubscriptions),
    mergeMap(() => this.svc.getAllSubscriptions().pipe(
      map(data => A.loadSubscriptionsSuccess({ data })),
      catchError(e => of(A.loadSubscriptionsFailure({ error: e?.error?.message || 'Failed to load subscriptions' })))
    ))
  ));

  loadActiveSubscriptions$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadActiveSubscriptions),
    mergeMap(() => this.svc.getActiveSubscriptions().pipe(
      map(data => A.loadActiveSubscriptionsSuccess({ data })),
      catchError(e => of(A.loadActiveSubscriptionsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadMySubscriptions$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMySubscriptions),
    mergeMap(() => this.svc.getMySubscriptions().pipe(
      map(data => A.loadMySubscriptionsSuccess({ data })),
      catchError(e => of(A.loadMySubscriptionsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadSubscription$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadSubscription),
    mergeMap(({ id }) => this.svc.getSubscription(id).pipe(
      map(data => A.loadSubscriptionSuccess({ data })),
      catchError(e => of(A.loadSubscriptionFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  addSubscription$ = createEffect(() => this.actions$.pipe(
    ofType(A.addSubscription),
    mergeMap(({ data }) => this.svc.addSubscription(data).pipe(
      map(r => A.addSubscriptionSuccess({ message: r.message })),
      catchError(e => of(A.addSubscriptionFailure({ error: e?.error?.message || 'Failed to add subscription' })))
    ))
  ));

  updateSubscription$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateSubscription),
    mergeMap(({ data }) => this.svc.updateSubscription(data).pipe(
      map(r => A.updateSubscriptionSuccess({ message: r.message })),
      catchError(e => of(A.updateSubscriptionFailure({ error: e?.error?.message || 'Failed to update subscription' })))
    ))
  ));

  updateSubscriptionStatus$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateSubscriptionStatus),
    mergeMap(({ id }) => this.svc.updateStatus(id).pipe(
      map(r => A.updateSubscriptionStatusSuccess({ message: r.message })),
      catchError(e => of(A.updateSubscriptionStatusFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  deleteSubscription$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteSubscription),
    mergeMap(({ id }) => this.svc.deleteSubscription(id).pipe(
      map(r => A.deleteSubscriptionSuccess({ message: r.message })),
      catchError(e => of(A.deleteSubscriptionFailure({ error: e?.error?.message || 'Failed to delete subscription' })))
    ))
  ));

  bulkActionSubscription$ = createEffect(() => this.actions$.pipe(
    ofType(A.bulkActionSubscription),
    mergeMap(({ data }) => this.svc.bulkAction(data).pipe(
      map(r => A.bulkActionSubscriptionSuccess({ message: r.message })),
      catchError(e => of(A.bulkActionSubscriptionFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  selectPlan$ = createEffect(() => this.actions$.pipe(
    ofType(A.selectPlan),
    mergeMap(({ planId }) => this.svc.selectPlan(planId).pipe(
      map(response => A.selectPlanSuccess({ response })),
      catchError(e => of(A.selectPlanFailure({ error: e?.error?.message || 'Failed to select plan' })))
    ))
  ));
}
