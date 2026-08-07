import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { WorkoutService } from '../../services/workout.service';
import * as A from './workout.actions';

@Injectable()
export class WorkoutEffects {

  constructor(
    private actions$: Actions,
    private svc: WorkoutService,
  ) { }

  // =========================================================================
  // WORKOUTS
  // =========================================================================

  loadMyWorkouts$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyWorkouts, A.refreshWorkouts),
    mergeMap(() => this.svc.getMyWorkouts().pipe(
      map(r => A.loadMyWorkoutsSuccess({ response: r })),
      catchError(e => of(A.loadMyWorkoutsFailure({ error: e?.error?.message || 'Failed to load workouts' })))
    ))
  ));

  loadWorkout$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadWorkout),
    mergeMap(({ id }) => this.svc.getWorkout(id).pipe(
      map(r => A.loadWorkoutSuccess({ response: r })),
      catchError(e => of(A.loadWorkoutFailure({ error: e?.error?.message || 'Failed to load workout' })))
    ))
  ));

  addWorkout$ = createEffect(() => this.actions$.pipe(
    ofType(A.addWorkout),
    mergeMap(({ data }) => this.svc.addWorkout(data).pipe(
      map(r => A.addWorkoutSuccess({ response: r })),
      catchError(e => of(A.addWorkoutFailure({ error: e?.error?.message || 'Failed to save workout' })))
    ))
  ));

  updateWorkout$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateWorkout),
    mergeMap(({ data }) => this.svc.updateWorkout(data).pipe(
      map(r => A.updateWorkoutSuccess({ response: r })),
      catchError(e => of(A.updateWorkoutFailure({ error: e?.error?.message || 'Failed to update workout' })))
    ))
  ));

  deleteWorkout$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteWorkout),
    mergeMap(({ id }) => this.svc.deleteWorkout(id).pipe(
      map(() => A.deleteWorkoutSuccess({ id })),
      catchError(e => of(A.deleteWorkoutFailure({ error: e?.error?.message || 'Failed to delete workout' })))
    ))
  ));

  // =========================================================================
  // PUBLIC TEMPLATES
  // =========================================================================

  loadWorkoutTemplates$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadWorkoutTemplates),
    mergeMap(() => this.svc.getTemplates().pipe(
      map(r => A.loadWorkoutTemplatesSuccess({ response: r })),
      catchError(e => of(A.loadWorkoutTemplatesFailure({ error: e?.error?.message || 'Failed to load templates' })))
    ))
  ));

  cloneWorkoutTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(A.cloneWorkoutTemplate),
    mergeMap(({ id }) => this.svc.cloneTemplate(id).pipe(
      map(r => A.cloneWorkoutTemplateSuccess({ response: r })),
      catchError(e => of(A.cloneWorkoutTemplateFailure({ error: e?.error?.message || 'Failed to add this template' })))
    ))
  ));

  // =========================================================================
  // WORKOUT ASSIGNMENTS
  // =========================================================================

  assignWorkout$ = createEffect(() => this.actions$.pipe(
    ofType(A.assignWorkout),
    mergeMap(({ data }) => this.svc.assignWorkout(data).pipe(
      map(r => A.assignWorkoutSuccess({ response: r })),
      catchError(e => of(A.assignWorkoutFailure({ error: e?.error?.message || 'Failed to assign workout' })))
    ))
  ));

  updateAssignmentStatus$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateAssignmentStatus),
    mergeMap(({ id, status }) => this.svc.updateAssignmentStatus(id, status).pipe(
      map(r => A.updateAssignmentStatusSuccess({ response: r })),
      catchError(e => of(A.updateAssignmentStatusFailure({ error: e?.error?.message || 'Failed to update status' })))
    ))
  ));

  loadMyAssignedWorkouts$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyAssignedWorkouts, A.refreshWorkouts),
    mergeMap(() => this.svc.getMyAssignedWorkouts().pipe(
      map(r => A.loadMyAssignedWorkoutsSuccess({ response: r })),
      catchError(e => of(A.loadMyAssignedWorkoutsFailure({ error: e?.error?.message || 'Failed to load assigned workouts' })))
    ))
  ));

  loadAssignmentsIMade$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadAssignmentsIMade),
    mergeMap(() => this.svc.getAssignmentsIMade().pipe(
      map(r => A.loadAssignmentsIMadeSuccess({ response: r })),
      catchError(e => of(A.loadAssignmentsIMadeFailure({ error: e?.error?.message || 'Failed to load assignments' })))
    ))
  ));
}
