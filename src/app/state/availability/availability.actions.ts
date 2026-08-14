import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import { Availability, AvailabilityDay, AvailableSlotsResponse } from '../../models/availability.model';

type Res<T> = { response: ApiResponse<T> };
type Err = { error: string };

export const setMyAvailability = createAction('[Availability] Set Mine', props<{ days: AvailabilityDay[] }>());
export const setMyAvailabilitySuccess = createAction('[Availability] Set Mine Success', props<Res<Availability[]>>());
export const setMyAvailabilityFailure = createAction('[Availability] Set Mine Failure', props<Err>());

export const loadMyAvailability = createAction('[Availability] Load Mine');
export const loadMyAvailabilitySuccess = createAction('[Availability] Load Mine Success', props<Res<Availability[]>>());
export const loadMyAvailabilityFailure = createAction('[Availability] Load Mine Failure', props<Err>());

export const loadProviderAvailability = createAction(
  '[Availability] Load Provider',
  props<{ trainerId?: number; centerId?: number }>()
);
export const loadProviderAvailabilitySuccess = createAction('[Availability] Load Provider Success', props<Res<Availability[]>>());
export const loadProviderAvailabilityFailure = createAction('[Availability] Load Provider Failure', props<Err>());

export const loadAvailableSlots = createAction(
  '[Availability] Load Slots',
  props<{ trainerId?: number; centerId?: number; date: string }>()
);
export const loadAvailableSlotsSuccess = createAction('[Availability] Load Slots Success', props<Res<AvailableSlotsResponse>>());
export const loadAvailableSlotsFailure = createAction('[Availability] Load Slots Failure', props<Err>());

export const clearAvailableSlots = createAction('[Availability] Clear Slots');
