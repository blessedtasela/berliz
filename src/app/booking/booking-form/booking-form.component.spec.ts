import { provideHttpClientTesting } from '@angular/common/http/testing';
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
import { BookingService } from 'src/app/services/booking.service';
import { selectAvailabilityLoading, selectAvailableSlots } from 'src/app/state/availability/availability.selectors';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

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
    schemas: [NO_ERRORS_SCHEMA],
    imports: [],
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
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
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

  // Regression: a provider with no availability used to get a free date/time picker, so clients could request
  // times the provider never offered.
  it('does not let anyone book a provider who has set no available times', () => {
    fixture.detectChanges();
    const store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    component.availabilityConfigured = false;
    component.bookingForm.patchValue({
      date: '2099-01-01', time: '09:00', durationMinutes: 60,
    });

    component.submitForm();

    expect(store.dispatch).not.toHaveBeenCalled();
    expect(component.submitting).toBeFalse();
  });

  it('sends the chosen location with an urgent booking', () => {
    fixture.detectChanges();
    const bookingService = TestBed.inject(BookingService);
    const createUrgent = spyOn(bookingService, 'createUrgentBooking').and.returnValue(of({ message: 'ok', data: {} } as any));
    component.availabilityConfigured = true;
    component.urgentMode = true;
    component.bookingForm.patchValue({
      date: '2099-01-01', time: '09:00', durationMinutes: 60, notes: 'Competition next week',
    });

    component.onLocationChange({ trainerLocationId: 41, customLocation: undefined, incomplete: false, fee: 15 });
    component.submitForm();

    const payload: any = createUrgent.calls.mostRecent().args[0];
    expect(payload.trainerLocationId).toBe(41);
    expect(payload.customLocation).toBeUndefined();
    expect(payload.trainerId).toBe(1);
    expect(payload.urgent).toBeTrue();
  });
});
