import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import * as A from './booking.actions';

@Injectable()
export class BookingEffects {

  constructor(
    private actions$: Actions,
    private svc: BookingService,
  ) { }

  createBooking$ = createEffect(() => this.actions$.pipe(
    ofType(A.createBooking),
    mergeMap(({ data }) => this.svc.createBooking(data).pipe(
      map(response => A.createBookingSuccess({ response })),
      catchError(e => of(A.createBookingFailure({ error: e?.error?.message || 'Failed to create booking' })))
    ))
  ));

  loadMyBookings$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyBookings),
    mergeMap(() => this.svc.getMyBookings().pipe(
      map(response => A.loadMyBookingsSuccess({ response })),
      catchError(e => of(A.loadMyBookingsFailure({ error: e?.error?.message || 'Failed to load your bookings' })))
    ))
  ));

  loadMyProviderBookings$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyProviderBookings),
    mergeMap(() => this.svc.getMyProviderBookings().pipe(
      map(response => A.loadMyProviderBookingsSuccess({ response })),
      catchError(e => of(A.loadMyProviderBookingsFailure({ error: e?.error?.message || 'Failed to load bookings' })))
    ))
  ));

  loadAllBookings$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadAllBookings),
    mergeMap(() => this.svc.getAllBookings().pipe(
      map(response => A.loadAllBookingsSuccess({ response })),
      catchError(e => of(A.loadAllBookingsFailure({ error: e?.error?.message || 'Failed to load bookings' })))
    ))
  ));

  loadBooking$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadBooking),
    mergeMap(({ id }) => this.svc.getBooking(id).pipe(
      map(response => A.loadBookingSuccess({ response })),
      catchError(e => of(A.loadBookingFailure({ error: e?.error?.message || 'Failed to load booking' })))
    ))
  ));

  updateBookingStatus$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateBookingStatus),
    mergeMap(({ id, status }) => this.svc.updateStatus(id, status).pipe(
      map(response => A.updateBookingStatusSuccess({ response })),
      catchError(e => of(A.updateBookingStatusFailure({ error: e?.error?.message || 'Failed to update booking status' })))
    ))
  ));

  cancelBooking$ = createEffect(() => this.actions$.pipe(
    ofType(A.cancelBooking),
    mergeMap(({ id }) => this.svc.cancelBooking(id).pipe(
      map(response => A.cancelBookingSuccess({ response })),
      catchError(e => of(A.cancelBookingFailure({ error: e?.error?.message || 'Failed to cancel booking' })))
    ))
  ));
}
