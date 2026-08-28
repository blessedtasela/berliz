import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { Booking } from 'src/app/models/booking.model';
import { SnackBarService } from 'src/app/services/snack-bar.service';

import {
  loadMyProviderBookings,
  updateBookingStatus,
  updateBookingStatusFailure,
  updateBookingStatusSuccess
} from 'src/app/state/booking/booking.actions';
import { selectBookingLoading, selectProviderBookings } from 'src/app/state/booking/booking.selectors';

import { genericError } from 'src/validators/form-validators.module';

/**
 * Trainer/Center-facing "Bookings" page — every session a client has
 * requested with the current trainer/center, with confirm/complete/cancel
 * actions. Backend resolves which (trainer vs center) from the JWT role.
 */
@Component({
  selector: 'app-provider-bookings-main',
  templateUrl: './provider-bookings-main.component.html',
  styleUrls: ['./provider-bookings-main.component.css']
})
export class ProviderBookingsMainComponent implements OnInit, OnDestroy {

  activeTab: 'bookings' | 'availability' | 'earnings' = 'bookings';

  bookings: Booking[] = [];
  loading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private actions$: Actions,
    private snackBar: SnackBarService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.store.dispatch(loadMyProviderBookings());
    this.store.select(selectProviderBookings)
      .pipe(takeUntil(this.destroy$))
      .subscribe(bookings => this.bookings = bookings ?? []);
    this.store.select(selectBookingLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.actions$
      .pipe(ofType(updateBookingStatusSuccess), takeUntil(this.destroy$))
      .subscribe(({ response }) => {
        this.snackBar.openSnackBar(response?.message || 'Booking updated', '');
      });

    this.actions$
      .pipe(ofType(updateBookingStatusFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => {
        this.snackBar.openSnackBar(error || genericError, 'error');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get pending(): Booking[] {
    return this.bookings.filter(b => b.status === 'pending');
  }

  get confirmed(): Booking[] {
    return this.bookings.filter(b => b.status === 'confirmed');
  }

  get completed(): Booking[] {
    return this.bookings.filter(b => b.status === 'completed');
  }

  get cancelled(): Booking[] {
    return this.bookings.filter(b => b.status === 'cancelled');
  }

  refresh(): void {
    this.store.dispatch(loadMyProviderBookings());
  }

  onStatusChangeRequested(event: { id: number; status: string }): void {
    this.store.dispatch(updateBookingStatus(event));
  }

  onStartIntakeRequested(event: { clientId: number; clientName: string }): void {
    this.router.navigate(['/client-intake/new', event.clientId], {
      queryParams: { clientName: event.clientName }
    });
  }
}
