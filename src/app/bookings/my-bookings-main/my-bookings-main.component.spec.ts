import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Actions } from '@ngrx/effects';
import { provideMockStore } from '@ngrx/store/testing';
import { Subject } from 'rxjs';

import { MyBookingsMainComponent } from './my-bookings-main.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { selectMyBookings } from 'src/app/state/booking/booking.selectors';

describe('MyBookingsMainComponent', () => {
  let component: MyBookingsMainComponent;
  let fixture: ComponentFixture<MyBookingsMainComponent>;

  beforeEach(() => {
    const snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [MyBookingsMainComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({ selectors: [{ selector: selectMyBookings, value: [] }] }),
        { provide: Actions, useValue: new Subject() },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: SnackBarService, useValue: snackBarSpy }
      ]
    });

    fixture = TestBed.createComponent(MyBookingsMainComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
