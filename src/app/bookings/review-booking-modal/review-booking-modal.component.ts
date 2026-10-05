import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { Booking } from 'src/app/models/booking.model';
import { memoizePhotoUri } from 'src/app/shared/photo-lightbox/photo-data-uri';

export interface ReviewBookingModalData {
  booking: Booking;
}

export type ReviewBookingModalResult =
  | { decision: 'confirmed' }
  | { decision: 'declined' }
  | { decision: 'rescheduled'; localDate: string; localTime: string; durationMinutes: number };

/**
 * A trainer/center reviews a pending booking request -- who it's from, when,
 * and any notes -- before deciding, rather than a bare one-tap Confirm next
 * to a name. An urgent request (see BookingService.createUrgentBooking) also
 * offers "Reschedule" -- picking a different time confirms the booking at
 * that new time in one step, the other half of "approve or reschedule with
 * one click". Closes with a ReviewBookingModalResult, or undefined if
 * dismissed without deciding.
 */
@Component({
    selector: 'app-review-booking-modal',
    templateUrl: './review-booking-modal.component.html',
    styleUrls: ['./review-booking-modal.component.css'],
    standalone: false
})
export class ReviewBookingModalComponent {

  booking: Booking;
  private readonly _uri = memoizePhotoUri();

  rescheduling = false;
  readonly durationOptions = [30, 45, 60, 90, 120];
  rescheduleDate: string;
  rescheduleTime = '';
  rescheduleDuration: number;

  constructor(
    public dialogRef: MatDialogRef<ReviewBookingModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReviewBookingModalData,
    private router: Router,
  ) {
    this.booking = data.booking;
    this.rescheduleDate = this.formatDateLocal(new Date(this.booking.scheduledAt));
    this.rescheduleDuration = this.booking.durationMinutes ?? 60;
  }

  private formatDateLocal(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  toggleReschedule(): void {
    this.rescheduling = !this.rescheduling;
  }

  get clientName(): string {
    return `${this.booking.clientFirstname ?? ''} ${this.booking.clientLastname ?? ''}`.trim()
      || this.booking.clientEmail || 'This client';
  }

  get clientPhotoSrc(): string | null {
    return this._uri(this.booking.clientPhoto);
  }

  get hasClientProfile(): boolean {
    return !!this.booking.clientUsername;
  }

  /** Stays in the protected dashboard layout (sidebar/top bar) -- the public
   *  /user/:username page would otherwise take an already-signed-in trainer
   *  out of the app entirely. Closes with no decision (undefined) rather than
   *  declining/cancelling the request -- they're just stepping away to look,
   *  the request is still there to review when they come back. */
  viewClientProfile(): void {
    if (!this.booking.clientUsername) return;
    this.dialogRef.close(undefined);
    this.router.navigate(['/dashboard/user', this.booking.clientUsername]);
  }

  decline(): void {
    this.dialogRef.close({ decision: 'declined' } as ReviewBookingModalResult);
  }

  confirm(): void {
    this.dialogRef.close({ decision: 'confirmed' } as ReviewBookingModalResult);
  }

  confirmReschedule(): void {
    if (!this.rescheduleDate || !this.rescheduleTime) return;
    this.dialogRef.close({
      decision: 'rescheduled',
      localDate: this.rescheduleDate,
      localTime: this.rescheduleTime,
      durationMinutes: this.rescheduleDuration,
    } as ReviewBookingModalResult);
  }

  close(): void {
    this.dialogRef.close(undefined);
  }
}
