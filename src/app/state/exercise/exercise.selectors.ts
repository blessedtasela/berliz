import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ExerciseState } from './exercise.state';
import { exerciseFeatureKey } from './exercise.reducer';

const selectState = createFeatureSelector<ExerciseState>(exerciseFeatureKey);

export const selectExerciseLoading = createSelector(selectState, s => s.loading);
export const selectExerciseError   = createSelector(selectState, s => s.error);
export const selectExerciseMessage = createSelector(selectState, s => s.lastMessage);

export const selectExercises        = createSelector(selectState, s => s.exercises);
export const selectActiveExercises  = createSelector(selectState, s => s.activeExercises);
export const selectSelectedExercise = createSelector(selectState, s => s.selectedExercise);

// ── Trending ──────────────────────────────────────────────────────────────────
export const selectTrendingExercises   = createSelector(selectState, s => s.trending);
export const selectTrendingCategoryId  = createSelector(selectState, s => s.trendingCategoryId);
export const selectTrendingLoading     = createSelector(selectState, s => s.trendingLoading);

// ── Likes ─────────────────────────────────────────────────────────────────────
export const selectMyExerciseLikes = createSelector(selectState, s => s.myExerciseLikes);

/** Ids of exercises the current user has liked — drives the filled-heart state. */
export const selectLikedExerciseIds = createSelector(
  selectMyExerciseLikes,
  likes => likes.map(l => l.exerciseId)
);
