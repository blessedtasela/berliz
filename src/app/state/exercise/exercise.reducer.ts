import { createReducer, on } from '@ngrx/store';
import * as A from './exercise.actions';
import { initialExerciseState } from './exercise.state';

export const exerciseFeatureKey = 'exercise';

export const exerciseReducer = createReducer(
  initialExerciseState,

  on(
    A.loadExercises, A.loadActiveExercises, A.loadExercise,
    A.addExercise, A.updateExercise, A.updateExerciseDemo, A.updateExerciseStatus, A.deleteExercise,
    state => ({ ...state, loading: true, error: null })
  ),

  on(
    A.loadExercisesFailure, A.loadActiveExercisesFailure, A.loadExerciseFailure,
    A.addExerciseFailure, A.updateExerciseFailure, A.updateExerciseDemoFailure, A.updateExerciseStatusFailure, A.deleteExerciseFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  on(A.loadExercisesSuccess, (s, { data }) => ({
    ...s, loading: false, exercises: data ?? []
  })),

  on(A.loadActiveExercisesSuccess, (s, { data }) => ({
    ...s, loading: false, activeExercises: data ?? []
  })),

  on(A.loadExerciseSuccess, (s, { data }) => ({
    ...s, loading: false, selectedExercise: data ?? null
  })),

  // Mutations only return a message (no ApiResponse/DTO on this backend) —
  // consumers must re-dispatch loadExercises/loadActiveExercises to refresh.
  on(
    A.addExerciseSuccess, A.updateExerciseSuccess, A.updateExerciseDemoSuccess,
    A.updateExerciseStatusSuccess, A.deleteExerciseSuccess,
    (s, { message }) => ({ ...s, loading: false, lastMessage: message })
  ),
);
