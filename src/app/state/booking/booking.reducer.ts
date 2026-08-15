import { createReducer, on } from '@ngrx/store';
import * as A from './booking.actions';
import { initialBookingState } from './booking.state';

export const bookingFeatureKey = 'booking';

function upsert<T extends { id?: any }>(list: T[], item: T): T[] {
  if (!item) return list;
  const idx = list.findIndex(x => x.id === item.id);
  return idx >= 0
    ? [...list.slice(0, idx), item, ...list.slice(idx + 1)]
    : [...list, item];
}

export const bookingReducer = createReducer(
  initialBookingState,

  on(
    A.createBooking, A.loadMyBookings, A.loadMyProviderBookings, A.loadAllBookings,
    A.loadBooking, A.updateBookingStatus, A.cancelBooking,
    state => ({ ...state, loading: true, error: null })
  ),

  on(
    A.createBookingFailure, A.loadMyBookingsFailure, A.loadMyProviderBookingsFailure,
    A.loadAllBookingsFailure, A.loadBookingFailure, A.updateBookingStatusFailure, A.cancelBookingFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  on(A.createBookingSuccess, (s, { response }) => ({
    ...s, loading: false,
    myBookings: response.data ? [...s.myBookings, response.data] : s.myBookings,
  })),

  on(A.loadMyBookingsSuccess, (s, { response }) => ({
    ...s, loading: false, myBookings: response.data ?? []
  })),

  on(A.loadMyProviderBookingsSuccess, (s, { response }) => ({
    ...s, loading: false, providerBookings: response.data ?? []
  })),

  on(A.loadAllBookingsSuccess, (s, { response }) => ({
    ...s, loading: false, bookings: response.data ?? []
  })),

  on(A.loadBookingSuccess, (s, { response }) => ({
    ...s, loading: false, selectedBooking: response.data ?? null
  })),

  on(A.updateBookingStatusSuccess, A.cancelBookingSuccess, (s, { response }) => ({
    ...s, loading: false,
    selectedBooking: response.data ?? s.selectedBooking,
    bookings: response.data ? upsert(s.bookings, response.data) : s.bookings,
    myBookings: response.data ? upsert(s.myBookings, response.data) : s.myBookings,
    providerBookings: response.data ? upsert(s.providerBookings, response.data) : s.providerBookings,
  })),

  on(A.loadMyTrainers, state => ({ ...state, myTrainersLoading: true, error: null })),

  on(A.loadMyTrainersSuccess, (s, { response }) => ({
    ...s, myTrainersLoading: false, myTrainers: response.data ?? []
  })),

  on(A.loadMyTrainersFailure, (s, { error }) => ({
    ...s, myTrainersLoading: false, error
  })),
);
