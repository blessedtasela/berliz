import { createAction, props } from '@ngrx/store';
import { ExerciseLikes, Exercises } from '../../models/exercise.interface';

type Err  = { error: string };
type Id   = { id: number };
type Data = { data: any };

export const loadExercises = createAction('[Exercise] Load All');
export const loadExercisesSuccess = createAction('[Exercise] Load All Success', props<{ data: Exercises[] }>());
export const loadExercisesFailure = createAction('[Exercise] Load All Failure', props<Err>());

export const loadActiveExercises = createAction('[Exercise] Load Active');
export const loadActiveExercisesSuccess = createAction('[Exercise] Load Active Success', props<{ data: Exercises[] }>());
export const loadActiveExercisesFailure = createAction('[Exercise] Load Active Failure', props<Err>());

export const loadExercise = createAction('[Exercise] Load By Id', props<Id>());
export const loadExerciseSuccess = createAction('[Exercise] Load By Id Success', props<{ data: Exercises }>());
export const loadExerciseFailure = createAction('[Exercise] Load By Id Failure', props<Err>());

export const addExercise = createAction('[Exercise] Add', props<Data>());
export const addExerciseSuccess = createAction('[Exercise] Add Success', props<{ message: string }>());
export const addExerciseFailure = createAction('[Exercise] Add Failure', props<Err>());

export const updateExercise = createAction('[Exercise] Update', props<Data>());
export const updateExerciseSuccess = createAction('[Exercise] Update Success', props<{ message: string }>());
export const updateExerciseFailure = createAction('[Exercise] Update Failure', props<Err>());

export const updateExerciseDemo = createAction('[Exercise] Update Demo', props<Data>());
export const updateExerciseDemoSuccess = createAction('[Exercise] Update Demo Success', props<{ message: string }>());
export const updateExerciseDemoFailure = createAction('[Exercise] Update Demo Failure', props<Err>());

export const updateExerciseStatus = createAction('[Exercise] Update Status', props<Id>());
export const updateExerciseStatusSuccess = createAction('[Exercise] Update Status Success', props<{ message: string }>());
export const updateExerciseStatusFailure = createAction('[Exercise] Update Status Failure', props<Err>());

export const deleteExercise = createAction('[Exercise] Delete', props<Id>());
export const deleteExerciseSuccess = createAction('[Exercise] Delete Success', props<{ message: string }>());
export const deleteExerciseFailure = createAction('[Exercise] Delete Failure', props<Err>());

// =============================================================================
// TRENDING
// =============================================================================
// categoryId is carried on both the request and the success action so a slow
// response for a category the user has already toggled away from can be dropped
// instead of overwriting the list they are currently looking at.
export const loadTrendingExercises = createAction(
  '[Exercise] Load Trending', props<{ categoryId: number | null }>());
export const loadTrendingExercisesSuccess = createAction(
  '[Exercise] Load Trending Success', props<{ data: Exercises[]; categoryId: number | null }>());
export const loadTrendingExercisesFailure = createAction(
  '[Exercise] Load Trending Failure', props<Err>());

// =============================================================================
// LIKES
// =============================================================================
export const likeExercise = createAction('[Exercise] Like', props<Id>());
export const likeExerciseSuccess = createAction('[Exercise] Like Success', props<{ data: Exercises }>());
export const likeExerciseFailure = createAction('[Exercise] Like Failure', props<Err>());

export const loadMyExerciseLikes = createAction('[Exercise] Load My Likes');
export const loadMyExerciseLikesSuccess = createAction('[Exercise] Load My Likes Success', props<{ data: ExerciseLikes[] }>());
export const loadMyExerciseLikesFailure = createAction('[Exercise] Load My Likes Failure', props<Err>());
