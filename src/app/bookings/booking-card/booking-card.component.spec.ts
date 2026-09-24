import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

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
