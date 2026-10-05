import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { BookingCardComponent } from './booking-card.component';
import { Booking } from 'src/app/models/booking.model';
import { BookingDetailsModalComponent } from '../booking-details-modal/booking-details-modal.component';
import { ReviewBookingModalComponent } from '../review-booking-modal/review-booking-modal.component';

describe('BookingCardComponent', () => {
  let component: BookingCardComponent;
  let fixture: ComponentFixture<BookingCardComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    dialogSpy.open.and.returnValue({ afterClosed: () => ({ subscribe: () => { } }) } as any);

    TestBed.configureTestingModule({
      declarations: [BookingCardComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MatDialog, useValue: dialogSpy }
      ]
    });

    fixture = TestBed.createComponent(BookingCardComponent);
    component = fixture.componentInstance;
    component.booking = {
      id: 1,
      clientId: 1,
      clientFirstname: 'Jane',
      clientLastname: 'Doe',
      clientEmail: 'jane@example.com',
      trainerId: 2,
      trainerName: 'Trainer Name',
      centerId: null,
      centerName: null,
      scheduledAt: new Date(),
      durationMinutes: 60,
      status: 'pending',
      notes: ''
    } as Booking;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('payment', () => {
    beforeEach(() => {
      component.booking.status = 'confirmed';
      component.booking.paymentStatus = 'UNPAID';
      component.booking.amountDue = 115;
    });

    it('lets the client pay a confirmed, unpaid, priced session', () => {
      component.mode = 'client';
      expect(component.canClientPay).toBeTrue();
    });

    it('does not offer payment to the provider', () => {
      component.mode = 'provider';
      expect(component.canClientPay).toBeFalse();
    });

    it('does not offer payment while the request is still pending', () => {
      component.mode = 'client';
      component.booking.status = 'pending';
      expect(component.canClientPay).toBeFalse();
    });

    it('does not offer payment once paid, refunded or when nothing is owed', () => {
      component.mode = 'client';
      for (const status of ['PAID', 'REFUNDED', 'NOT_REQUIRED', null] as const) {
        component.booking.paymentStatus = status;
        expect(component.canClientPay).withContext(String(status)).toBeFalse();
      }
      component.booking.paymentStatus = 'UNPAID';
      component.booking.amountDue = 0;
      expect(component.canClientPay).toBeFalse();
    });

    it('emits payRequested with the booking id', () => {
      const emitted: number[] = [];
      component.payRequested.subscribe((id: number) => emitted.push(id));
      component.pay();
      expect(emitted).toEqual([1]);
    });

    it('labels the badge differently for each side', () => {
      component.mode = 'client';
      expect(component.paymentBadge?.label).toBe('Payment due');
      component.mode = 'provider';
      expect(component.paymentBadge?.label).toBe('Awaiting payment');
      component.booking.paymentStatus = 'PAID';
      expect(component.paymentBadge?.label).toBe('Paid');
      component.booking.paymentStatus = 'REFUNDED';
      expect(component.paymentBadge?.label).toBe('Refunded');
    });

    it('shows no badge for an unpriced booking, or a cancelled one that was never paid', () => {
      component.booking.paymentStatus = null;
      expect(component.paymentBadge).toBeNull();
      component.booking.paymentStatus = 'UNPAID';
      component.booking.status = 'cancelled';
      expect(component.paymentBadge).toBeNull();
    });

    it('renders a Pay button with the amount for the client', () => {
      component.mode = 'client';
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).textContent).toContain('Pay $115.00');
    });
  });

  describe('showDetails (clicking the card body)', () => {
    it('opens the read-only details modal for a confirmed booking', () => {
      component.mode = 'client';
      component.booking.status = 'confirmed';

      component.showDetails();

      expect(dialogSpy.open).toHaveBeenCalledWith(
        BookingDetailsModalComponent,
        jasmine.objectContaining({ data: { booking: component.booking, mode: 'client' } })
      );
    });

    it('starts payment when the details modal is closed with "pay"', () => {
      dialogSpy.open.and.returnValue({ afterClosed: () => of('pay') } as any);
      const emitted: number[] = [];
      component.payRequested.subscribe((id: number) => emitted.push(id));
      component.mode = 'client';
      component.booking.status = 'confirmed';

      component.showDetails();

      expect(emitted).toEqual([1]);
    });

    it('opens the read-only details modal for a completed booking', () => {
      component.mode = 'provider';
      component.booking.status = 'completed';

      component.showDetails();

      expect(dialogSpy.open).toHaveBeenCalledWith(BookingDetailsModalComponent, jasmine.any(Object));
    });

    it('opens the richer review/confirm flow instead, for a still-pending request in provider mode', () => {
      component.mode = 'provider';
      component.booking.status = 'pending';

      component.showDetails();

      expect(dialogSpy.open).toHaveBeenCalledWith(ReviewBookingModalComponent, jasmine.any(Object));
      expect(dialogSpy.open).not.toHaveBeenCalledWith(BookingDetailsModalComponent, jasmine.any(Object));
    });

    it('opens the read-only details modal for a still-pending request in client mode (nothing to review)', () => {
      component.mode = 'client';
      component.booking.status = 'pending';

      component.showDetails();

      expect(dialogSpy.open).toHaveBeenCalledWith(BookingDetailsModalComponent, jasmine.any(Object));
    });
  });
});
