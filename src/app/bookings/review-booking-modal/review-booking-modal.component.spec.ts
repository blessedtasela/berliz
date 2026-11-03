import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Booking } from 'src/app/models/booking.model';
import { BookingService } from 'src/app/services/booking.service';
import { ReviewBookingModalComponent } from './review-booking-modal.component';

describe('ReviewBookingModalComponent travel zone', () => {
  let fixture: ComponentFixture<ReviewBookingModalComponent>;
  let component: ReviewBookingModalComponent;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ReviewBookingModalComponent>>;
  let bookingService: jasmine.SpyObj<BookingService>;

  const booking = (over: Partial<Booking> = {}): Booking => ({
    id: 5, clientFirstname: 'Alex', clientLastname: 'Doe', scheduledAt: new Date('2026-11-05T17:00:00Z'), durationMinutes: 60,
    status: 'pending', locationLabel: 'Some Gym', ...over,
  } as Booking);

  function create(b: Booking): void {
    TestBed.configureTestingModule({
      declarations: [ReviewBookingModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { booking: b } },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: BookingService, useValue: bookingService },
      ],
    });
    fixture = TestBed.createComponent(ReviewBookingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    bookingService = jasmine.createSpyObj('BookingService', ['setTravelZone']);
  });

  it('confirms straight away when the zone is already known', () => {
    create(booking({ travelZone: 'NEARBY', locationFee: 30 }));
    expect(fixture.nativeElement.querySelector('[data-testid="zone-picker"]')).toBeNull();
    component.confirm();
    expect(bookingService.setTravelZone).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith({ decision: 'confirmed' });
  });

  it('shows the trial, its new-member offer, the zone with its fee, and the gym drop-in as not part of the amount due', () => {
    create(booking({ sessionType: 'TRIAL', trialPrice: 100, introDiscount: 50, travelZone: 'NEARBY', locationFee: 30, gymDropInFee: 25 }));
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Trial session');
    expect(text).toContain('new member offer');
    expect(text).toContain('Greater Vancouver');
    expect(text).toContain('$30.00 travel fee');
    expect(text).toContain('paid to the gym');
  });

  it('makes the trainer pick a zone before accepting a gym with no usable link', () => {
    create(booking({ travelZone: 'PENDING' }));
    expect(fixture.nativeElement.querySelector('[data-testid="zone-picker"]')).not.toBeNull();
    const confirmButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(b => b.textContent?.includes('Confirm booking'))!;
    expect(confirmButton.disabled).toBeTrue();

    component.confirm();
    expect(bookingService.setTravelZone).not.toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('saves the chosen zone first, then confirms', () => {
    bookingService.setTravelZone.and.returnValue(of({} as any));
    create(booking({ travelZone: 'PENDING' }));
    component.zoneChoice = 'NEARBY';
    component.confirm();
    expect(bookingService.setTravelZone).toHaveBeenCalledWith(5, 'NEARBY');
    expect(dialogRef.close).toHaveBeenCalledWith({ decision: 'confirmed' });
  });

  it('stays open and says why when the zone cannot be saved', () => {
    bookingService.setTravelZone.and.returnValue(throwError(() => ({ error: { message: 'This booking\'s travel zone is already settled.' } })));
    create(booking({ travelZone: 'PENDING' }));
    component.zoneChoice = 'FAR';
    component.confirm();
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.savingZone).toBeFalse();
    expect(component.zoneError).toContain('already settled');
  });
});
