import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { Booking } from 'src/app/models/booking.model';
import { memoizePhotoUri } from 'src/app/shared/photo-lightbox/photo-data-uri';
import { amountToPay, canClientPay, payByNote, payLabel, paymentBadge, statusLabel } from '../booking-payment.util';

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
      case 'confirmed': return 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900';
      case 'completed': return 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900';
      case 'cancelled': return 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
      case 'no_show': return 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900';
      default: return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900'; // pending
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

  get statusLabel(): string {
    return statusLabel(this.booking.status);
  }

  /** The client can pay right from the details; the card that opened this starts Stripe Checkout. */
  get canClientPay(): boolean {
    return canClientPay(this.booking, this.mode);
  }

  /** "Pay $115.00", or "Pay extra $50.00" when a paid session was extended. */
  get payButtonLabel(): string {
    return payLabel(this.booking);
  }

  /** What to say about payment, or null when there is nothing to say (never priced, nothing to pay, or still pending). */
  get paymentLabel(): string | null {
    return paymentBadge(this.booking, this.mode)?.label ?? null;
  }

  /** The amount that goes with {@link paymentLabel}: what is still owed while unpaid, otherwise what was paid / agreed. */
  get paymentAmount(): number | null {
    if (this.booking.paymentStatus === 'UNPAID') return amountToPay(this.booking) || null;
    return this.booking.amountPaid ?? this.booking.amountDue ?? null;
  }

  get payByText(): string | null {
    return payByNote(this.booking);
  }

  pay(): void {
    this.dialogRef.close('pay');
  }
}
