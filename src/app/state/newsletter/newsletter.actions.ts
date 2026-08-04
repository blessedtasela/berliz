import { createAction, props } from '@ngrx/store';
import { Newsletter, NewsletterMessage } from '../../models/newsletter.model';

type Err  = { error: string };
type Id   = { id: number };
type Data = { data: any };

export const loadNewsletters = createAction('[Newsletter] Load All');
export const loadNewslettersSuccess = createAction('[Newsletter] Load All Success', props<{ data: Newsletter[] }>());
export const loadNewslettersFailure = createAction('[Newsletter] Load All Failure', props<Err>());

export const loadActiveNewsletters = createAction('[Newsletter] Load Active');
export const loadActiveNewslettersSuccess = createAction('[Newsletter] Load Active Success', props<{ data: Newsletter[] }>());
export const loadActiveNewslettersFailure = createAction('[Newsletter] Load Active Failure', props<Err>());

export const loadNewsletterMessages = createAction('[Newsletter] Load Messages');
export const loadNewsletterMessagesSuccess = createAction('[Newsletter] Load Messages Success', props<{ data: NewsletterMessage[] }>());
export const loadNewsletterMessagesFailure = createAction('[Newsletter] Load Messages Failure', props<Err>());

export const addNewsletter = createAction('[Newsletter] Add', props<Data>());
export const addNewsletterSuccess = createAction('[Newsletter] Add Success', props<{ message: string }>());
export const addNewsletterFailure = createAction('[Newsletter] Add Failure', props<Err>());

export const updateNewsletter = createAction('[Newsletter] Update', props<Data>());
export const updateNewsletterSuccess = createAction('[Newsletter] Update Success', props<{ message: string }>());
export const updateNewsletterFailure = createAction('[Newsletter] Update Failure', props<Err>());

export const updateNewsletterStatus = createAction('[Newsletter] Update Status', props<Id>());
export const updateNewsletterStatusSuccess = createAction('[Newsletter] Update Status Success', props<{ message: string }>());
export const updateNewsletterStatusFailure = createAction('[Newsletter] Update Status Failure', props<Err>());

export const deleteNewsletter = createAction('[Newsletter] Delete', props<Id>());
export const deleteNewsletterSuccess = createAction('[Newsletter] Delete Success', props<{ message: string }>());
export const deleteNewsletterFailure = createAction('[Newsletter] Delete Failure', props<Err>());

export const sendNewsletterMessage = createAction('[Newsletter] Send Message', props<Data>());
export const sendNewsletterMessageSuccess = createAction('[Newsletter] Send Message Success', props<{ message: string }>());
export const sendNewsletterMessageFailure = createAction('[Newsletter] Send Message Failure', props<Err>());

export const sendNewsletterBulkMessage = createAction('[Newsletter] Send Bulk Message', props<Data>());
export const sendNewsletterBulkMessageSuccess = createAction('[Newsletter] Send Bulk Message Success', props<{ message: string }>());
export const sendNewsletterBulkMessageFailure = createAction('[Newsletter] Send Bulk Message Failure', props<Err>());
