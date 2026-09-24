import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { ManageBookingsComponent } from './manage-bookings.component';
import { selectUser } from 'src/app/state/user/user.selector';
import { selectProviderBookings } from 'src/app/state/booking/booking.selectors';
import { userFeatureKey } from 'src/app/state/user/user.reducer';
import { initialUserState } from 'src/app/state/user/user.state';
import { bookingFeatureKey } from 'src/app/state/booking/booking.reducer';
import { initialBookingState } from 'src/app/state/booking/booking.state';
import { Users } from 'src/app/models/users.interface';

describe('ManageBookingsComponent', () => {
  let component: ManageBookingsComponent;
  let fixture: ComponentFixture<ManageBookingsComponent>;
  let store: MockStore;

  function setup(user: Users | null) {
    TestBed.configureTestingModule({
      declarations: [ManageBookingsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({
          initialState: {
            [userFeatureKey]: initialUserState,
            [bookingFeatureKey]: initialBookingState,
          },
          selectors: [
            { selector: selectUser, value: user },
            { selector: selectProviderBookings, value: [] },
          ]
        }),
      ]
    });
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(ManageBookingsComponent);
    component = fixture.componentInstance;
  }

  it('defaults a trainer straight to Requests -- that\'s where their real activity is, not "My bookings"', () => {
    setup({ role: 'trainer' } as Users);
    fixture.detectChanges();
    expect(component.view).toBe('requests');
  });

  it('defaults a center straight to Requests too', () => {
    setup({ role: 'center' } as Users);
    fixture.detectChanges();
    expect(component.view).toBe('requests');
  });

  it('leaves a plain member/client on "My bookings" -- they have no Requests view at all', () => {
    setup({ role: 'user' } as Users);
    fixture.detectChanges();
    expect(component.view).toBe('mine');
  });

  it('does not yank a provider back to Requests if they switch to "My bookings" themselves', () => {
    setup({ role: 'trainer' } as Users);
    fixture.detectChanges();
    expect(component.view).toBe('requests');

    component.setView('mine');
    store.refreshState();

    expect(component.view).toBe('mine');
  });
});
