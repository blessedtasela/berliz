import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { TodoService } from '../../services/todo.service';
import * as A from './todo.actions';

@Injectable()
export class TodoEffects {

  constructor(
    private actions$: Actions,
    private svc: TodoService,
  ) { }

  loadTodos$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTodos),
    mergeMap(() => this.svc.getAllTodos().pipe(
      map(data => A.loadTodosSuccess({ data })),
      catchError(e => of(A.loadTodosFailure({ error: e?.error?.message || 'Failed to load todos' })))
    ))
  ));

  loadMyTodos$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyTodos),
    mergeMap(() => this.svc.getmyTodos().pipe(
      map(data => A.loadMyTodosSuccess({ data })),
      catchError(e => of(A.loadMyTodosFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  addTodo$ = createEffect(() => this.actions$.pipe(
    ofType(A.addTodo),
    mergeMap(({ data }) => this.svc.addTodo(data).pipe(
      map(r => A.addTodoSuccess({ message: r.message })),
      catchError(e => of(A.addTodoFailure({ error: e?.error?.message || 'Failed to add todo' })))
    ))
  ));

  updateTodo$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTodo),
    mergeMap(({ data }) => this.svc.updateTodoList(data).pipe(
      map(r => A.updateTodoSuccess({ message: r.message })),
      catchError(e => of(A.updateTodoFailure({ error: e?.error?.message || 'Failed to update todo' })))
    ))
  ));

  bulkActionTodo$ = createEffect(() => this.actions$.pipe(
    ofType(A.bulkActionTodo),
    mergeMap(({ data }) => this.svc.bulkAction(data).pipe(
      map(r => A.bulkActionTodoSuccess({ message: r.message })),
      catchError(e => of(A.bulkActionTodoFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  quickActionTodo$ = createEffect(() => this.actions$.pipe(
    ofType(A.quickActionTodo),
    mergeMap(({ data }) => this.svc.quickAction(data).pipe(
      map(r => A.quickActionTodoSuccess({ message: r.message })),
      catchError(e => of(A.quickActionTodoFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  updateTodoStatus$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTodoStatus),
    mergeMap(({ id, status }) => this.svc.updateStatus(id, status).pipe(
      map(r => A.updateTodoStatusSuccess({ message: r.message })),
      catchError(e => of(A.updateTodoStatusFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  deleteTodo$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteTodo),
    mergeMap(({ id }) => this.svc.deleteTodo(id).pipe(
      map(r => A.deleteTodoSuccess({ message: r.message })),
      catchError(e => of(A.deleteTodoFailure({ error: e?.error?.message || 'Failed to delete todo' })))
    ))
  ));
}
