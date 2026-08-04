import { createReducer, on } from '@ngrx/store';
import * as A from './todo.actions';
import { initialTodoState } from './todo.state';
import { TodoList } from '../../models/todoList.interface';

export const todoFeatureKey = 'todo';

const sectionOrder: Record<string, number> = {
  overdue: 0, upcoming: 1, today: 2, tomorrow: 3, completed: 4, cancelled: 5
};
const priorityOrder: Record<string, number> = {
  high: 0, normal: 1, low: 2, due: 3
};

function getSection(todo: TodoList, now: number): string {
  const due = todo.dueDate ? new Date(todo.dueDate).getTime() : Infinity;
  if (todo.status === 'cancelled') return 'cancelled';
  if (todo.status === 'completed') return 'completed';
  if (due < now) return 'overdue';
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (due <= today.getTime()) return 'today';
  if (due <= tomorrow.getTime()) return 'tomorrow';
  return 'upcoming';
}

function sortMyTodos(list: TodoList[]): TodoList[] {
  const now = new Date().getTime();
  return [...list].sort((a, b) => {
    const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    const aSection = getSection(a, now);
    const bSection = getSection(b, now);
    if (sectionOrder[aSection] !== sectionOrder[bSection]) {
      return sectionOrder[aSection] - sectionOrder[bSection];
    }
    const aP = priorityOrder[a.priority] ?? 99;
    const bP = priorityOrder[b.priority] ?? 99;
    if (aP !== bP) return aP - bP;
    return aDue - bDue;
  });
}

export const todoReducer = createReducer(
  initialTodoState,

  on(
    A.loadTodos, A.loadMyTodos, A.addTodo, A.updateTodo, A.bulkActionTodo,
    A.quickActionTodo, A.updateTodoStatus, A.deleteTodo,
    state => ({ ...state, loading: true, error: null })
  ),

  on(
    A.loadTodosFailure, A.loadMyTodosFailure, A.addTodoFailure, A.updateTodoFailure,
    A.bulkActionTodoFailure, A.quickActionTodoFailure, A.updateTodoStatusFailure, A.deleteTodoFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  on(A.loadTodosSuccess, (s, { data }) => ({
    ...s, loading: false,
    todos: [...(data ?? [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })),

  on(A.loadMyTodosSuccess, (s, { data }) => ({
    ...s, loading: false, myTodos: sortMyTodos(data ?? [])
  })),

  // Mutations only return a message (no ApiResponse/DTO on this backend) —
  // consumers must re-dispatch loadTodos/loadMyTodos to refresh.
  on(
    A.addTodoSuccess, A.updateTodoSuccess, A.bulkActionTodoSuccess,
    A.quickActionTodoSuccess, A.updateTodoStatusSuccess, A.deleteTodoSuccess,
    (s, { message }) => ({ ...s, loading: false, lastMessage: message })
  ),
);
