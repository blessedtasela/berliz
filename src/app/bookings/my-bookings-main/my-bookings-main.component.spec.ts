import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Actions } from '@ngrx/effects';
import { provideMockStore } from '@ngrx/store/testing';
import { Subject, of, throwError } from 'rxjs';

import { MyBookingsMainComponent } from './my-bookings-main.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StripeService } from 'src/app/services/stripe.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { PaymentCodeService } from 'src/app/services/payment-code.service';
import { selectBookingError, selectBookingLoading, selectMyBookings } from 'src/app/state/booking/booking.selectors';
import { loadMyBookings } from 'src/app/state/booking/booking.actions';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { MockStore } from '@ngrx/store/testing';

describe('MyBookingsMainComponent', () => {
  let component: MyBookingsMainComponent;
  let fixture: ComponentFixture<MyBookingsMainComponent>;

  let stripeSpy: jasmine.SpyObj<StripeService>;
  let snackBarSpy: jasmine.SpyObj<SnackBarService>;
  let trainerServiceSpy: jasmine.SpyObj<TrainerService>;
  let paymentCodeServiceSpy: jasmine.SpyObj<PaymentCodeService>;

  beforeEach(() => {
    snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    stripeSpy = jasmine.createSpyObj('StripeService', ['createBookingCheckout']);
    trainerServiceSpy = jasmine.createSpyObj('TrainerService', ['getMyReviewSlotStatus']);
    trainerServiceSpy.getMyReviewSlotStatus.and.returnValue(of({ success: true, statusCode: 200, message: '', data: { available: true } }));
    paymentCodeServiceSpy = jasmine.createSpyObj('PaymentCodeService', ['askTrainer', 'redeem']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [MyBookingsMainComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [LoadErrorComponent],
      providers: [
        provideMockStore({ selectors: [
          { selector: selectMyBookings, value: [] },
          { selector: selectBookingLoading, value: false },
          { selector: selectBookingError, value: null },
        ] }),
        { provide: Actions, useValue: new Subject() },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: SnackBarService, useValue: snackBarSpy },
        { provide: StripeService, useValue: stripeSpy },
        { provide: TrainerService, useValue: trainerServiceSpy },
        { provide: PaymentCodeService, useValue: paymentCodeServiceSpy }
      ]
    });

    fixture = TestBed.createComponent(MyBookingsMainComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('when the list cannot be loaded', () => {
    const el = () => fixture.nativeElement as HTMLElement;

    it('shows a retryable error instead of the empty state', () => {
      const store = TestBed.inject(MockStore);
      store.overrideSelector(selectBookingError, 'Server exploded');
      store.refreshState();
      fixture.detectChanges();

      expect(el().textContent).toContain("Couldn't load your bookings");
      expect(el().textContent).toContain('Server exploded');
      expect(el().querySelector('app-bookings-empty')).toBeNull();
    });

    it('retrying asks for the bookings again', () => {
      const store = TestBed.inject(MockStore);
      store.overrideSelector(selectBookingError, 'Server exploded');
      store.refreshState();
      fixture.detectChanges();
      const dispatch = spyOn(store, 'dispatch');

      (el().querySelector('app-load-error button') as HTMLButtonElement).click();

      expect(dispatch).toHaveBeenCalledWith(loadMyBookings());
    });

    it('shows the genuine empty state when there is no error', () => {
      fixture.detectChanges();
      component.loading = false; // the (mocked) store never finishes the load the component starts
      fixture.detectChanges();
      expect(el().querySelector('app-bookings-empty')).not.toBeNull();
      expect(el().querySelector('app-load-error')).toBeNull();
    });

    it('does not flash the empty state while the first load is still running', () => {
      const store = TestBed.inject(MockStore);
      store.overrideSelector(selectBookingLoading, true);
      store.refreshState();
      fixture.detectChanges();
      expect(el().querySelector('app-bookings-empty')).toBeNull();
    });
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

  describe('asking a trainer for a payment code (PY-29)', () => {
    it('asks against the specific booking and shows the server confirmation', () => {
      paymentCodeServiceSpy.askTrainer.and.returnValue(of({ success: true, statusCode: 200, data: {} as any, message: 'Your trainer has been told.' }));

      component.onAskForCodeRequested(50);

      expect(paymentCodeServiceSpy.askTrainer).toHaveBeenCalledWith({ targetType: 'BOOKING', bookingId: 50 });
      expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith('Your trainer has been told.', '');
      expect(component.askingForCodeBookingId).toBeNull();
    });

    it('shows the specific failure (e.g. already asked) and clears the busy flag', () => {
      paymentCodeServiceSpy.askTrainer.and.returnValue(throwError(() => ({ error: { message: 'There is already an open request for this.' } })));

      component.onAskForCodeRequested(50);

      expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith('There is already an open request for this.', 'error');
      expect(component.askingForCodeBookingId).toBeNull();
    });

    it('ignores a second ask while one is in flight', () => {
      paymentCodeServiceSpy.askTrainer.and.returnValue(new Subject<any>());

      component.onAskForCodeRequested(50);
      component.onAskForCodeRequested(50);

      expect(paymentCodeServiceSpy.askTrainer).toHaveBeenCalledTimes(1);
    });
  });

  describe('redeeming a payment code against a booking (PY-29)', () => {
    it('redeems against the specific booking, confirms, and reloads the list', () => {
      const store = TestBed.inject(MockStore);
      const dispatch = spyOn(store, 'dispatch');
      paymentCodeServiceSpy.redeem.and.returnValue(of({ success: true, statusCode: 200, message: 'Your code is applied. Nothing to pay.', data: {} as any }));

      component.onRedeemCodeRequested({ id: 50, code: 'BZ-TEST-1' });

      expect(paymentCodeServiceSpy.redeem).toHaveBeenCalledWith({ code: 'BZ-TEST-1', bookingId: 50 });
      expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith('Your code is applied. Nothing to pay.', '');
      expect(dispatch).toHaveBeenCalledWith(loadMyBookings());
      expect(component.redeemingCodeBookingId).toBeNull();
    });

    it('shows the specific rejection reason and does not reload on failure', () => {
      const store = TestBed.inject(MockStore);
      const dispatch = spyOn(store, 'dispatch');
      paymentCodeServiceSpy.redeem.and.returnValue(throwError(() => ({ error: { message: 'This code has expired. Ask your trainer to request a new one.' } })));

      component.onRedeemCodeRequested({ id: 50, code: 'BZ-TEST-1' });

      expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith('This code has expired. Ask your trainer to request a new one.', 'error');
      expect(dispatch).not.toHaveBeenCalledWith(loadMyBookings());
      expect(component.redeemingCodeBookingId).toBeNull();
    });
  });

  describe('review slot status (PF-43)', () => {
    function booking(id: number, trainerId: number): any {
      return { id, status: 'completed', trainerId, trainerName: 'Coach' };
    }

    it('fetches once per distinct trainer among completed bookings', () => {
      const store = TestBed.inject(MockStore);
      store.overrideSelector(selectMyBookings, [booking(1, 9), booking(2, 9), booking(3, 10)]);
      store.refreshState();

      fixture.detectChanges();

      expect(trainerServiceSpy.getMyReviewSlotStatus).toHaveBeenCalledTimes(2);
      expect(trainerServiceSpy.getMyReviewSlotStatus).toHaveBeenCalledWith(9);
      expect(trainerServiceSpy.getMyReviewSlotStatus).toHaveBeenCalledWith(10);
    });

    it('exposes the fetched availability per booking via reviewSlotAvailable', () => {
      const store = TestBed.inject(MockStore);
      const b = booking(1, 9);
      store.overrideSelector(selectMyBookings, [b]);
      store.refreshState();

      fixture.detectChanges();

      expect(component.reviewSlotAvailable(b)).toBeTrue();
    });

    it('does not refetch a trainer already checked once the list re-emits', () => {
      const store = TestBed.inject(MockStore);
      store.overrideSelector(selectMyBookings, [booking(1, 9)]);
      store.refreshState();
      fixture.detectChanges();

      store.overrideSelector(selectMyBookings, [booking(1, 9), booking(2, 9)]);
      store.refreshState();

      expect(trainerServiceSpy.getMyReviewSlotStatus).toHaveBeenCalledTimes(1);
    });

    it('leaves a booking with no trainerId (a center booking) undecided', () => {
      const b = { id: 1, status: 'completed', trainerId: null, centerId: 3 };
      expect(component.reviewSlotAvailable(b as any)).toBeUndefined();
    });
  });
});
