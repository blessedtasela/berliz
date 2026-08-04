import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { MuscleGroupService } from '../../services/muscle-group.service';
import * as A from './muscle-group.actions';

@Injectable()
export class MuscleGroupEffects {

  constructor(
    private actions$: Actions,
    private svc: MuscleGroupService,
  ) { }

  loadMuscleGroups$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMuscleGroups),
    mergeMap(() => this.svc.getMuscleGroups().pipe(
      map(data => A.loadMuscleGroupsSuccess({ data })),
      catchError(e => of(A.loadMuscleGroupsFailure({ error: e?.error?.message || 'Failed to load muscle groups' })))
    ))
  ));

  loadActiveMuscleGroups$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadActiveMuscleGroups),
    mergeMap(() => this.svc.getActiveMuscleGroups().pipe(
      map(data => A.loadActiveMuscleGroupsSuccess({ data })),
      catchError(e => of(A.loadActiveMuscleGroupsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadMuscleGroup$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMuscleGroup),
    mergeMap(({ id }) => this.svc.getMuscleGroup(id).pipe(
      map(data => A.loadMuscleGroupSuccess({ data })),
      catchError(e => of(A.loadMuscleGroupFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  addMuscleGroup$ = createEffect(() => this.actions$.pipe(
    ofType(A.addMuscleGroup),
    mergeMap(({ data }) => this.svc.addMuscleGroup(data).pipe(
      map(r => A.addMuscleGroupSuccess({ message: r.message })),
      catchError(e => of(A.addMuscleGroupFailure({ error: e?.error?.message || 'Failed to add muscle group' })))
    ))
  ));

  updateMuscleGroup$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateMuscleGroup),
    mergeMap(({ data }) => this.svc.updateMuscleGroup(data).pipe(
      map(r => A.updateMuscleGroupSuccess({ message: r.message })),
      catchError(e => of(A.updateMuscleGroupFailure({ error: e?.error?.message || 'Failed to update muscle group' })))
    ))
  ));

  updateMuscleGroupImage$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateMuscleGroupImage),
    mergeMap(({ data }) => this.svc.updateMuscleGroupImage(data).pipe(
      map(r => A.updateMuscleGroupImageSuccess({ message: r.message })),
      catchError(e => of(A.updateMuscleGroupImageFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  updateMuscleGroupStatus$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateMuscleGroupStatus),
    mergeMap(({ id }) => this.svc.updateStatus(id).pipe(
      map(r => A.updateMuscleGroupStatusSuccess({ message: r.message })),
      catchError(e => of(A.updateMuscleGroupStatusFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  deleteMuscleGroup$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteMuscleGroup),
    mergeMap(({ id }) => this.svc.deleteMuscleGroup(id).pipe(
      map(r => A.deleteMuscleGroupSuccess({ message: r.message })),
      catchError(e => of(A.deleteMuscleGroupFailure({ error: e?.error?.message || 'Failed to delete muscle group' })))
    ))
  ));
}
