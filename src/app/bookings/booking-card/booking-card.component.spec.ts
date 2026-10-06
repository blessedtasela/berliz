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

  describe('cancel, no-show and reopen', () => {
    const lastDialogMessage = (): string => (dialogSpy.open.calls.mostRecent().args[1] as any).data.message;

    it('lets a client cancel a confirmed session as well as a pending one', () => {
      component.mode = 'client';
      component.booking.status = 'confirmed';
      expect(component.canClientCancel).toBeTrue();
      component.booking.status = 'pending';
      expect(component.canClientCancel).toBeTrue();
      component.booking.status = 'completed';
      expect(component.canClientCancel).toBeFalse();
    });

    it('spells out the refund before a client cancels a paid, confirmed session', () => {
      component.mode = 'client';
      component.booking.status = 'confirmed';
      component.booking.paymentStatus = 'PAID';
      component.booking.amountPaid = 100;
      component.booking.scheduledAt = new Date(Date.now() + 5 * 3600_000);

      component.cancel();

      expect(lastDialogMessage()).toContain('only 50%');
    });

    it('keeps the plain withdraw message for a pending request', () => {
      component.mode = 'client';
      component.booking.status = 'pending';

      component.cancel();

      expect(lastDialogMessage()).toContain('withdrawn');
    });

    it('offers No-show to the provider only once a confirmed session has started', () => {
      component.mode = 'provider';
      component.booking.status = 'confirmed';
      component.booking.scheduledAt = new Date(Date.now() - 3600_000);
      expect(component.canProviderNoShow).toBeTrue();
      component.booking.scheduledAt = new Date(Date.now() + 3600_000);
      expect(component.canProviderNoShow).toBeFalse();
    });

    it('asks before marking a no-show, then emits the no_show status', () => {
      dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as any);
      const emitted: { id: number; status: string }[] = [];
      component.statusChangeRequested.subscribe(e => emitted.push(e));
      component.mode = 'provider';

      component.setStatus('no_show');

      expect(emitted).toEqual([{ id: 1, status: 'no_show' }]);
    });

    it('does not mark a no-show if the provider backs out', () => {
      dialogSpy.open.and.returnValue({ afterClosed: () => of(false) } as any);
      const emitted: unknown[] = [];
      component.statusChangeRequested.subscribe(e => emitted.push(e));
      component.mode = 'provider';

      component.setStatus('no_show');

      expect(emitted).toEqual([]);
    });

    it('will not offer to reopen a cancelled session whose money went back', () => {
      component.mode = 'provider';
      component.booking.status = 'cancelled';
      component.booking.paymentStatus = 'REFUNDED';
      expect(component.canProviderReopen).toBeFalse();
      component.booking.paymentStatus = 'PARTIALLY_REFUNDED';
      expect(component.canProviderReopen).toBeFalse();
      component.booking.paymentStatus = 'UNPAID';
      expect(component.canProviderReopen).toBeTrue();
    });

    it('labels the no_show status readably', () => {
      component.booking.status = 'no_show';
      expect(component.statusLabel).toBe('No-show');
    });

    it('shows the pay-by deadline and an extra-balance button label', () => {
      component.mode = 'client';
      component.booking.status = 'confirmed';
      component.booking.paymentStatus = 'UNPAID';
      component.booking.amountDue = 150;
      component.booking.amountPaid = 100;
      component.booking.balanceDue = 50;
      component.booking.paymentDueAt = new Date(Date.now() + 5 * 3600_000);

      expect(component.payButtonLabel).toBe('Pay extra $50.00');
      expect(component.payByText).toContain('Pay the extra by');
    });
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
