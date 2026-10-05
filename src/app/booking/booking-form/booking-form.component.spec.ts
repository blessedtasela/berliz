import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Actions } from '@ngrx/effects';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Subject } from 'rxjs';

import { of } from 'rxjs';
import { BookingFormComponent, BookingFormData } from './booking-form.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SessionCreditService } from 'src/app/services/session-credit.service';
import { PromotionService } from 'src/app/services/promotion.service';
import { selectAvailabilityLoading, selectAvailableSlots } from 'src/app/state/availability/availability.selectors';

describe('BookingFormComponent', () => {
  let component: BookingFormComponent;
  let fixture: ComponentFixture<BookingFormComponent>;

  beforeEach(() => {
    const snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const dialogData: BookingFormData = { trainerId: 1, providerName: 'Test Trainer' };
    // Reward redemption (session credits / provider promos): both fetched
    // on init to populate the optional "Apply a reward" picker.
    const sessionCreditServiceSpy = jasmine.createSpyObj('SessionCreditService', ['getMine']);
    sessionCreditServiceSpy.getMine.and.returnValue(of({ data: [] }));
    const promotionServiceSpy = jasmine.createSpyObj('PromotionService', ['getPublicForTrainer', 'getPublicForCenter']);
    promotionServiceSpy.getPublicForTrainer.and.returnValue(of({ data: [] }));
    promotionServiceSpy.getPublicForCenter.and.returnValue(of({ data: [] }));

    TestBed.configureTestingModule({
      declarations: [BookingFormComponent],
      imports: [HttpClientTestingModule],
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
        { provide: SessionCreditService, useValue: sessionCreditServiceSpy },
        { provide: PromotionService, useValue: promotionServiceSpy },
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

  it('blocks submit with a message when "my own location" is picked but left empty', () => {
    fixture.detectChanges();
    const store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');

    component.onLocationChange({ customLocation: undefined, incomplete: true, fee: null });
    component.submitForm();

    expect(TestBed.inject(SnackBarService).openSnackBar).toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalled();
    expect(component.submitting).toBeFalse();
  });

  it('sends the chosen location with a manual-entry booking', () => {
    fixture.detectChanges();
    const store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    component.availabilityConfigured = false;
    component.bookingForm.patchValue({
      date: '2099-01-01', time: '09:00', durationMinutes: 60,
    });

    component.onLocationChange({ trainerLocationId: 41, customLocation: undefined, incomplete: false, fee: 15 });
    component.submitForm();

    const action: any = (store.dispatch as jasmine.Spy).calls.mostRecent().args[0];
    expect(action.data.trainerLocationId).toBe(41);
    expect(action.data.customLocation).toBeUndefined();
    expect(action.data.trainerId).toBe(1);
  });
});
