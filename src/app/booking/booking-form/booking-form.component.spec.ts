import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Actions } from '@ngrx/effects';
import { provideMockStore } from '@ngrx/store/testing';
import { Subject } from 'rxjs';

import { BookingFormComponent, BookingFormData } from './booking-form.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { selectAvailabilityLoading, selectAvailableSlots } from 'src/app/state/availability/availability.selectors';

describe('BookingFormComponent', () => {
  let component: BookingFormComponent;
  let fixture: ComponentFixture<BookingFormComponent>;

  beforeEach(() => {
    const snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const dialogData: BookingFormData = { trainerId: 1, providerName: 'Test Trainer' };

    TestBed.configureTestingModule({
      declarations: [BookingFormComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        provideMockStore({
          selectors: [
            { selector: selectAvailabilityLoading, value: false },
            { selector: selectAvailableSlots, value: null }
          ]
        }),
        { provide: Actions, useValue: new Subject() },
        { provide: SnackBarService, useValue: snackBarSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: dialogData }
      ]
    });

    fixture = TestBed.createComponent(BookingFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
