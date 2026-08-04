import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MuscleGroupState } from './muscle-group.state';
import { muscleGroupFeatureKey } from './muscle-group.reducer';

const selectState = createFeatureSelector<MuscleGroupState>(muscleGroupFeatureKey);

export const selectMuscleGroupLoading = createSelector(selectState, s => s.loading);
export const selectMuscleGroupError   = createSelector(selectState, s => s.error);
export const selectMuscleGroupMessage = createSelector(selectState, s => s.lastMessage);

export const selectMuscleGroups        = createSelector(selectState, s => s.muscleGroups);
export const selectActiveMuscleGroups  = createSelector(selectState, s => s.activeMuscleGroups);
export const selectSelectedMuscleGroup = createSelector(selectState, s => s.selectedMuscleGroup);
