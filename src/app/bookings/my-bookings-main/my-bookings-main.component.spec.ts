import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Actions } from '@ngrx/effects';
import { provideMockStore } from '@ngrx/store/testing';
import { Subject, of, throwError } from 'rxjs';

import { MyBookingsMainComponent } from './my-bookings-main.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StripeService } from 'src/app/services/stripe.service';
import { selectMyBookings } from 'src/app/state/booking/booking.selectors';

describe('MyBookingsMainComponent', () => {
  let component: MyBookingsMainComponent;
  let fixture: ComponentFixture<MyBookingsMainComponent>;

  let stripeSpy: jasmine.SpyObj<StripeService>;
  let snackBarSpy: jasmine.SpyObj<SnackBarService>;

  beforeEach(() => {
    snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    stripeSpy = jasmine.createSpyObj('StripeService', ['createBookingCheckout']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [MyBookingsMainComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({ selectors: [{ selector: selectMyBookings, value: [] }] }),
        { provide: Actions, useValue: new Subject() },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: SnackBarService, useValue: snackBarSpy },
        { provide: StripeService, useValue: stripeSpy }
      ]
    });

    fixture = TestBed.createComponent(MyBookingsMainComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('paying for a confirmed session', () => {
    let redirect: jasmine.Spy;

    beforeEach(() => {
      redirect = spyOn<any>(component, 'redirect');
    });

    it('creates a checkout for that booking and sends the browser to Stripe', () => {
      stripeSpy.createBookingCheckout.and.returnValue(of({ data: { sessionId: 'cs_1', checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_1' } } as any));

      component.onPayRequested(50);

      expect(stripeSpy.createBookingCheckout).toHaveBeenCalledWith(50);
      expect(redirect).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/cs_1');
    });

    it('shows the server message and re-enables paying when checkout cannot start', () => {
      stripeSpy.createBookingCheckout.and.returnValue(throwError(() => ({ error: { message: 'Stripe is not configured on this server yet.' } })));

      component.onPayRequested(50);

      expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith('Stripe is not configured on this server yet.', 'error');
      expect(redirect).not.toHaveBeenCalled();
      expect(component.payingBookingId).toBeNull();
    });

    it('ignores a second tap while a checkout is being created', () => {
      stripeSpy.createBookingCheckout.and.returnValue(new Subject<any>());

      component.onPayRequested(50);
      component.onPayRequested(50);

      expect(stripeSpy.createBookingCheckout).toHaveBeenCalledTimes(1);
    });

    it('treats a response with no checkout url as a failure', () => {
      stripeSpy.createBookingCheckout.and.returnValue(of({ data: {} } as any));

      component.onPayRequested(50);

      expect(redirect).not.toHaveBeenCalled();
      expect(snackBarSpy.openSnackBar).toHaveBeenCalled();
      expect(component.payingBookingId).toBeNull();
    });
  });
});
