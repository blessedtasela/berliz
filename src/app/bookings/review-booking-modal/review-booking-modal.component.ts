import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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

  get clientProfileUrl(): string | null {
    return this.booking.clientUsername ? `/user/${this.booking.clientUsername}` : null;
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
