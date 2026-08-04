import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { TagService } from '../../services/tag.service';
import * as A from './tag.actions';

@Injectable()
export class TagEffects {

  constructor(
    private actions$: Actions,
    private svc: TagService,
  ) { }

  loadTags$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTags),
    mergeMap(() => this.svc.getAllTags().pipe(
      map(data => A.loadTagsSuccess({ data })),
      catchError(e => of(A.loadTagsFailure({ error: e?.error?.message || 'Failed to load tags' })))
    ))
  ));

  loadActiveTags$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadActiveTags),
    mergeMap(() => this.svc.getActiveTags().pipe(
      map(data => A.loadActiveTagsSuccess({ data })),
      catchError(e => of(A.loadActiveTagsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  addTag$ = createEffect(() => this.actions$.pipe(
    ofType(A.addTag),
    mergeMap(({ data }) => this.svc.addTag(data).pipe(
      map(r => A.addTagSuccess({ message: r.message })),
      catchError(e => of(A.addTagFailure({ error: e?.error?.message || 'Failed to add tag' })))
    ))
  ));

  updateTag$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTag),
    mergeMap(({ data }) => this.svc.updateTag(data).pipe(
      map(r => A.updateTagSuccess({ message: r.message })),
      catchError(e => of(A.updateTagFailure({ error: e?.error?.message || 'Failed to update tag' })))
    ))
  ));

  updateTagStatus$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTagStatus),
    mergeMap(({ id }) => this.svc.updateStatus(id).pipe(
      map(r => A.updateTagStatusSuccess({ message: r.message })),
      catchError(e => of(A.updateTagStatusFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  deleteTag$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteTag),
    mergeMap(({ id }) => this.svc.deleteTag(id).pipe(
      map(r => A.deleteTagSuccess({ message: r.message })),
      catchError(e => of(A.deleteTagFailure({ error: e?.error?.message || 'Failed to delete tag' })))
    ))
  ));
}
