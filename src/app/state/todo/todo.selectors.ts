import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TodoState } from './todo.state';
import { todoFeatureKey } from './todo.reducer';

const selectState = createFeatureSelector<TodoState>(todoFeatureKey);

export const selectTodoLoading = createSelector(selectState, s => s.loading);
export const selectTodoError   = createSelector(selectState, s => s.error);
export const selectTodoMessage = createSelector(selectState, s => s.lastMessage);

export const selectTodos   = createSelector(selectState, s => s.todos);
export const selectMyTodos = createSelector(selectState, s => s.myTodos);
