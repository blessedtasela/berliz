import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { BookingDetailsModalComponent, BookingDetailsModalData } from './booking-details-modal.component';
import { Booking } from 'src/app/models/booking.model';

describe('BookingDetailsModalComponent', () => {
  let component: BookingDetailsModalComponent;
  let fixture: ComponentFixture<BookingDetailsModalComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<BookingDetailsModalComponent>>;
  let routerSpy: jasmine.SpyObj<Router>;

  const booking: Booking = {
    id: 1,
    clientId: 9,
    clientFirstname: 'Jane',
    clientLastname: 'Doe',
    clientEmail: 'jane@example.com',
    clientUsername: 'janedoe',
    trainerId: 2,
    trainerName: 'Trainer Name',
    centerId: null,
    centerName: null,
    scheduledAt: new Date('2026-01-15T14:00:00'),
    durationMinutes: 60,
    status: 'confirmed',
    notes: 'Bring a mat',
    date: new Date('2026-01-01T00:00:00'),
    lastUpdate: new Date('2026-01-02T00:00:00'),
  } as Booking;

  function setup(data: BookingDetailsModalData) {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [BookingDetailsModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: Router, useValue: routerSpy },
      ]
    });

    fixture = TestBed.createComponent(BookingDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    setup({ booking, mode: 'client' });
    expect(component).toBeTruthy();
  });

  it('client mode shows the trainer/center as the counterparty', () => {
    setup({ booking, mode: 'client' });
    expect(component.counterpartyName).toBe('Trainer Name');
    expect(component.counterpartySubtitle).toBe('Trainer');
    expect(component.hasCounterpartyProfile).toBeFalse();
  });

  it('provider mode shows the client as the counterparty, with a profile link when a username exists', () => {
    setup({ booking, mode: 'provider' });
    expect(component.counterpartyName).toBe('Jane Doe');
    expect(component.counterpartySubtitle).toBe('jane@example.com');
    expect(component.hasCounterpartyProfile).toBeTrue();
  });

  it('provider mode with no client username has no profile link', () => {
    setup({ booking: { ...booking, clientUsername: undefined }, mode: 'provider' });
    expect(component.hasCounterpartyProfile).toBeFalse();
  });

  it('viewCounterpartyProfile closes the dialog and navigates to the client\'s dashboard profile', () => {
    setup({ booking, mode: 'provider' });
    component.viewCounterpartyProfile();
    expect(dialogRefSpy.close).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/user', 'janedoe']);
  });

  it('close() closes the dialog', () => {
    setup({ booking, mode: 'client' });
    component.close();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  // BK-29/BK-18/BK-31: header shows the reference; the travel fee is labelled "travel fee" and
  // shown exactly once, never duplicated between the location line and the zone line -- verified
  // against the real BK-000017 numbers (trial $100, new-member promo -$50, paid $50, in-zone gym).
  describe('reference and fee wording (BK-29/BK-31)', () => {
    const paidTrial: Booking = {
      ...booking,
      reference: 'BK-000017',
      sessionType: 'TRIAL',
      trialPrice: 100,
      introDiscount: 50,
      locationLabel: 'Evolve Strength',
      travelZone: 'DOWNTOWN',
      locationFee: 0,
      gymDropInFee: 25,
      paymentStatus: 'PAID',
      amountPaid: 50,
    };

    it('shows the booking reference in the header', () => {
      setup({ booking: paidTrial, mode: 'client' });
      expect(fixture.nativeElement.textContent).toContain('BK-000017');
    });

    it('shows the zone travel-fee line exactly once and never a duplicate "location fee" badge', () => {
      setup({ booking: paidTrial, mode: 'client' });
      const text = (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ');
      expect(text).toContain('no travel fee');
      expect(text).not.toContain('location fee');
    });

    it('shows the travel fee inline on the location line for a custom location with no travelZone', () => {
      setup({ booking: { ...paidTrial, locationCustom: true, travelZone: null, locationFee: 30 }, mode: 'client' });
      const text = (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ');
      expect(text).toContain('CA$30.00 travel fee');
      expect(text).not.toContain('location fee');
    });
  });
});
