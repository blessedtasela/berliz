import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BookingState } from './booking.state';
import { bookingFeatureKey } from './booking.reducer';

const selectState = createFeatureSelector<BookingState>(bookingFeatureKey);

export const selectBookingLoading = createSelector(selectState, s => s.loading);
export const selectBookingError = createSelector(selectState, s => s.error);

export const selectBookings = createSelector(selectState, s => s.bookings);
export const selectMyBookings = createSelector(selectState, s => s.myBookings);
export const selectProviderBookings = createSelector(selectState, s => s.providerBookings);
export const selectSelectedBooking = createSelector(selectState, s => s.selectedBooking);

export const selectMyTrainers = createSelector(selectState, s => s.myTrainers);
export const selectMyTrainersLoading = createSelector(selectState, s => s.myTrainersLoading);

/** Trainer-type entries only — the pick-list for granting progress-share access. */
export const selectMyTrainersOnly = createSelector(
  selectMyTrainers,
  trainers => trainers.filter(t => t.type === 'trainer')
);
