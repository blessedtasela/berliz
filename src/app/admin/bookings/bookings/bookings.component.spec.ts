import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { BookingsComponent } from './bookings.component';
import { selectBookings } from 'src/app/state/booking/booking.selectors';

describe('BookingsComponent', () => {
  let component: BookingsComponent;
  let fixture: ComponentFixture<BookingsComponent>;

  beforeEach(() => {
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);

    TestBed.configureTestingModule({
      declarations: [BookingsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({ selectors: [{ selector: selectBookings, value: [] }] }),
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
});
