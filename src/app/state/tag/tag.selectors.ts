import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TagState } from './tag.state';
import { tagFeatureKey } from './tag.reducer';

const selectState = createFeatureSelector<TagState>(tagFeatureKey);

export const selectTagLoading = createSelector(selectState, s => s.loading);
export const selectTagError   = createSelector(selectState, s => s.error);
export const selectTagMessage = createSelector(selectState, s => s.lastMessage);

export const selectTags       = createSelector(selectState, s => s.tags);
export const selectActiveTags = createSelector(selectState, s => s.activeTags);
