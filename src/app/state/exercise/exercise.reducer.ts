import { createReducer, on } from '@ngrx/store';
import { Exercises } from '../../models/exercise.interface';
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

  // =========================================================================
  // TRENDING
  // =========================================================================

  // trendingCategoryId is committed on request, not on response, so the pills
  // highlight the user's choice immediately while the list is still loading.
  on(A.loadTrendingExercises, (s, { categoryId }) => ({
    ...s, trendingLoading: true, error: null, trendingCategoryId: categoryId
  })),

  // Drop a response whose category the user has already toggled away from.
  on(A.loadTrendingExercisesSuccess, (s, { data, categoryId }) =>
    categoryId !== s.trendingCategoryId
      ? s
      : { ...s, trendingLoading: false, trending: data ?? [] }
  ),

  on(A.loadTrendingExercisesFailure, (s, { error }) => ({
    ...s, trendingLoading: false, error
  })),

  // =========================================================================
  // LIKES
  // =========================================================================

  on(A.likeExercise, A.loadMyExerciseLikes, s => ({ ...s, loading: true, error: null })),

  on(A.likeExerciseFailure, A.loadMyExerciseLikesFailure, (s, { error }) => ({
    ...s, loading: false, error
  })),

  // The like response carries the exercise with its authoritative new count —
  // fold it into every list holding that row so counts stay consistent.
  on(A.likeExerciseSuccess, (s, { data }) => {
    if (!data?.id) { return { ...s, loading: false }; }
    const upsert = (list: Exercises[]) =>
      list.map(e => (e.id === data.id ? { ...e, likes: data.likes } : e));
    return {
      ...s, loading: false,
      exercises: upsert(s.exercises),
      activeExercises: upsert(s.activeExercises),
      trending: upsert(s.trending),
      selectedExercise: s.selectedExercise?.id === data.id
        ? { ...s.selectedExercise, likes: data.likes }
        : s.selectedExercise,
    };
  }),

  on(A.loadMyExerciseLikesSuccess, (s, { data }) => ({
    ...s, loading: false, myExerciseLikes: data ?? []
  })),
);
