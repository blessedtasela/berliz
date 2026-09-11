import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Booking } from 'src/app/models/booking.model';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { ReviewBookingModalComponent } from '../review-booking-modal/review-booking-modal.component';

@Component({
  selector: 'app-booking-card',
  templateUrl: './booking-card.component.html',
  styleUrls: ['./booking-card.component.css']
})
export class BookingCardComponent {

  constructor(private dialog: MatDialog) { }

  /** 'client' shows who you booked with + a cancel action while pending.
   *  'provider' shows who booked you + confirm/complete/cancel actions. */
  @Input() mode: 'client' | 'provider' = 'client';
  @Input() booking!: Booking;

  @Output() cancelRequested = new EventEmitter<number>();
  @Output() statusChangeRequested = new EventEmitter<{ id: number; status: string }>();
  @Output() startIntakeRequested = new EventEmitter<{ clientId: number; clientName: string }>();

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

  get statusClasses(): string {
    switch (this.booking.status) {
      case 'confirmed': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'completed': return 'bg-green-50 text-green-700 border border-green-100';
      case 'cancelled': return 'bg-gray-100 text-gray-500 border border-gray-200';
      default: return 'bg-amber-50 text-amber-700 border border-amber-100'; // pending
    }
  }

  get dotClasses(): string {
    switch (this.booking.status) {
      case 'confirmed': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-gray-400';
      default: return 'bg-amber-500';
    }
  }

  get canClientCancel(): boolean {
    return this.mode === 'client' && this.booking.status === 'pending';
  }

  get canProviderConfirm(): boolean {
    return this.mode === 'provider' && this.booking.status === 'pending';
  }

  get canProviderComplete(): boolean {
    return this.mode === 'provider' && this.booking.status === 'confirmed';
  }

  get canProviderCancel(): boolean {
    return this.mode === 'provider' && (this.booking.status === 'pending' || this.booking.status === 'confirmed');
  }

  /** A trainer can start (or revisit) an intake once they've actually taken the client on. */
  get canStartIntake(): boolean {
    return this.mode === 'provider' && (this.booking.status === 'confirmed' || this.booking.status === 'completed');
  }

  /** Client cancelling their own pending request -- a confirm step guards against an accidental tap. */
  cancel(): void {
    this.dialog.open(PromptModalComponent, {
      width: '360px',
      maxWidth: '95vw',
      data: {
        confirmation: true,
        title: 'Cancel this booking?',
        message: 'This request will be withdrawn. You can always send a new one.',
        confirmText: 'Cancel booking',
        cancelText: 'Keep it',
        icon: 'x-circle'
      }
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) this.cancelRequested.emit(this.booking.id);
    });
  }

  /** Provider cancelling a pending/confirmed booking -- same accidental-tap guard as the client side. */
  private confirmProviderCancel(): void {
    this.dialog.open(PromptModalComponent, {
      width: '360px',
      maxWidth: '95vw',
      data: {
        confirmation: true,
        title: 'Cancel this session?',
        message: `${this.counterpartyName} will be notified this session is no longer happening.`,
        confirmText: 'Cancel session',
        cancelText: 'Keep it',
        icon: 'x-circle'
      }
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) this.statusChangeRequested.emit({ id: this.booking.id, status: 'cancelled' });
    });
  }

  /** A pending request opens for review (who it's from, when, notes) before the provider decides. */
  private reviewAndConfirm(): void {
    this.dialog.open(ReviewBookingModalComponent, {
      width: '400px',
      maxWidth: '95vw',
      data: { booking: this.booking }
    }).afterClosed().subscribe((decision: 'confirmed' | 'declined' | undefined) => {
      if (decision === 'confirmed') this.statusChangeRequested.emit({ id: this.booking.id, status: 'confirmed' });
      else if (decision === 'declined') this.statusChangeRequested.emit({ id: this.booking.id, status: 'cancelled' });
    });
  }

  setStatus(status: string): void {
    if (this.mode === 'provider' && status === 'cancelled') {
      this.confirmProviderCancel();
      return;
    }
    if (this.mode === 'provider' && status === 'confirmed') {
      this.reviewAndConfirm();
      return;
    }
    this.statusChangeRequested.emit({ id: this.booking.id, status });
  }

  startIntake(): void {
    this.startIntakeRequested.emit({ clientId: this.booking.clientId, clientName: this.counterpartyName });
  }
}
