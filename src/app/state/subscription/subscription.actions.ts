import { createAction, props } from '@ngrx/store';
import { Subscriptions } from '../../models/subscriptions.interface';

type Err  = { error: string };
type Id   = { id: number };
type Data = { data: any };

export const loadSubscriptions = createAction('[Subscription] Load All');
export const loadSubscriptionsSuccess = createAction('[Subscription] Load All Success', props<{ data: Subscriptions[] }>());
export const loadSubscriptionsFailure = createAction('[Subscription] Load All Failure', props<Err>());

export const loadActiveSubscriptions = createAction('[Subscription] Load Active');
export const loadActiveSubscriptionsSuccess = createAction('[Subscription] Load Active Success', props<{ data: Subscriptions[] }>());
export const loadActiveSubscriptionsFailure = createAction('[Subscription] Load Active Failure', props<Err>());

export const loadMySubscriptions = createAction('[Subscription] Load Mine');
export const loadMySubscriptionsSuccess = createAction('[Subscription] Load Mine Success', props<{ data: Subscriptions[] }>());
export const loadMySubscriptionsFailure = createAction('[Subscription] Load Mine Failure', props<Err>());

export const loadSubscription = createAction('[Subscription] Load By Id', props<Id>());
export const loadSubscriptionSuccess = createAction('[Subscription] Load By Id Success', props<{ data: Subscriptions }>());
export const loadSubscriptionFailure = createAction('[Subscription] Load By Id Failure', props<Err>());

export const addSubscription = createAction('[Subscription] Add', props<Data>());
export const addSubscriptionSuccess = createAction('[Subscription] Add Success', props<{ message: string }>());
export const addSubscriptionFailure = createAction('[Subscription] Add Failure', props<Err>());

export const updateSubscription = createAction('[Subscription] Update', props<Data>());
export const updateSubscriptionSuccess = createAction('[Subscription] Update Success', props<{ message: string }>());
export const updateSubscriptionFailure = createAction('[Subscription] Update Failure', props<Err>());

export const updateSubscriptionStatus = createAction('[Subscription] Update Status', props<Id>());
export const updateSubscriptionStatusSuccess = createAction('[Subscription] Update Status Success', props<{ message: string }>());
export const updateSubscriptionStatusFailure = createAction('[Subscription] Update Status Failure', props<Err>());

export const deleteSubscription = createAction('[Subscription] Delete', props<Id>());
export const deleteSubscriptionSuccess = createAction('[Subscription] Delete Success', props<{ message: string }>());
export const deleteSubscriptionFailure = createAction('[Subscription] Delete Failure', props<Err>());

export const bulkActionSubscription = createAction('[Subscription] Bulk Action', props<Data>());
export const bulkActionSubscriptionSuccess = createAction('[Subscription] Bulk Action Success', props<{ message: string }>());
export const bulkActionSubscriptionFailure = createAction('[Subscription] Bulk Action Failure', props<Err>());
