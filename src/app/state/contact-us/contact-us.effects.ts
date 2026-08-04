import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { ContactUsService } from '../../services/contact-us.service';
import * as A from './contact-us.actions';

@Injectable()
export class ContactUsEffects {

  constructor(
    private actions$: Actions,
    private svc: ContactUsService,
  ) { }

  loadContactUs$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadContactUs),
    mergeMap(() => this.svc.getAllContactUs().pipe(
      map(data => A.loadContactUsSuccess({ data })),
      catchError(e => of(A.loadContactUsFailure({ error: e?.error?.message || 'Failed to load contact us submissions' })))
    ))
  ));

  loadContactUsMessages$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadContactUsMessages),
    mergeMap(() => this.svc.getContactUsMessages().pipe(
      map(data => A.loadContactUsMessagesSuccess({ data })),
      catchError(e => of(A.loadContactUsMessagesFailure({ error: e?.error?.message || 'Failed to load contact us messages' })))
    ))
  ));

  addContactUs$ = createEffect(() => this.actions$.pipe(
    ofType(A.addContactUs),
    mergeMap(({ data }) => this.svc.addContactUs(data).pipe(
      map(r => A.addContactUsSuccess({ message: r.message })),
      catchError(e => of(A.addContactUsFailure({ error: e?.error?.message || 'Failed to add contact us submission' })))
    ))
  ));

  updateContactUs$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateContactUs),
    mergeMap(({ data }) => this.svc.updateContactUs(data).pipe(
      map(r => A.updateContactUsSuccess({ message: r.message })),
      catchError(e => of(A.updateContactUsFailure({ error: e?.error?.message || 'Failed to update contact us submission' })))
    ))
  ));

  updateContactUsStatus$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateContactUsStatus),
    mergeMap(({ id }) => this.svc.updateStatus(id).pipe(
      map(r => A.updateContactUsStatusSuccess({ message: r.message })),
      catchError(e => of(A.updateContactUsStatusFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  reviewContactUs$ = createEffect(() => this.actions$.pipe(
    ofType(A.reviewContactUs),
    mergeMap(({ data }) => this.svc.reviewContactUs(data).pipe(
      map(r => A.reviewContactUsSuccess({ message: r.message })),
      catchError(e => of(A.reviewContactUsFailure({ error: e?.error?.message || 'Failed to review contact us submission' })))
    ))
  ));

  deleteContactUs$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteContactUs),
    mergeMap(({ id }) => this.svc.deleteContactUs(id).pipe(
      map(r => A.deleteContactUsSuccess({ message: r.message })),
      catchError(e => of(A.deleteContactUsFailure({ error: e?.error?.message || 'Failed to delete contact us submission' })))
    ))
  ));
}
