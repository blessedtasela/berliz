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
