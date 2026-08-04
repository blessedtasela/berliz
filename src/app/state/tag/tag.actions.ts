import { createAction, props } from '@ngrx/store';
import { Tags } from '../../models/tags.interface';

type Err  = { error: string };
type Id   = { id: number };
type Data = { data: any };

export const loadTags = createAction('[Tag] Load All');
export const loadTagsSuccess = createAction('[Tag] Load All Success', props<{ data: Tags[] }>());
export const loadTagsFailure = createAction('[Tag] Load All Failure', props<Err>());

export const loadActiveTags = createAction('[Tag] Load Active');
export const loadActiveTagsSuccess = createAction('[Tag] Load Active Success', props<{ data: Tags[] }>());
export const loadActiveTagsFailure = createAction('[Tag] Load Active Failure', props<Err>());

export const addTag = createAction('[Tag] Add', props<Data>());
export const addTagSuccess = createAction('[Tag] Add Success', props<{ message: string }>());
export const addTagFailure = createAction('[Tag] Add Failure', props<Err>());

export const updateTag = createAction('[Tag] Update', props<Data>());
export const updateTagSuccess = createAction('[Tag] Update Success', props<{ message: string }>());
export const updateTagFailure = createAction('[Tag] Update Failure', props<Err>());

export const updateTagStatus = createAction('[Tag] Update Status', props<Id>());
export const updateTagStatusSuccess = createAction('[Tag] Update Status Success', props<{ message: string }>());
export const updateTagStatusFailure = createAction('[Tag] Update Status Failure', props<Err>());

export const deleteTag = createAction('[Tag] Delete', props<Id>());
export const deleteTagSuccess = createAction('[Tag] Delete Success', props<{ message: string }>());
export const deleteTagFailure = createAction('[Tag] Delete Failure', props<Err>());
