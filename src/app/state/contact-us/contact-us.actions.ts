import { createAction, props } from '@ngrx/store';
import { ContactUs, ContactUsMessage } from '../../models/contact-us.model';

type Err  = { error: string };
type Id   = { id: number };
type Data = { data: any };

export const loadContactUs = createAction('[ContactUs] Load All');
export const loadContactUsSuccess = createAction('[ContactUs] Load All Success', props<{ data: ContactUs[] }>());
export const loadContactUsFailure = createAction('[ContactUs] Load All Failure', props<Err>());

export const loadContactUsMessages = createAction('[ContactUs] Load Messages');
export const loadContactUsMessagesSuccess = createAction('[ContactUs] Load Messages Success', props<{ data: ContactUsMessage[] }>());
export const loadContactUsMessagesFailure = createAction('[ContactUs] Load Messages Failure', props<Err>());

export const addContactUs = createAction('[ContactUs] Add', props<Data>());
export const addContactUsSuccess = createAction('[ContactUs] Add Success', props<{ message: string }>());
export const addContactUsFailure = createAction('[ContactUs] Add Failure', props<Err>());

export const updateContactUs = createAction('[ContactUs] Update', props<Data>());
export const updateContactUsSuccess = createAction('[ContactUs] Update Success', props<{ message: string }>());
export const updateContactUsFailure = createAction('[ContactUs] Update Failure', props<Err>());

export const updateContactUsStatus = createAction('[ContactUs] Update Status', props<Id>());
export const updateContactUsStatusSuccess = createAction('[ContactUs] Update Status Success', props<{ message: string }>());
export const updateContactUsStatusFailure = createAction('[ContactUs] Update Status Failure', props<Err>());

export const reviewContactUs = createAction('[ContactUs] Review', props<Data>());
export const reviewContactUsSuccess = createAction('[ContactUs] Review Success', props<{ message: string }>());
export const reviewContactUsFailure = createAction('[ContactUs] Review Failure', props<Err>());

export const deleteContactUs = createAction('[ContactUs] Delete', props<Id>());
export const deleteContactUsSuccess = createAction('[ContactUs] Delete Success', props<{ message: string }>());
export const deleteContactUsFailure = createAction('[ContactUs] Delete Failure', props<Err>());
