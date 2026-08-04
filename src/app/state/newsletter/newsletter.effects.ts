import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { NewsletterService } from '../../services/newsletter.service';
import * as A from './newsletter.actions';

@Injectable()
export class NewsletterEffects {

  constructor(
    private actions$: Actions,
    private svc: NewsletterService,
  ) { }

  loadNewsletters$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadNewsletters),
    mergeMap(() => this.svc.getAllNewsletters().pipe(
      map(data => A.loadNewslettersSuccess({ data })),
      catchError(e => of(A.loadNewslettersFailure({ error: e?.error?.message || 'Failed to load newsletters' })))
    ))
  ));

  loadActiveNewsletters$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadActiveNewsletters),
    mergeMap(() => this.svc.getActiveNewsletters().pipe(
      map(data => A.loadActiveNewslettersSuccess({ data })),
      catchError(e => of(A.loadActiveNewslettersFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadNewsletterMessages$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadNewsletterMessages),
    mergeMap(() => this.svc.getNewsletterMessages().pipe(
      map(data => A.loadNewsletterMessagesSuccess({ data })),
      catchError(e => of(A.loadNewsletterMessagesFailure({ error: e?.error?.message || 'Failed to load newsletter messages' })))
    ))
  ));

  addNewsletter$ = createEffect(() => this.actions$.pipe(
    ofType(A.addNewsletter),
    mergeMap(({ data }) => this.svc.addNewsletter(data).pipe(
      map(r => A.addNewsletterSuccess({ message: r.message })),
      catchError(e => of(A.addNewsletterFailure({ error: e?.error?.message || 'Failed to add newsletter' })))
    ))
  ));

  updateNewsletter$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateNewsletter),
    mergeMap(({ data }) => this.svc.updateNewsletter(data).pipe(
      map(r => A.updateNewsletterSuccess({ message: r.message })),
      catchError(e => of(A.updateNewsletterFailure({ error: e?.error?.message || 'Failed to update newsletter' })))
    ))
  ));

  updateNewsletterStatus$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateNewsletterStatus),
    mergeMap(({ id }) => this.svc.updateStatus(id).pipe(
      map(r => A.updateNewsletterStatusSuccess({ message: r.message })),
      catchError(e => of(A.updateNewsletterStatusFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  deleteNewsletter$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteNewsletter),
    mergeMap(({ id }) => this.svc.deleteNewsletter(id).pipe(
      map(r => A.deleteNewsletterSuccess({ message: r.message })),
      catchError(e => of(A.deleteNewsletterFailure({ error: e?.error?.message || 'Failed to delete newsletter' })))
    ))
  ));

  sendNewsletterMessage$ = createEffect(() => this.actions$.pipe(
    ofType(A.sendNewsletterMessage),
    mergeMap(({ data }) => this.svc.sendMessage(data).pipe(
      map(r => A.sendNewsletterMessageSuccess({ message: r.message })),
      catchError(e => of(A.sendNewsletterMessageFailure({ error: e?.error?.message || 'Failed to send message' })))
    ))
  ));

  sendNewsletterBulkMessage$ = createEffect(() => this.actions$.pipe(
    ofType(A.sendNewsletterBulkMessage),
    mergeMap(({ data }) => this.svc.sendBulkMessage(data).pipe(
      map(r => A.sendNewsletterBulkMessageSuccess({ message: r.message })),
      catchError(e => of(A.sendNewsletterBulkMessageFailure({ error: e?.error?.message || 'Failed to send bulk message' })))
    ))
  ));
}
