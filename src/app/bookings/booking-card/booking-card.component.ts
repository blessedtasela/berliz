import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Booking } from 'src/app/models/booking.model';

@Component({
  selector: 'app-booking-card',
  templateUrl: './booking-card.component.html',
  styleUrls: ['./booking-card.component.css']
})
export class BookingCardComponent {

  /** 'client' shows who you booked with + a cancel action while pending.
   *  'provider' shows who booked you + confirm/complete/cancel actions. */
  @Input() mode: 'client' | 'provider' = 'client';
  @Input() booking!: Booking;

  @Output() cancelRequested = new EventEmitter<number>();
  @Output() statusChangeRequested = new EventEmitter<{ id: number; status: string }>();

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

  cancel(): void {
    this.cancelRequested.emit(this.booking.id);
  }

  setStatus(status: string): void {
    this.statusChangeRequested.emit({ id: this.booking.id, status });
  }
}
