import { createReducer, on } from '@ngrx/store';
import * as A from './workout.actions';
import { initialWorkoutState } from './workout.state';

export const workoutFeatureKey = 'workout';

function upsert<T extends { id?: any }>(list: T[], item: T): T[] {
  if (!item) return list;
  const idx = list.findIndex(x => x.id === item.id);
  return idx >= 0
    ? [...list.slice(0, idx), item, ...list.slice(idx + 1)]
    : [...list, item];
}

export const workoutReducer = createReducer(
  initialWorkoutState,

  // ── LOADING ───────────────────────────────────────────────────────────────
  on(
    A.loadMyWorkouts, A.loadWorkout,
    A.addWorkout, A.updateWorkout, A.deleteWorkout,
    A.assignWorkout, A.updateAssignmentStatus,
    A.loadMyAssignedWorkouts, A.loadAssignmentsIMade,
    A.loadWorkoutTemplates, A.cloneWorkoutTemplate,
    state => ({ ...state, loading: true, error: null })
  ),

  // ── ALL FAILURES ──────────────────────────────────────────────────────────
  on(
    A.loadMyWorkoutsFailure, A.loadWorkoutFailure,
    A.addWorkoutFailure, A.updateWorkoutFailure, A.deleteWorkoutFailure,
    A.assignWorkoutFailure, A.updateAssignmentStatusFailure,
    A.loadMyAssignedWorkoutsFailure, A.loadAssignmentsIMadeFailure,
    A.loadWorkoutTemplatesFailure, A.cloneWorkoutTemplateFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  // =========================================================================
  // WORKOUTS
  // =========================================================================
  on(A.loadMyWorkoutsSuccess, (s, { response }) => ({
    ...s, loading: false, myWorkouts: response.data ?? []
  })),
  on(A.loadWorkoutSuccess, (s, { response }) => ({
    ...s, loading: false, selectedWorkout: response.data ?? null
  })),
  on(A.addWorkoutSuccess, (s, { response }) => ({
    ...s, loading: false,
    selectedWorkout: response.data ?? s.selectedWorkout,
    myWorkouts: response.data ? [...s.myWorkouts, response.data] : s.myWorkouts,
  })),
  on(A.updateWorkoutSuccess, (s, { response }) => ({
    ...s, loading: false,
    selectedWorkout: response.data ?? s.selectedWorkout,
    myWorkouts: response.data ? upsert(s.myWorkouts, response.data) : s.myWorkouts,
  })),
  on(A.deleteWorkoutSuccess, (s, { id }) => ({
    ...s, loading: false,
    selectedWorkout: s.selectedWorkout?.id === id ? null : s.selectedWorkout,
    myWorkouts: s.myWorkouts.filter(w => w.id !== id),
    templates: s.templates.filter(t => t.id !== id),
    myAssignedWorkouts: s.myAssignedWorkouts.filter(a => a.workoutId !== id),
    assignmentsIMade: s.assignmentsIMade.filter(a => a.workoutId !== id),
  })),
  on(A.clearSelectedWorkout, s => ({ ...s, selectedWorkout: null })),

  // =========================================================================
  // PUBLIC TEMPLATES
  // =========================================================================
  on(A.loadWorkoutTemplatesSuccess, (s, { response }) => ({
    ...s, loading: false, templates: response.data ?? []
  })),
  // A clone is a brand-new workout owned by the caller — it lands in myWorkouts
  // exactly like addWorkoutSuccess does. The templates list is untouched.
  on(A.cloneWorkoutTemplateSuccess, (s, { response }) => ({
    ...s, loading: false,
    myWorkouts: response.data ? [...s.myWorkouts, response.data] : s.myWorkouts,
  })),

  // =========================================================================
  // WORKOUT ASSIGNMENTS
  // =========================================================================
  on(A.loadMyAssignedWorkoutsSuccess, (s, { response }) => ({
    ...s, loading: false, myAssignedWorkouts: response.data ?? []
  })),
  on(A.loadAssignmentsIMadeSuccess, (s, { response }) => ({
    ...s, loading: false, assignmentsIMade: response.data ?? []
  })),
  on(A.assignWorkoutSuccess, (s, { response }) => ({
    ...s, loading: false,
    assignmentsIMade: response.data ? upsert(s.assignmentsIMade, response.data) : s.assignmentsIMade,
  })),
  on(A.updateAssignmentStatusSuccess, (s, { response }) => ({
    ...s, loading: false,
    myAssignedWorkouts: response.data ? upsert(s.myAssignedWorkouts, response.data) : s.myAssignedWorkouts,
    assignmentsIMade: response.data ? upsert(s.assignmentsIMade, response.data) : s.assignmentsIMade,
  })),

  // =========================================================================
  // REFRESH — re-triggers loadMyWorkouts$ / loadMyAssignedWorkouts$ in effects
  // =========================================================================
  on(A.refreshWorkouts, state => ({ ...state, loading: true })),
);
