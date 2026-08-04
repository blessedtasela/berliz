import { createReducer, on } from '@ngrx/store';
import * as A from './task.actions';
import { initialTaskState } from './task.state';

export const taskFeatureKey = 'task';

function upsert<T extends { id?: any }>(list: T[], item: T): T[] {
  if (!item) return list;
  const idx = list.findIndex(x => x.id === item.id);
  return idx >= 0
    ? [...list.slice(0, idx), item, ...list.slice(idx + 1)]
    : [...list, item];
}

export const taskReducer = createReducer(
  initialTaskState,

  on(
    A.loadTasks, A.loadActiveTasks, A.loadTrainerTasks, A.loadClientTasks, A.loadTask,
    A.addTask, A.updateTask, A.updateTaskStatus, A.deleteTask,
    A.loadSubTasks, A.addSubTask, A.updateSubTask, A.deleteSubTask,
    state => ({ ...state, loading: true, error: null })
  ),

  on(
    A.loadTasksFailure, A.loadActiveTasksFailure, A.loadTrainerTasksFailure, A.loadClientTasksFailure, A.loadTaskFailure,
    A.addTaskFailure, A.updateTaskFailure, A.updateTaskStatusFailure, A.deleteTaskFailure,
    A.loadSubTasksFailure, A.addSubTaskFailure, A.updateSubTaskFailure, A.deleteSubTaskFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  on(A.loadTasksSuccess, (s, { response }) => ({
    ...s, loading: false, tasks: response.data ?? []
  })),

  on(A.loadActiveTasksSuccess, (s, { response }) => ({
    ...s, loading: false, activeTasks: response.data ?? []
  })),

  on(A.loadTrainerTasksSuccess, (s, { response }) => ({
    ...s, loading: false, trainerTasks: response.data ?? []
  })),

  on(A.loadClientTasksSuccess, (s, { response }) => ({
    ...s, loading: false, clientTasks: response.data ?? []
  })),

  on(A.loadTaskSuccess, (s, { response }) => ({
    ...s, loading: false, selectedTask: response.data ?? null
  })),

  on(A.addTaskSuccess, (s, { response }) => ({
    ...s, loading: false,
    tasks: response.data ? [...s.tasks, response.data] : s.tasks,
  })),

  on(A.updateTaskSuccess, A.updateTaskStatusSuccess, (s, { response }) => ({
    ...s, loading: false,
    selectedTask: response.data ?? s.selectedTask,
    tasks: response.data ? upsert(s.tasks, response.data) : s.tasks,
    activeTasks: response.data ? upsert(s.activeTasks, response.data) : s.activeTasks,
    trainerTasks: response.data ? upsert(s.trainerTasks, response.data) : s.trainerTasks,
    clientTasks: response.data ? upsert(s.clientTasks, response.data) : s.clientTasks,
  })),

  on(A.deleteTaskSuccess, (s, { id }) => ({
    ...s, loading: false,
    selectedTask: s.selectedTask?.id === id ? null : s.selectedTask,
    tasks: s.tasks.filter(t => t.id !== id),
    activeTasks: s.activeTasks.filter(t => t.id !== id),
    trainerTasks: s.trainerTasks.filter(t => t.id !== id),
    clientTasks: s.clientTasks.filter(t => t.id !== id),
  })),

  // ── SUB-TASKS ───────────────────────────────────────────────────────────
  on(A.loadSubTasksSuccess, (s, { response }) => ({
    ...s, loading: false, subTasks: response.data ?? []
  })),

  on(A.addSubTaskSuccess, (s, { response }) => ({
    ...s, loading: false,
    subTasks: response.data ? [...s.subTasks, response.data] : s.subTasks,
  })),

  on(A.updateSubTaskSuccess, (s, { response }) => ({
    ...s, loading: false,
    subTasks: response.data ? upsert(s.subTasks, response.data) : s.subTasks,
  })),

  on(A.deleteSubTaskSuccess, (s, { id }) => ({
    ...s, loading: false,
    subTasks: s.subTasks.filter(t => t.id !== id),
  })),
);
