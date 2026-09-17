import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { Booking } from 'src/app/models/booking.model';
import { memoizePhotoUri } from 'src/app/shared/photo-lightbox/photo-data-uri';

export interface ReviewBookingModalData {
  booking: Booking;
}

/**
 * A trainer/center reviews a pending booking request -- who it's from, when,
 * and any notes -- before deciding, rather than a bare one-tap Confirm next
 * to a name. Closes with 'confirmed' | 'declined' | undefined (dismissed
 * without deciding).
 */
@Component({
  selector: 'app-review-booking-modal',
  templateUrl: './review-booking-modal.component.html',
  styleUrls: ['./review-booking-modal.component.css']
})
export class ReviewBookingModalComponent {

  booking: Booking;
  private readonly _uri = memoizePhotoUri();

  constructor(
    public dialogRef: MatDialogRef<ReviewBookingModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReviewBookingModalData,
    private router: Router,
  ) {
    this.booking = data.booking;
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
    this.dialogRef.close('declined');
  }

  confirm(): void {
    this.dialogRef.close('confirmed');
  }

  close(): void {
    this.dialogRef.close(undefined);
  }
}
