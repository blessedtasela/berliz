import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import {
    WorkoutResponse,
    WorkoutAssignmentResponse,
} from '../../models/workout.interface';

type Res<T> = { response: ApiResponse<T> };
type Err = { error: string };
type Id = { id: number };
type Data = { data: any };

// =============================================================================
// WORKOUTS
// =============================================================================
export const loadMyWorkouts = createAction('[Workout] Load My Workouts');
export const loadMyWorkoutsSuccess = createAction('[Workout] Load My Workouts Success', props<Res<WorkoutResponse[]>>());
export const loadMyWorkoutsFailure = createAction('[Workout] Load My Workouts Failure', props<Err>());

export const loadWorkout = createAction('[Workout] Load Workout', props<Id>());
export const loadWorkoutSuccess = createAction('[Workout] Load Workout Success', props<Res<WorkoutResponse>>());
export const loadWorkoutFailure = createAction('[Workout] Load Workout Failure', props<Err>());

export const addWorkout = createAction('[Workout] Add Workout', props<Data>());
export const addWorkoutSuccess = createAction('[Workout] Add Workout Success', props<Res<WorkoutResponse>>());
export const addWorkoutFailure = createAction('[Workout] Add Workout Failure', props<Err>());

export const updateWorkout = createAction('[Workout] Update Workout', props<Data>());
export const updateWorkoutSuccess = createAction('[Workout] Update Workout Success', props<Res<WorkoutResponse>>());
export const updateWorkoutFailure = createAction('[Workout] Update Workout Failure', props<Err>());

export const deleteWorkout = createAction('[Workout] Delete Workout', props<Id>());
export const deleteWorkoutSuccess = createAction('[Workout] Delete Workout Success', props<Id>());
export const deleteWorkoutFailure = createAction('[Workout] Delete Workout Failure', props<Err>());

export const clearSelectedWorkout = createAction('[Workout] Clear Selected Workout');

// =============================================================================
// PUBLIC TEMPLATES
// =============================================================================
export const loadWorkoutTemplates = createAction('[Workout] Load Workout Templates');
export const loadWorkoutTemplatesSuccess = createAction('[Workout] Load Workout Templates Success', props<Res<WorkoutResponse[]>>());
export const loadWorkoutTemplatesFailure = createAction('[Workout] Load Workout Templates Failure', props<Err>());

export const cloneWorkoutTemplate = createAction('[Workout] Clone Workout Template', props<Id>());
export const cloneWorkoutTemplateSuccess = createAction('[Workout] Clone Workout Template Success', props<Res<WorkoutResponse>>());
export const cloneWorkoutTemplateFailure = createAction('[Workout] Clone Workout Template Failure', props<Err>());

// =============================================================================
// WORKOUT ASSIGNMENTS
// =============================================================================
export const assignWorkout = createAction('[Workout] Assign Workout', props<Data>());
export const assignWorkoutSuccess = createAction('[Workout] Assign Workout Success', props<Res<WorkoutAssignmentResponse>>());
export const assignWorkoutFailure = createAction('[Workout] Assign Workout Failure', props<Err>());

export const updateAssignmentStatus = createAction('[Workout] Update Assignment Status', props<{ id: number; status: string }>());
export const updateAssignmentStatusSuccess = createAction('[Workout] Update Assignment Status Success', props<Res<WorkoutAssignmentResponse>>());
export const updateAssignmentStatusFailure = createAction('[Workout] Update Assignment Status Failure', props<Err>());

export const loadMyAssignedWorkouts = createAction('[Workout] Load My Assigned Workouts');
export const loadMyAssignedWorkoutsSuccess = createAction('[Workout] Load My Assigned Workouts Success', props<Res<WorkoutAssignmentResponse[]>>());
export const loadMyAssignedWorkoutsFailure = createAction('[Workout] Load My Assigned Workouts Failure', props<Err>());

export const loadAssignmentsIMade = createAction('[Workout] Load Assignments I Made');
export const loadAssignmentsIMadeSuccess = createAction('[Workout] Load Assignments I Made Success', props<Res<WorkoutAssignmentResponse[]>>());
export const loadAssignmentsIMadeFailure = createAction('[Workout] Load Assignments I Made Failure', props<Err>());

// REFRESH (WebSocket / manual)
export const refreshWorkouts = createAction('[Workout] Refresh Workouts');
