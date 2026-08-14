import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import { Booking } from '../../models/booking.model';

type Res<T> = { response: ApiResponse<T> };
type Err = { error: string };
type Id = { id: number };
type Data = { data: any };
type Status = { id: number; status: string };

export const createBooking = createAction('[Booking] Create', props<Data>());
export const createBookingSuccess = createAction('[Booking] Create Success', props<Res<Booking>>());
export const createBookingFailure = createAction('[Booking] Create Failure', props<Err>());

export const loadMyBookings = createAction('[Booking] Load Mine');
export const loadMyBookingsSuccess = createAction('[Booking] Load Mine Success', props<Res<Booking[]>>());
export const loadMyBookingsFailure = createAction('[Booking] Load Mine Failure', props<Err>());

export const loadMyProviderBookings = createAction('[Booking] Load Provider');
export const loadMyProviderBookingsSuccess = createAction('[Booking] Load Provider Success', props<Res<Booking[]>>());
export const loadMyProviderBookingsFailure = createAction('[Booking] Load Provider Failure', props<Err>());

export const loadAllBookings = createAction('[Booking] Load All');
export const loadAllBookingsSuccess = createAction('[Booking] Load All Success', props<Res<Booking[]>>());
export const loadAllBookingsFailure = createAction('[Booking] Load All Failure', props<Err>());

export const loadBooking = createAction('[Booking] Load By Id', props<Id>());
export const loadBookingSuccess = createAction('[Booking] Load By Id Success', props<Res<Booking>>());
export const loadBookingFailure = createAction('[Booking] Load By Id Failure', props<Err>());

export const updateBookingStatus = createAction('[Booking] Update Status', props<Status>());
export const updateBookingStatusSuccess = createAction('[Booking] Update Status Success', props<Res<Booking>>());
export const updateBookingStatusFailure = createAction('[Booking] Update Status Failure', props<Err>());

export const cancelBooking = createAction('[Booking] Cancel', props<Id>());
export const cancelBookingSuccess = createAction('[Booking] Cancel Success', props<Res<Booking>>());
export const cancelBookingFailure = createAction('[Booking] Cancel Failure', props<Err>());
