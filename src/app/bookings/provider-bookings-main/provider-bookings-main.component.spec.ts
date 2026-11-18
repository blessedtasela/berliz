import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { ProviderBookingsMainComponent } from './provider-bookings-main.component';
import { Booking } from 'src/app/models/booking.model';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { selectBookingError, selectBookingLoading, selectProviderBookings } from 'src/app/state/booking/booking.selectors';
import { loadMyProviderBookings } from 'src/app/state/booking/booking.actions';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

/**
 * A real stub for the one @Input (`onboardingPercent`) whose name starts with "on" -- left to
 * NO_ERRORS_SCHEMA's generic unknown-element handling, Angular's dev-mode security guard
 * (NG0306) mistakes it for a native "on..." event-handler DOM property and throws.
 */
@Component({ selector: 'app-booking-card', template: '', standalone: false })
class BookingCardStubComponent {
  @Input() onboardingPercent: number | null | undefined;
}

describe('ProviderBookingsMainComponent', () => {
  let component: ProviderBookingsMainComponent;
  let fixture: ComponentFixture<ProviderBookingsMainComponent>;

  beforeEach(() => {
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
    declarations: [ProviderBookingsMainComponent, BookingCardStubComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [RouterTestingModule, MatDialogModule, LoadErrorComponent],
    providers: [
        provideMockStore({ selectors: [
          { selector: selectProviderBookings, value: [] },
          { selector: selectBookingLoading, value: false },
          { selector: selectBookingError, value: null },
        ] }),
        { provide: Actions, useValue: of() },
        { provide: SnackBarService, useValue: mockSnackBarService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});

    fixture = TestBed.createComponent(ProviderBookingsMainComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('when the list cannot be loaded', () => {
    const el = () => fixture.nativeElement as HTMLElement;

    it('shows a retryable error instead of "no one has booked you yet"', () => {
      const store = TestBed.inject(MockStore);
      store.overrideSelector(selectBookingError, 'Server exploded');
      store.refreshState();
      fixture.detectChanges();

      expect(el().textContent).toContain("Couldn't load your bookings");
      expect(el().textContent).toContain('Server exploded');
      expect(el().querySelector('app-bookings-empty')).toBeNull();
    });

    it('retrying asks for the provider bookings again', () => {
      const store = TestBed.inject(MockStore);
      store.overrideSelector(selectBookingError, 'Server exploded');
      store.refreshState();
      fixture.detectChanges();
      const dispatch = spyOn(store, 'dispatch');

      (el().querySelector('app-load-error button') as HTMLButtonElement).click();

      expect(dispatch).toHaveBeenCalledWith(loadMyProviderBookings());
    });

    it('BK-44: reloads the list once a booking is settled', () => {
      const store = TestBed.inject(MockStore);
      const dispatch = spyOn(store, 'dispatch');

      component.onSettled(42);

      expect(dispatch).toHaveBeenCalledWith(loadMyProviderBookings());
    });

    it('shows the genuine empty state when there is no error', () => {
      fixture.detectChanges();
      expect(el().querySelector('app-bookings-empty')).not.toBeNull();
      expect(el().querySelector('app-load-error')).toBeNull();
    });
  });

  describe('intake visibility (BK-24: a submitted intake must not disappear)', () => {
    const confirmedBooking = { id: 1, clientId: 5, status: 'confirmed', clientFirstname: 'Sam', clientLastname: 'Client' } as unknown as Booking;

    function initWithBooking(): HttpTestingController {
      const store = TestBed.inject(MockStore);
      store.overrideSelector(selectProviderBookings, [confirmedBooking]);
      store.refreshState();
      fixture.detectChanges();

      const httpMock = TestBed.inject(HttpTestingController);
      // loadOnboardingFlags() also fires for a confirmed booking -- let it through untouched.
      httpMock.match(r => r.url.includes('/client-onboarding/')).forEach(req => req.flush({ data: {} }));
      return httpMock;
    }

    it('looks up existing intakes once bookings load, keyed by client id', () => {
      const httpMock = initWithBooking();

      const req = httpMock.expectOne(r => r.url.endsWith('/client-intake/getMyIntakes'));
      req.flush({ data: [{ id: 42, clientId: 5 }] });

      expect(component.intakeIdByClient[5]).toBe(42);
      httpMock.verify();
    });

    // BK-43/BK-47: a row existing (even one the client never touched) is not the same as it
    // being signed -- the card must not claim the PAR-Q is done off the first alone.
    it('only counts a PAR-Q as signed when status is COMPLETED or LOCKED', () => {
      const httpMock = initWithBooking();
      httpMock.expectOne(r => r.url.endsWith('/client-intake/getMyIntakes'))
        .flush({ data: [{ id: 42, clientId: 5, status: 'COMPLETED' }] });

      expect(component.signedIntakeByClient[5]).toBe(true);
      httpMock.verify();
    });

    it('does not count an unsigned PAR-Q as signed, even though the row exists', () => {
      const httpMock = initWithBooking();
      httpMock.expectOne(r => r.url.endsWith('/client-intake/getMyIntakes'))
        .flush({ data: [{ id: 42, clientId: 5, status: 'SENT' }] });

      expect(component.signedIntakeByClient[5]).toBeUndefined();
      // ...but the existing-draft lookup still works -- BK-24 must not regress.
      expect(component.intakeIdByClient[5]).toBe(42);
      httpMock.verify();
    });

    // GN-63: `intakeFlagsLoaded` is what lets the booking card tell "not loaded yet" apart from
    // "loaded, and there's genuinely no PAR-Q" -- without it the card has no way to avoid
    // defaulting to the latter the instant it renders, which is what caused the Fill-Together-
    // then-View-PAR-Q flash this ticket reports.
    it('starts each intake lookup as not-yet-loaded and flips to loaded once the response lands', () => {
      const store = TestBed.inject(MockStore);
      store.overrideSelector(selectProviderBookings, [confirmedBooking]);
      store.refreshState();
      fixture.detectChanges();
      expect(component.intakeFlagsLoaded).toBe(false);

      const httpMock = TestBed.inject(HttpTestingController);
      httpMock.match(r => r.url.includes('/client-onboarding/')).forEach(req => req.flush({ data: {} }));
      httpMock.expectOne(r => r.url.endsWith('/client-intake/getMyIntakes')).flush({ data: [] });

      expect(component.intakeFlagsLoaded).toBe(true);
      httpMock.verify();
    });

    it('opens the existing intake instead of starting a blank one', () => {
      const httpMock = initWithBooking();
      httpMock.expectOne(r => r.url.endsWith('/client-intake/getMyIntakes')).flush({ data: [{ id: 42, clientId: 5 }] });
      const navigate = spyOn(TestBed.inject(Router), 'navigate');

      component.onStartIntakeRequested({ clientId: 5, clientName: 'Sam Client' });

      expect(navigate).toHaveBeenCalledWith(['/dashboard/client-intake', 42]);
      httpMock.verify();
    });

    it('starts a new intake when this client has none yet', () => {
      const httpMock = initWithBooking();
      httpMock.expectOne(r => r.url.endsWith('/client-intake/getMyIntakes')).flush({ data: [] });
      const navigate = spyOn(TestBed.inject(Router), 'navigate');

      component.onStartIntakeRequested({ clientId: 5, clientName: 'Sam Client' });

      expect(navigate).toHaveBeenCalledWith(['/dashboard/client-intake/new', 5], { queryParams: { clientName: 'Sam Client' } });
      httpMock.verify();
    });
  });
});
