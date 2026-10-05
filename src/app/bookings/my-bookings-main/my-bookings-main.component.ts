import { Component, OnDestroy, OnInit } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { Booking } from 'src/app/models/booking.model';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StripeService } from 'src/app/services/stripe.service';

import {
  cancelBooking,
  cancelBookingFailure,
  cancelBookingSuccess,
  loadMyBookings
} from 'src/app/state/booking/booking.actions';
import { selectMyBookings } from 'src/app/state/booking/booking.selectors';

import { genericError } from 'src/validators/form-validators.module';

/**
 * Client-facing "My Bookings" page — every session the current user has
 * requested with a trainer or a center, grouped by status.
 * Mirrors the my-subscriptions grouping (active / due / expired) pattern.
 */
@Component({
    selector: 'app-my-bookings-main',
    templateUrl: './my-bookings-main.component.html',
    styleUrls: ['./my-bookings-main.component.css'],
    standalone: false
})
export class MyBookingsMainComponent implements OnInit, OnDestroy {

  bookings: Booking[] = [];
  loading = false;
  /** The booking whose Stripe Checkout is being created, so its Pay button can't be double-tapped. */
  payingBookingId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private actions$: Actions,
    private snackBar: SnackBarService,
    private stripeService: StripeService,
  ) { }

  ngOnInit(): void {
    this.store.select(selectMyBookings)
      .pipe(takeUntil(this.destroy$))
      .subscribe(bookings => {
        this.bookings = bookings ?? [];
        this.loading = false;
      });
    this.loadBookings();

    this.actions$
      .pipe(ofType(cancelBookingSuccess), takeUntil(this.destroy$))
      .subscribe(({ response }) => {
        this.snackBar.openSnackBar(response?.message || 'Booking cancelled', '');
      });

    this.actions$
      .pipe(ofType(cancelBookingFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => {
        this.snackBar.openSnackBar(error || genericError, 'error');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBookings(): void {
    this.loading = true;
    this.store.dispatch(loadMyBookings());
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

  get noShow(): Booking[] {
    return this.bookings.filter(b => b.status === 'no_show');
  }

  /** Starts Stripe Checkout for a confirmed session; the amount is whatever the server priced the booking at. */
  onPayRequested(id: number): void {
    if (this.payingBookingId !== null) return;
    this.payingBookingId = id;
    this.stripeService.createBookingCheckout(id).subscribe({
      next: (res) => {
        const url = res?.data?.checkoutUrl;
        if (!url) {
          this.payingBookingId = null;
          this.snackBar.openSnackBar(res?.message || genericError, 'error');
          return;
        }
        this.redirect(url);
      },
      error: (err) => {
        this.payingBookingId = null;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
      },
    });
  }

  /** A real browser navigation (Stripe's page is off-site); its own method so tests can stub it. */
  protected redirect(url: string): void {
    window.location.href = url;
  }

  /** The card has already asked "Cancel this booking?" -- including the refund the client will get for a paid session -- so this goes straight to the server rather than asking a second, less informed time. */
  onCancelRequested(id: number): void {
    this.store.dispatch(cancelBooking({ id }));
  }
}
