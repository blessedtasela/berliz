import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { ProgressEntryService } from '../../services/progress-entry.service';
import * as A from './progress-entry.actions';

@Injectable()
export class ProgressEntryEffects {

  constructor(
    private actions$: Actions,
    private svc: ProgressEntryService,
  ) { }

  createProgressEntry$ = createEffect(() => this.actions$.pipe(
    ofType(A.createProgressEntry),
    mergeMap(({ request }) => this.svc.create(request).pipe(
      map(response => A.createProgressEntrySuccess({ response })),
      catchError(e => of(A.createProgressEntryFailure({ error: e?.error?.message || 'Failed to save progress entry' })))
    ))
  ));

  updateProgressEntry$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateProgressEntry),
    mergeMap(({ entryId, request }) => this.svc.update(entryId, request).pipe(
      map(response => A.updateProgressEntrySuccess({ response })),
      catchError(e => of(A.updateProgressEntryFailure({ error: e?.error?.message || 'Failed to update progress entry' })))
    ))
  ));

  deleteProgressEntry$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteProgressEntry),
    mergeMap(({ entryId }) => this.svc.delete(entryId).pipe(
      map(response => A.deleteProgressEntrySuccess({ response, entryId })),
      catchError(e => of(A.deleteProgressEntryFailure({ error: e?.error?.message || 'Failed to delete progress entry' })))
    ))
  ));

  addProgressEntryPhoto$ = createEffect(() => this.actions$.pipe(
    ofType(A.addProgressEntryPhoto),
    mergeMap(({ entryId, photo }) => this.svc.addPhoto(entryId, photo).pipe(
      map(response => A.addProgressEntryPhotoSuccess({ response })),
      catchError(e => of(A.addProgressEntryPhotoFailure({ error: e?.error?.message || 'Failed to add photo' })))
    ))
  ));

  removeProgressEntryPhoto$ = createEffect(() => this.actions$.pipe(
    ofType(A.removeProgressEntryPhoto),
    mergeMap(({ entryId, photoId }) => this.svc.removePhoto(entryId, photoId).pipe(
      map(response => A.removeProgressEntryPhotoSuccess({ response })),
      catchError(e => of(A.removeProgressEntryPhotoFailure({ error: e?.error?.message || 'Failed to remove photo' })))
    ))
  ));

  loadMyProgressEntries$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyProgressEntries),
    mergeMap(() => this.svc.getMyEntries().pipe(
      map(response => A.loadMyProgressEntriesSuccess({ response })),
      catchError(e => of(A.loadMyProgressEntriesFailure({ error: e?.error?.message || 'Failed to load your progress' })))
    ))
  ));

  loadClientProgressEntries$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadClientProgressEntries),
    mergeMap(({ clientId }) => this.svc.getClientEntries(clientId).pipe(
      map(response => A.loadClientProgressEntriesSuccess({ response })),
      catchError(e => of(A.loadClientProgressEntriesFailure({ error: e?.error?.message || 'Failed to load client progress' })))
    ))
  ));
}
