import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import { Payments } from '../../models/payment.interface';

type Res<T> = { response: ApiResponse<T> };
type Err = { error: string };
type Id = { id: number };
type Data = { data: any };

export const loadPayments = createAction('[Payment] Load All');
export const loadPaymentsSuccess = createAction('[Payment] Load All Success', props<Res<Payments[]>>());
export const loadPaymentsFailure = createAction('[Payment] Load All Failure', props<Err>());

export const loadActivePayments = createAction('[Payment] Load Active');
export const loadActivePaymentsSuccess = createAction('[Payment] Load Active Success', props<Res<Payments[]>>());
export const loadActivePaymentsFailure = createAction('[Payment] Load Active Failure', props<Err>());

export const loadMyPayments = createAction('[Payment] Load My Payments');
export const loadMyPaymentsSuccess = createAction('[Payment] Load My Payments Success', props<Res<Payments[]>>());
export const loadMyPaymentsFailure = createAction('[Payment] Load My Payments Failure', props<Err>());

export const loadPayment = createAction('[Payment] Load By Id', props<Id>());
export const loadPaymentSuccess = createAction('[Payment] Load By Id Success', props<Res<Payments>>());
export const loadPaymentFailure = createAction('[Payment] Load By Id Failure', props<Err>());

export const addPayment = createAction('[Payment] Add', props<Data>());
export const addPaymentSuccess = createAction('[Payment] Add Success', props<Res<Payments>>());
export const addPaymentFailure = createAction('[Payment] Add Failure', props<Err>());

export const updatePayment = createAction('[Payment] Update', props<Data>());
export const updatePaymentSuccess = createAction('[Payment] Update Success', props<Res<Payments>>());
export const updatePaymentFailure = createAction('[Payment] Update Failure', props<Err>());

export const updatePaymentStatus = createAction('[Payment] Update Status', props<Id>());
export const updatePaymentStatusSuccess = createAction('[Payment] Update Status Success', props<Res<Payments>>());
export const updatePaymentStatusFailure = createAction('[Payment] Update Status Failure', props<Err>());

export const deletePayment = createAction('[Payment] Delete', props<Id>());
export const deletePaymentSuccess = createAction('[Payment] Delete Success', props<Id>());
export const deletePaymentFailure = createAction('[Payment] Delete Failure', props<Err>());
