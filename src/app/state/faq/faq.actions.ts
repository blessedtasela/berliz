import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import { Faq } from '../../models/faq.model';

type Res<T> = { response: ApiResponse<T> };
type Err = { error: string };
type Id = { id: number };
type Data = { data: any };

export const loadFaqs = createAction('[Faq] Load All');
export const loadFaqsSuccess = createAction('[Faq] Load All Success', props<Res<Faq[]>>());
export const loadFaqsFailure = createAction('[Faq] Load All Failure', props<Err>());

export const loadActiveFaqs = createAction('[Faq] Load Active');
export const loadActiveFaqsSuccess = createAction('[Faq] Load Active Success', props<Res<Faq[]>>());
export const loadActiveFaqsFailure = createAction('[Faq] Load Active Failure', props<Err>());

export const addFaq = createAction('[Faq] Add', props<Data>());
export const addFaqSuccess = createAction('[Faq] Add Success', props<Res<Faq>>());
export const addFaqFailure = createAction('[Faq] Add Failure', props<Err>());

export const updateFaq = createAction('[Faq] Update', props<Data>());
export const updateFaqSuccess = createAction('[Faq] Update Success', props<Res<Faq>>());
export const updateFaqFailure = createAction('[Faq] Update Failure', props<Err>());

export const updateFaqStatus = createAction('[Faq] Update Status', props<Id>());
export const updateFaqStatusSuccess = createAction('[Faq] Update Status Success', props<Res<Faq>>());
export const updateFaqStatusFailure = createAction('[Faq] Update Status Failure', props<Err>());

export const deleteFaq = createAction('[Faq] Delete', props<Id>());
export const deleteFaqSuccess = createAction('[Faq] Delete Success', props<Id>());
export const deleteFaqFailure = createAction('[Faq] Delete Failure', props<Err>());
