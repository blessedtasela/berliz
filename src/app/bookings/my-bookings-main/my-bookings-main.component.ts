import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { Booking } from 'src/app/models/booking.model';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

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
  styleUrls: ['./my-bookings-main.component.css']
})
export class MyBookingsMainComponent implements OnInit, OnDestroy {

  bookings: Booking[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private actions$: Actions,
    private dialog: MatDialog,
    private snackBar: SnackBarService,
  ) { }

  ngOnInit(): void {
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

  private loadBookings(): void {
    this.store.dispatch(loadMyBookings());
    this.store.select(selectMyBookings)
      .pipe(takeUntil(this.destroy$))
      .subscribe(bookings => this.bookings = bookings ?? []);
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

  onCancelRequested(id: number): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'cancel this booking?',
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.store.dispatch(cancelBooking({ id }));
      dialogRef.close();
    });
  }
}
