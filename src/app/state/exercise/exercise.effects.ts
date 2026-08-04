import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { ExerciseService } from '../../services/exercise.service';
import * as A from './exercise.actions';

@Injectable()
export class ExerciseEffects {

  constructor(
    private actions$: Actions,
    private svc: ExerciseService,
  ) { }

  loadExercises$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadExercises),
    mergeMap(() => this.svc.getExercises().pipe(
      map(data => A.loadExercisesSuccess({ data })),
      catchError(e => of(A.loadExercisesFailure({ error: e?.error?.message || 'Failed to load exercises' })))
    ))
  ));

  loadActiveExercises$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadActiveExercises),
    mergeMap(() => this.svc.getActiveExercises().pipe(
      map(data => A.loadActiveExercisesSuccess({ data })),
      catchError(e => of(A.loadActiveExercisesFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadExercise$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadExercise),
    mergeMap(({ id }) => this.svc.getExercise(id).pipe(
      map(data => A.loadExerciseSuccess({ data })),
      catchError(e => of(A.loadExerciseFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  addExercise$ = createEffect(() => this.actions$.pipe(
    ofType(A.addExercise),
    mergeMap(({ data }) => this.svc.addExercise(data).pipe(
      map(r => A.addExerciseSuccess({ message: r.message })),
      catchError(e => of(A.addExerciseFailure({ error: e?.error?.message || 'Failed to add exercise' })))
    ))
  ));

  updateExercise$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateExercise),
    mergeMap(({ data }) => this.svc.updateExercise(data).pipe(
      map(r => A.updateExerciseSuccess({ message: r.message })),
      catchError(e => of(A.updateExerciseFailure({ error: e?.error?.message || 'Failed to update exercise' })))
    ))
  ));

  updateExerciseDemo$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateExerciseDemo),
    mergeMap(({ data }) => this.svc.updateExerciseDemo(data).pipe(
      map(r => A.updateExerciseDemoSuccess({ message: r.message })),
      catchError(e => of(A.updateExerciseDemoFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  updateExerciseStatus$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateExerciseStatus),
    mergeMap(({ id }) => this.svc.updateStatus(id).pipe(
      map(r => A.updateExerciseStatusSuccess({ message: r.message })),
      catchError(e => of(A.updateExerciseStatusFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  deleteExercise$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteExercise),
    mergeMap(({ id }) => this.svc.deleteExercise(id).pipe(
      map(r => A.deleteExerciseSuccess({ message: r.message })),
      catchError(e => of(A.deleteExerciseFailure({ error: e?.error?.message || 'Failed to delete exercise' })))
    ))
  ));
}
