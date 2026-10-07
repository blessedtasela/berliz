import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, take } from 'rxjs';

import { Booking } from 'src/app/models/booking.model';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { BookingService } from 'src/app/services/booking.service';
import { RescheduleRequest } from '../booking-card/booking-card.component';
import { BookForClientModalComponent } from '../book-for-client-modal/book-for-client-modal.component';

import {
  deleteBooking,
  deleteBookingFailure,
  deleteBookingSuccess,
  loadMyProviderBookings,
  updateBookingStatus,
  updateBookingStatusFailure,
  updateBookingStatusSuccess
} from 'src/app/state/booking/booking.actions';
import { selectBookingError, selectBookingLoading, selectProviderBookings } from 'src/app/state/booking/booking.selectors';
import {
  createClientIntake,
  createClientIntakeFailure,
  createClientIntakeSuccess,
} from 'src/app/state/client-intake/client-intake.actions';

import { genericError } from 'src/validators/form-validators.module';

/**
 * Trainer/Center-facing "Bookings" page — every session a client has
 * requested with the current trainer/center, with confirm/complete/cancel
 * actions. Backend resolves which (trainer vs center) from the JWT role.
 */
@Component({
    selector: 'app-provider-bookings-main',
    templateUrl: './provider-bookings-main.component.html',
    styleUrls: ['./provider-bookings-main.component.css'],
    standalone: false
})
export class ProviderBookingsMainComponent implements OnInit, OnDestroy {

  activeTab: 'bookings' | 'availability' | 'earnings' = 'bookings';

  bookings: Booking[] = [];
  loading = false;
  /** Why loading the list failed, while there is nothing to show -- so a failed load is never mistaken for "no bookings yet". */
  loadError: string | null = null;

  /** ?payoutId=<id> from a notification deep link -- passed through to EarningsViewComponent, which scrolls to and highlights that row. */
  deepLinkPayoutId: number | null = null;

  /** ?payoutSetup=return|refresh — where Stripe sent the provider back to after payout onboarding. */
  payoutSetupReturn: 'return' | 'refresh' | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private actions$: Actions,
    private snackBar: SnackBarService,
    private bookingService: BookingService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    const rawSetup = this.route.snapshot.queryParamMap.get('payoutSetup');
    if (rawSetup === 'return' || rawSetup === 'refresh') {
      this.payoutSetupReturn = rawSetup;
      this.activeTab = 'earnings';
    }

    const rawPayoutId = this.route.snapshot.queryParamMap.get('payoutId');
    if (rawPayoutId) {
      this.deepLinkPayoutId = Number(rawPayoutId);
      this.activeTab = 'earnings';
    }

    this.store.dispatch(loadMyProviderBookings());
    this.store.select(selectProviderBookings)
      .pipe(takeUntil(this.destroy$))
      .subscribe(bookings => this.bookings = bookings ?? []);
    this.store.select(selectBookingLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.store.select(selectBookingError)
      .pipe(takeUntil(this.destroy$))
      .subscribe(e => this.loadError = e ?? null);

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

    this.actions$
      .pipe(ofType(deleteBookingSuccess), takeUntil(this.destroy$))
      .subscribe(({ response }) => {
        this.snackBar.openSnackBar(response?.message || 'Booking deleted', '');
      });

    this.actions$
      .pipe(ofType(deleteBookingFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => {
        this.snackBar.openSnackBar(error || genericError, 'error');
      });

    this.actions$
      .pipe(ofType(createClientIntakeSuccess), takeUntil(this.destroy$))
      .subscribe(() => {
        this.snackBar.openSnackBar('Intake form sent', '');
      });

    this.actions$
      .pipe(ofType(createClientIntakeFailure), takeUntil(this.destroy$))
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

  get noShow(): Booking[] {
    return this.bookings.filter(b => b.status === 'no_show');
  }

  refresh(): void {
    this.store.dispatch(loadMyProviderBookings());
  }

  onStatusChangeRequested(event: { id: number; status: string }): void {
    this.store.dispatch(updateBookingStatus(event));
  }

  /** Moves a pending (typically urgent) request to a new time and confirms it in one step. Plain service call, same as the lead-time/session-length settings elsewhere -- one lightweight action with no other state to coordinate with. */
  onRescheduleRequested(event: RescheduleRequest): void {
    this.bookingService.reschedule(event.id, {
      localDate: event.localDate,
      localTime: event.localTime,
      durationMinutes: event.durationMinutes,
    }).pipe(take(1)).subscribe({
      next: (res) => {
        this.snackBar.openSnackBar(res?.data?.message || res?.message || 'Booking rescheduled and confirmed', '');
        this.refresh();
      },
      error: (err) => {
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
      },
    });
  }

  onDeleteRequested(id: number): void {
    this.store.dispatch(deleteBooking({ id }));
  }

  onStartIntakeRequested(event: { clientId: number; clientName: string }): void {
    this.router.navigate(['/dashboard/client-intake/new', event.clientId], {
      queryParams: { clientName: event.clientName }
    });
  }

  onSendIntakeRequested(event: { clientId: number; clientName: string }): void {
    this.store.dispatch(createClientIntake({ data: { clientId: event.clientId } }));
  }

  /** Create a new, already-confirmed booking directly for one of this provider's own clients. */
  openBookForClient(): void {
    this.dialog.open(BookForClientModalComponent, {
      width: '400px',
      maxWidth: '95vw',
    }).afterClosed().subscribe((created: boolean | undefined) => {
      if (created) this.refresh();
    });
  }
}
