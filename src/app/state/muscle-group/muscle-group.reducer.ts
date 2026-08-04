import { createReducer, on } from '@ngrx/store';
import * as A from './muscle-group.actions';
import { initialMuscleGroupState } from './muscle-group.state';

export const muscleGroupFeatureKey = 'muscleGroup';

export const muscleGroupReducer = createReducer(
  initialMuscleGroupState,

  on(
    A.loadMuscleGroups, A.loadActiveMuscleGroups, A.loadMuscleGroup,
    A.addMuscleGroup, A.updateMuscleGroup, A.updateMuscleGroupImage, A.updateMuscleGroupStatus, A.deleteMuscleGroup,
    state => ({ ...state, loading: true, error: null })
  ),

  on(
    A.loadMuscleGroupsFailure, A.loadActiveMuscleGroupsFailure, A.loadMuscleGroupFailure,
    A.addMuscleGroupFailure, A.updateMuscleGroupFailure, A.updateMuscleGroupImageFailure, A.updateMuscleGroupStatusFailure, A.deleteMuscleGroupFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  on(A.loadMuscleGroupsSuccess, (s, { data }) => ({
    ...s, loading: false, muscleGroups: data ?? []
  })),

  on(A.loadActiveMuscleGroupsSuccess, (s, { data }) => ({
    ...s, loading: false, activeMuscleGroups: data ?? []
  })),

  on(A.loadMuscleGroupSuccess, (s, { data }) => ({
    ...s, loading: false, selectedMuscleGroup: data ?? null
  })),

  // Mutations only return a message (no ApiResponse/DTO on this backend) —
  // consumers must re-dispatch loadMuscleGroups/loadActiveMuscleGroups to refresh.
  on(
    A.addMuscleGroupSuccess, A.updateMuscleGroupSuccess, A.updateMuscleGroupImageSuccess,
    A.updateMuscleGroupStatusSuccess, A.deleteMuscleGroupSuccess,
    (s, { message }) => ({ ...s, loading: false, lastMessage: message })
  ),
);
