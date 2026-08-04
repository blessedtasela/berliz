import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TaskState } from './task.state';
import { taskFeatureKey } from './task.reducer';

const selectState = createFeatureSelector<TaskState>(taskFeatureKey);

export const selectTaskLoading = createSelector(selectState, s => s.loading);
export const selectTaskError   = createSelector(selectState, s => s.error);

export const selectTasks        = createSelector(selectState, s => s.tasks);
export const selectActiveTasks  = createSelector(selectState, s => s.activeTasks);
export const selectTrainerTasks = createSelector(selectState, s => s.trainerTasks);
export const selectClientTasks  = createSelector(selectState, s => s.clientTasks);
export const selectSelectedTask = createSelector(selectState, s => s.selectedTask);

export const selectSubTasks = createSelector(selectState, s => s.subTasks);
