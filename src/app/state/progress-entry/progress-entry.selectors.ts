import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProgressEntryState } from './progress-entry.state';
import { progressEntryFeatureKey } from './progress-entry.reducer';

const selectState = createFeatureSelector<ProgressEntryState>(progressEntryFeatureKey);

export const selectProgressEntryLoading = createSelector(selectState, s => s.loading);
export const selectProgressEntryError = createSelector(selectState, s => s.error);

export const selectMyProgressEntries = createSelector(selectState, s => s.myEntries);

export const selectSelectedClientProgressEntries = createSelector(selectState, s => s.selectedClientEntries);
export const selectLoadingClientProgressEntries = createSelector(selectState, s => s.loadingClientEntries);
