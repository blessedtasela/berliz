import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';

import { BookingsListComponent } from './bookings-list.component';
import { BookingService } from 'src/app/services/booking.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

describe('BookingsListComponent', () => {
  let component: BookingsListComponent;
  let fixture: ComponentFixture<BookingsListComponent>;

  beforeEach(() => {
    const bookingServiceSpy = jasmine.createSpyObj('BookingService', ['updateStatus']);
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
});
