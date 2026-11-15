import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';

import { Booking } from 'src/app/models/booking.model';
import { BookingService } from 'src/app/services/booking.service';

export interface SettleBookingModalData {
  booking: Booking;
}

/**
 * BK-44: the client already paid the provider directly (cash/e-transfer/other) -- settle the
 * booking here instead of letting it sit unpaid until BK-38's auto-cancel. "Pay by card on the
 * client's behalf" is a later addition; only "client paid me directly" is built.
 */
@Component({
    selector: 'app-settle-booking-modal',
    templateUrl: './settle-booking-modal.component.html',
    styleUrls: ['./settle-booking-modal.component.css'],
    standalone: false
})
export class SettleBookingModalComponent {

  booking: Booking;
  amount: number | null;
  channel: 'CASH' | 'E_TRANSFER' | 'OTHER' | null = null;
  note = '';
  saving = false;
  error: string | null = null;

  readonly channelOptions: { value: 'CASH' | 'E_TRANSFER' | 'OTHER'; label: string }[] = [
    { value: 'CASH', label: 'Cash' },
    { value: 'E_TRANSFER', label: 'E-transfer' },
    { value: 'OTHER', label: 'Other' },
  ];

  constructor(
    public dialogRef: MatDialogRef<SettleBookingModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SettleBookingModalData,
    private bookingService: BookingService,
  ) {
    this.booking = data.booking;
    this.amount = this.booking.amountDue ?? null;
  }

  get canSubmit(): boolean {
    return !this.saving && !!this.amount && this.amount > 0 && !!this.channel;
  }

  submit(): void {
    if (!this.canSubmit || !this.channel || !this.amount) return;
    this.saving = true;
    this.error = null;
    this.bookingService.settleBooking(this.booking.id, {
      mode: 'DIRECT',
      amount: this.amount,
      channel: this.channel,
      note: this.note.trim() || undefined,
    }).pipe(take(1)).subscribe({
      next: res => {
        this.saving = false;
        this.dialogRef.close(res?.data ?? true);
      },
      error: err => {
        this.saving = false;
        this.error = err?.error?.message || 'Could not settle this booking. Try again.';
      },
    });
  }

  close(): void {
    this.dialogRef.close(undefined);
  }
}
