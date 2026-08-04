import { createAction, props } from '@ngrx/store';
import { TodoList } from '../../models/todoList.interface';

type Err  = { error: string };
type Id   = { id: number };
type Data = { data: any };

export const loadTodos = createAction('[Todo] Load All');
export const loadTodosSuccess = createAction('[Todo] Load All Success', props<{ data: TodoList[] }>());
export const loadTodosFailure = createAction('[Todo] Load All Failure', props<Err>());

export const loadMyTodos = createAction('[Todo] Load Mine');
export const loadMyTodosSuccess = createAction('[Todo] Load Mine Success', props<{ data: TodoList[] }>());
export const loadMyTodosFailure = createAction('[Todo] Load Mine Failure', props<Err>());

export const addTodo = createAction('[Todo] Add', props<Data>());
export const addTodoSuccess = createAction('[Todo] Add Success', props<{ message: string }>());
export const addTodoFailure = createAction('[Todo] Add Failure', props<Err>());

export const updateTodo = createAction('[Todo] Update', props<Data>());
export const updateTodoSuccess = createAction('[Todo] Update Success', props<{ message: string }>());
export const updateTodoFailure = createAction('[Todo] Update Failure', props<Err>());

export const bulkActionTodo = createAction('[Todo] Bulk Action', props<Data>());
export const bulkActionTodoSuccess = createAction('[Todo] Bulk Action Success', props<{ message: string }>());
export const bulkActionTodoFailure = createAction('[Todo] Bulk Action Failure', props<Err>());

export const quickActionTodo = createAction('[Todo] Quick Action', props<Data>());
export const quickActionTodoSuccess = createAction('[Todo] Quick Action Success', props<{ message: string }>());
export const quickActionTodoFailure = createAction('[Todo] Quick Action Failure', props<Err>());

export const updateTodoStatus = createAction('[Todo] Update Status', props<{ id: number; status: string }>());
export const updateTodoStatusSuccess = createAction('[Todo] Update Status Success', props<{ message: string }>());
export const updateTodoStatusFailure = createAction('[Todo] Update Status Failure', props<Err>());

export const deleteTodo = createAction('[Todo] Delete', props<Id>());
export const deleteTodoSuccess = createAction('[Todo] Delete Success', props<{ message: string }>());
export const deleteTodoFailure = createAction('[Todo] Delete Failure', props<Err>());
