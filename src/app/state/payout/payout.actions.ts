import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import { Payout } from '../../models/payout.model';

type Res<T> = { response: ApiResponse<T> };
type Err = { error: string };
type Id = { id: number };

export const loadMyPayouts = createAction('[Payout] Load Mine');
export const loadMyPayoutsSuccess = createAction('[Payout] Load Mine Success', props<Res<Payout[]>>());
export const loadMyPayoutsFailure = createAction('[Payout] Load Mine Failure', props<Err>());

export const loadAllPayouts = createAction('[Payout] Load All');
export const loadAllPayoutsSuccess = createAction('[Payout] Load All Success', props<Res<Payout[]>>());
export const loadAllPayoutsFailure = createAction('[Payout] Load All Failure', props<Err>());

export const payOutViaStripe = createAction('[Payout] Pay Via Stripe', props<Id>());
export const payOutViaStripeSuccess = createAction('[Payout] Pay Via Stripe Success', props<Res<Payout>>());
export const payOutViaStripeFailure = createAction('[Payout] Pay Via Stripe Failure', props<Err>());

/** Admin only — PY-24: recompute a not-yet-paid-out payout from the booking's real amountPaid. */
export const recalculatePayout = createAction('[Payout] Recalculate', props<{ bookingId: number }>());
export const recalculatePayoutSuccess = createAction('[Payout] Recalculate Success', props<Res<Payout>>());
export const recalculatePayoutFailure = createAction('[Payout] Recalculate Failure', props<Err>());
