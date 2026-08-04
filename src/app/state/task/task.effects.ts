import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { TaskService } from '../../services/task.service';
import * as A from './task.actions';

@Injectable()
export class TaskEffects {

  constructor(
    private actions$: Actions,
    private svc: TaskService,
  ) { }

  loadTasks$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTasks),
    mergeMap(() => this.svc.getAllTasks().pipe(
      map(r => A.loadTasksSuccess({ response: r })),
      catchError(e => of(A.loadTasksFailure({ error: e?.error?.message || 'Failed to load tasks' })))
    ))
  ));

  loadActiveTasks$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadActiveTasks),
    mergeMap(() => this.svc.getActiveTasks().pipe(
      map(r => A.loadActiveTasksSuccess({ response: r })),
      catchError(e => of(A.loadActiveTasksFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadTrainerTasks$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTrainerTasks),
    mergeMap(() => this.svc.getTrainerTasks().pipe(
      map(r => A.loadTrainerTasksSuccess({ response: r })),
      catchError(e => of(A.loadTrainerTasksFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadClientTasks$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadClientTasks),
    mergeMap(() => this.svc.getClientTasks().pipe(
      map(r => A.loadClientTasksSuccess({ response: r })),
      catchError(e => of(A.loadClientTasksFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadTask$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTask),
    mergeMap(({ id }) => this.svc.getTask(id).pipe(
      map(r => A.loadTaskSuccess({ response: r })),
      catchError(e => of(A.loadTaskFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  addTask$ = createEffect(() => this.actions$.pipe(
    ofType(A.addTask),
    mergeMap(({ data }) => this.svc.addTask(data).pipe(
      map(r => A.addTaskSuccess({ response: r })),
      catchError(e => of(A.addTaskFailure({ error: e?.error?.message || 'Failed to add task' })))
    ))
  ));

  updateTask$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTask),
    mergeMap(({ data }) => this.svc.updateTask(data).pipe(
      map(r => A.updateTaskSuccess({ response: r })),
      catchError(e => of(A.updateTaskFailure({ error: e?.error?.message || 'Failed to update task' })))
    ))
  ));

  updateTaskStatus$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTaskStatus),
    mergeMap(({ id }) => this.svc.updateStatus(id).pipe(
      map(r => A.updateTaskStatusSuccess({ response: r })),
      catchError(e => of(A.updateTaskStatusFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  deleteTask$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteTask),
    mergeMap(({ id }) => this.svc.deleteTask(id).pipe(
      map(() => A.deleteTaskSuccess({ id })),
      catchError(e => of(A.deleteTaskFailure({ error: e?.error?.message || 'Failed to delete task' })))
    ))
  ));

  // ── SUB-TASKS ───────────────────────────────────────────────────────────
  loadSubTasks$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadSubTasks),
    mergeMap(() => this.svc.getAllSubTasks().pipe(
      map(r => A.loadSubTasksSuccess({ response: r })),
      catchError(e => of(A.loadSubTasksFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  addSubTask$ = createEffect(() => this.actions$.pipe(
    ofType(A.addSubTask),
    mergeMap(({ data }) => this.svc.addSubTask(data).pipe(
      map(r => A.addSubTaskSuccess({ response: r })),
      catchError(e => of(A.addSubTaskFailure({ error: e?.error?.message || 'Failed to add sub task' })))
    ))
  ));

  updateSubTask$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateSubTask),
    mergeMap(({ data }) => this.svc.updateSubTask(data).pipe(
      map(r => A.updateSubTaskSuccess({ response: r })),
      catchError(e => of(A.updateSubTaskFailure({ error: e?.error?.message || 'Failed to update sub task' })))
    ))
  ));

  deleteSubTask$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteSubTask),
    mergeMap(({ id }) => this.svc.deleteSubTask(id).pipe(
      map(() => A.deleteSubTaskSuccess({ id })),
      catchError(e => of(A.deleteSubTaskFailure({ error: e?.error?.message || 'Failed to delete sub task' })))
    ))
  ));
}
