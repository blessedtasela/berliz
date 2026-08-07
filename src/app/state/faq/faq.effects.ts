import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { FaqService } from '../../services/faq.service';
import * as A from './faq.actions';

@Injectable()
export class FaqEffects {

  constructor(
    private actions$: Actions,
    private svc: FaqService,
  ) { }

  loadFaqs$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadFaqs),
    mergeMap(() => this.svc.getAllFaqs().pipe(
      map(response => A.loadFaqsSuccess({ response })),
      catchError(e => of(A.loadFaqsFailure({ error: e?.error?.message || 'Failed to load FAQs' })))
    ))
  ));

  loadActiveFaqs$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadActiveFaqs),
    mergeMap(() => this.svc.getActiveFaqs().pipe(
      map(response => A.loadActiveFaqsSuccess({ response })),
      catchError(e => of(A.loadActiveFaqsFailure({ error: e?.error?.message || 'Failed to load FAQs' })))
    ))
  ));

  addFaq$ = createEffect(() => this.actions$.pipe(
    ofType(A.addFaq),
    mergeMap(({ data }) => this.svc.addFaq(data).pipe(
      map(response => A.addFaqSuccess({ response })),
      catchError(e => of(A.addFaqFailure({ error: e?.error?.message || 'Failed to add FAQ' })))
    ))
  ));

  updateFaq$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateFaq),
    mergeMap(({ data }) => this.svc.updateFaq(data).pipe(
      map(response => A.updateFaqSuccess({ response })),
      catchError(e => of(A.updateFaqFailure({ error: e?.error?.message || 'Failed to update FAQ' })))
    ))
  ));

  updateFaqStatus$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateFaqStatus),
    mergeMap(({ id }) => this.svc.updateStatus(id).pipe(
      map(response => A.updateFaqStatusSuccess({ response })),
      catchError(e => of(A.updateFaqStatusFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  deleteFaq$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteFaq),
    mergeMap(({ id }) => this.svc.deleteFaq(id).pipe(
      map(() => A.deleteFaqSuccess({ id })),
      catchError(e => of(A.deleteFaqFailure({ error: e?.error?.message || 'Failed to delete FAQ' })))
    ))
  ));
}
