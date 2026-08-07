import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WorkoutState } from './workout.state';
import { workoutFeatureKey } from './workout.reducer';

const selectState = createFeatureSelector<WorkoutState>(workoutFeatureKey);

// ── Async ─────────────────────────────────────────────────────────────────────
export const selectWorkoutLoading = createSelector(selectState, s => s.loading);
export const selectWorkoutError   = createSelector(selectState, s => s.error);

// ── Workouts ──────────────────────────────────────────────────────────────────
export const selectMyWorkouts     = createSelector(selectState, s => s.myWorkouts);
export const selectSelectedWorkout = createSelector(selectState, s => s.selectedWorkout);

// ── Public templates ──────────────────────────────────────────────────────────
export const selectWorkoutTemplates = createSelector(selectState, s => s.templates);

// ── Assignments ───────────────────────────────────────────────────────────────
export const selectMyAssignedWorkouts = createSelector(selectState, s => s.myAssignedWorkouts);
export const selectAssignmentsIMade   = createSelector(selectState, s => s.assignmentsIMade);
