import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Actions } from '@ngrx/effects';
import { provideMockStore } from '@ngrx/store/testing';
import { Subject, of, throwError } from 'rxjs';

import { MyBookingsMainComponent } from './my-bookings-main.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StripeService } from 'src/app/services/stripe.service';
import { selectBookingError, selectBookingLoading, selectMyBookings } from 'src/app/state/booking/booking.selectors';
import { loadMyBookings } from 'src/app/state/booking/booking.actions';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { MockStore } from '@ngrx/store/testing';

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
});
