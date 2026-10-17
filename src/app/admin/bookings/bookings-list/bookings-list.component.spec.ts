import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';

import { BookingsListComponent } from './bookings-list.component';
import { BookingService } from 'src/app/services/booking.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { of, throwError } from 'rxjs';

describe('BookingsListComponent', () => {
  let component: BookingsListComponent;
  let fixture: ComponentFixture<BookingsListComponent>;

  beforeEach(() => {
    const bookingServiceSpy = jasmine.createSpyObj('BookingService', ['updateStatus', 'remindPayment']);
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [BookingsListComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore(),
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackBarSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    });

    fixture = TestBed.createComponent(BookingsListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('payment reminder', () => {
    it('is offered only for a confirmed or completed booking that is still unpaid', () => {
      expect(component.canRemind({ paymentStatus: 'UNPAID', status: 'confirmed' } as any)).toBeTrue();
      expect(component.canRemind({ paymentStatus: 'UNPAID', status: 'completed' } as any)).toBeTrue();
      expect(component.canRemind({ paymentStatus: 'UNPAID', status: 'pending' } as any)).toBeFalse();
      expect(component.canRemind({ paymentStatus: 'PAID', status: 'confirmed' } as any)).toBeFalse();
      expect(component.canRemind({ status: 'confirmed' } as any)).toBeFalse();
    });

    it('sends the reminder and confirms it', () => {
      const svc = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
      const snack = TestBed.inject(SnackBarService) as jasmine.SpyObj<SnackBarService>;
      svc.remindPayment.and.returnValue(of({ message: 'Reminder sent' }) as any);
      component.remindPayment({ id: 3, paymentStatus: 'UNPAID', status: 'confirmed' } as any);
      expect(svc.remindPayment).toHaveBeenCalledWith(3);
      expect(snack.openSnackBar).toHaveBeenCalledWith('Reminder sent', '');
    });

    it('does not call the server for a booking that is not owed', () => {
      const svc = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
      component.remindPayment({ id: 3, paymentStatus: 'PAID', status: 'confirmed' } as any);
      expect(svc.remindPayment).not.toHaveBeenCalled();
    });

    it('shows the server message when the reminder is refused', () => {
      const svc = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
      const snack = TestBed.inject(SnackBarService) as jasmine.SpyObj<SnackBarService>;
      svc.remindPayment.and.returnValue(throwError(() => ({ error: { message: 'Nothing to remind' } })));
      component.remindPayment({ id: 3, paymentStatus: 'UNPAID', status: 'confirmed' } as any);
      expect(snack.openSnackBar).toHaveBeenCalledWith('Nothing to remind', 'error');
    });
  });
});
