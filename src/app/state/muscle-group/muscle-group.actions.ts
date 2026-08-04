import { createAction, props } from '@ngrx/store';
import { MuscleGroups } from '../../models/muscle-groups.interface';

type Err  = { error: string };
type Id   = { id: number };
type Data = { data: any };

export const loadMuscleGroups = createAction('[MuscleGroup] Load All');
export const loadMuscleGroupsSuccess = createAction('[MuscleGroup] Load All Success', props<{ data: MuscleGroups[] }>());
export const loadMuscleGroupsFailure = createAction('[MuscleGroup] Load All Failure', props<Err>());

export const loadActiveMuscleGroups = createAction('[MuscleGroup] Load Active');
export const loadActiveMuscleGroupsSuccess = createAction('[MuscleGroup] Load Active Success', props<{ data: MuscleGroups[] }>());
export const loadActiveMuscleGroupsFailure = createAction('[MuscleGroup] Load Active Failure', props<Err>());

export const loadMuscleGroup = createAction('[MuscleGroup] Load By Id', props<Id>());
export const loadMuscleGroupSuccess = createAction('[MuscleGroup] Load By Id Success', props<{ data: MuscleGroups }>());
export const loadMuscleGroupFailure = createAction('[MuscleGroup] Load By Id Failure', props<Err>());

export const addMuscleGroup = createAction('[MuscleGroup] Add', props<Data>());
export const addMuscleGroupSuccess = createAction('[MuscleGroup] Add Success', props<{ message: string }>());
export const addMuscleGroupFailure = createAction('[MuscleGroup] Add Failure', props<Err>());

export const updateMuscleGroup = createAction('[MuscleGroup] Update', props<Data>());
export const updateMuscleGroupSuccess = createAction('[MuscleGroup] Update Success', props<{ message: string }>());
export const updateMuscleGroupFailure = createAction('[MuscleGroup] Update Failure', props<Err>());

export const updateMuscleGroupImage = createAction('[MuscleGroup] Update Image', props<Data>());
export const updateMuscleGroupImageSuccess = createAction('[MuscleGroup] Update Image Success', props<{ message: string }>());
export const updateMuscleGroupImageFailure = createAction('[MuscleGroup] Update Image Failure', props<Err>());

export const updateMuscleGroupStatus = createAction('[MuscleGroup] Update Status', props<Id>());
export const updateMuscleGroupStatusSuccess = createAction('[MuscleGroup] Update Status Success', props<{ message: string }>());
export const updateMuscleGroupStatusFailure = createAction('[MuscleGroup] Update Status Failure', props<Err>());

export const deleteMuscleGroup = createAction('[MuscleGroup] Delete', props<Id>());
export const deleteMuscleGroupSuccess = createAction('[MuscleGroup] Delete Success', props<{ message: string }>());
export const deleteMuscleGroupFailure = createAction('[MuscleGroup] Delete Failure', props<Err>());
