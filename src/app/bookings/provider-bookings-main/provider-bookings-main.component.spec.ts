import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { ProviderBookingsMainComponent } from './provider-bookings-main.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { selectBookingError, selectBookingLoading, selectProviderBookings } from 'src/app/state/booking/booking.selectors';
import { loadMyProviderBookings } from 'src/app/state/booking/booking.actions';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ProviderBookingsMainComponent', () => {
  let component: ProviderBookingsMainComponent;
  let fixture: ComponentFixture<ProviderBookingsMainComponent>;

  beforeEach(() => {
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
    declarations: [ProviderBookingsMainComponent],
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

    it('shows the genuine empty state when there is no error', () => {
      fixture.detectChanges();
      expect(el().querySelector('app-bookings-empty')).not.toBeNull();
      expect(el().querySelector('app-load-error')).toBeNull();
    });
  });
});
