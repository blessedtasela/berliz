import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProgressShareState } from './progress-share.state';
import { progressShareFeatureKey } from './progress-share.reducer';

const selectState = createFeatureSelector<ProgressShareState>(progressShareFeatureKey);

export const selectProgressShareLoading = createSelector(selectState, s => s.loading);
export const selectProgressShareError = createSelector(selectState, s => s.error);

export const selectMyGrants = createSelector(selectState, s => s.myGrants);
export const selectSharedWithMe = createSelector(selectState, s => s.sharedWithMe);

export const selectSelectedClientProgress = createSelector(selectState, s => s.selectedClientProgress);
export const selectLoadingClientProgress = createSelector(selectState, s => s.loadingClientProgress);

/** True once myGrants has loaded and this specific trainer is in it. */
export const selectIsSharedWithTrainer = (trainerId: number) => createSelector(
  selectMyGrants,
  grants => grants.some(g => g.trainerId === trainerId && g.isActive)
);
