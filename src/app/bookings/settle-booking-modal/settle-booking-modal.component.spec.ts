import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { Booking } from 'src/app/models/booking.model';
import { BookingService } from 'src/app/services/booking.service';
import { SettleBookingModalComponent } from './settle-booking-modal.component';

describe('SettleBookingModalComponent', () => {
  let fixture: ComponentFixture<SettleBookingModalComponent>;
  let component: SettleBookingModalComponent;
  let dialogRef: jasmine.SpyObj<MatDialogRef<SettleBookingModalComponent>>;
  let bookingService: jasmine.SpyObj<BookingService>;

  const booking = (over: Partial<Booking> = {}): Booking => ({
    id: 7, clientFirstname: 'Sam', status: 'confirmed', paymentStatus: 'UNPAID', amountDue: 50, ...over,
  } as Booking);

  function create(b: Booking): void {
    TestBed.configureTestingModule({
      declarations: [SettleBookingModalComponent],
      imports: [FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { booking: b } },
        { provide: BookingService, useValue: bookingService },
      ],
    });
    fixture = TestBed.createComponent(SettleBookingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    bookingService = jasmine.createSpyObj('BookingService', ['settleBooking']);
  });

  it('pre-fills the amount from amountDue', () => {
    create(booking({ amountDue: 85 }));
    expect(component.amount).toBe(85);
  });

  it('cannot submit without an amount and a channel', () => {
    create(booking());
    expect(component.canSubmit).toBeFalse(); // amount is pre-filled, but no channel chosen yet

    component.channel = 'CASH';
    expect(component.canSubmit).toBeTrue(); // both set now

    component.amount = null;
    expect(component.canSubmit).toBeFalse();

    component.amount = 0;
    expect(component.canSubmit).toBeFalse(); // zero isn't a real payment

    component.amount = 50;
    expect(component.canSubmit).toBeTrue();
  });

  it('settles directly with the entered amount, channel and note, then closes with the result', () => {
    create(booking());
    component.channel = 'CASH';
    component.note = 'paid in person';
    bookingService.settleBooking.and.returnValue(of({ success: true, message: '', statusCode: 200, data: booking({ paymentStatus: 'PAID' }) }));

    component.submit();

    expect(bookingService.settleBooking).toHaveBeenCalledWith(7, { mode: 'DIRECT', amount: 50, channel: 'CASH', note: 'paid in person' });
    expect(dialogRef.close).toHaveBeenCalledWith(jasmine.objectContaining({ paymentStatus: 'PAID' }));
    expect(component.saving).toBeFalse();
  });

  it('sends no note when left blank', () => {
    create(booking());
    component.channel = 'E_TRANSFER';
    bookingService.settleBooking.and.returnValue(of({ success: true, message: '', statusCode: 200, data: booking() }));

    component.submit();

    expect(bookingService.settleBooking).toHaveBeenCalledWith(7, { mode: 'DIRECT', amount: 50, channel: 'E_TRANSFER', note: undefined });
  });

  it('shows the server error and stops saving on failure, without closing', () => {
    create(booking());
    component.channel = 'CASH';
    bookingService.settleBooking.and.returnValue(throwError(() => ({ error: { message: 'Only a confirmed, unpaid session can be settled.' } })));

    component.submit();

    expect(component.error).toBe('Only a confirmed, unpaid session can be settled.');
    expect(component.saving).toBeFalse();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('close() dismisses with no result', () => {
    create(booking());
    component.close();
    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });
});
