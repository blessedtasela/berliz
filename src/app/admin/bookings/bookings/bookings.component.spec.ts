import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject } from 'rxjs';

import { BookingsComponent } from './bookings.component';
import { selectBookings, selectBookingLoading } from 'src/app/state/booking/booking.selectors';

describe('BookingsComponent', () => {
  let component: BookingsComponent;
  let fixture: ComponentFixture<BookingsComponent>;

  beforeEach(() => {
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);

    TestBed.configureTestingModule({
      declarations: [BookingsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({ selectors: [{ selector: selectBookings, value: [] }, { selector: selectBookingLoading, value: false }] }),
        { provide: Actions, useValue: new Subject<any>() },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy }
      ]
    });

    fixture = TestBed.createComponent(BookingsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // PF-58: the owner needs to find a specific booking (e.g. "BK-000017") to send its review link.
  it('can search bookings by their human-readable reference', () => {
    const refField = component.bookingSearchFields.find(f => f.value === 'reference');
    expect(refField).toBeDefined();
    expect(refField!.accessor({ reference: 'BK-000017' } as any)).toBe('BK-000017');
    expect(refField!.accessor({ reference: null } as any)).toBe('');
  });
});
