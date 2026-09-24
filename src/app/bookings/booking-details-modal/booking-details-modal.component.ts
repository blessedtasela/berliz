import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { Booking } from 'src/app/models/booking.model';
import { memoizePhotoUri } from 'src/app/shared/photo-lightbox/photo-data-uri';

export interface BookingDetailsModalData {
  booking: Booking;
  /** 'client' shows the provider you booked with; 'provider' shows the client who booked you -- same convention as BookingCardComponent. */
  mode: 'client' | 'provider';
}

/**
 * Read-only "what's this booking about" view -- every status (pending,
 * confirmed, completed, cancelled) opens this on a card click; ReviewBookingModal
 * stays the separate confirm/decline flow for a still-pending request (opened
 * from its own "Review request" button, not from clicking the card).
 */
@Component({
  selector: 'app-booking-details-modal',
  templateUrl: './booking-details-modal.component.html',
  styleUrls: ['./booking-details-modal.component.css']
})
export class BookingDetailsModalComponent {

  booking: Booking;
  mode: 'client' | 'provider';
  private readonly _uri = memoizePhotoUri();

  constructor(
    public dialogRef: MatDialogRef<BookingDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BookingDetailsModalData,
    private router: Router,
  ) {
    this.booking = data.booking;
    this.mode = data.mode;
  }

  get counterpartyName(): string {
    if (this.mode === 'client') {
      return this.booking.trainerName || this.booking.centerName || 'Provider';
    }
    return `${this.booking.clientFirstname ?? ''} ${this.booking.clientLastname ?? ''}`.trim()
      || this.booking.clientEmail || 'Client';
  }

  get counterpartySubtitle(): string {
    if (this.mode === 'client') {
      return this.booking.trainerName ? 'Trainer' : 'Center';
    }
    return this.booking.clientEmail || '';
  }

  get counterpartyPhotoSrc(): string | null {
    return this.mode === 'provider' ? this._uri(this.booking.clientPhoto) : null;
  }

  /** Only the client side has a profile link today -- BookingCardComponent's
   *  counterpartyName for 'client' mode reads trainerName/centerName off the
   *  Booking itself, with no trainer/center id or username to link to yet. */
  get hasCounterpartyProfile(): boolean {
    return this.mode === 'provider' && !!this.booking.clientUsername;
  }

  get statusClasses(): string {
    switch (this.booking.status) {
      case 'confirmed': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'completed': return 'bg-green-50 text-green-700 border border-green-100';
      case 'cancelled': return 'bg-gray-100 text-gray-500 border border-gray-200';
      default: return 'bg-amber-50 text-amber-700 border border-amber-100'; // pending
    }
  }

  /** Same reasoning as ReviewBookingModal: stays in the protected dashboard
   *  layout rather than the public /user/:username page. */
  viewCounterpartyProfile(): void {
    if (!this.booking.clientUsername) return;
    this.dialogRef.close();
    this.router.navigate(['/dashboard/user', this.booking.clientUsername]);
  }

  close(): void {
    this.dialogRef.close();
  }
}
