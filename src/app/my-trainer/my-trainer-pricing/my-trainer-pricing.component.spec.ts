import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { MyTrainerPricingComponent } from './my-trainer-pricing.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';

describe('MyTrainerPricingComponent', () => {
  let component: MyTrainerPricingComponent;
  let fixture: ComponentFixture<MyTrainerPricingComponent>;

  beforeEach(() => {
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackBarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const trainerServiceSpy = jasmine.createSpyObj('TrainerService', ['updateTrainerPricing', 'addTrainerPricing']);

    TestBed.configureTestingModule({
      declarations: [MyTrainerPricingComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        DatePipe,
        provideMockStore(),
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackBarServiceSpy },
        { provide: TrainerService, useValue: trainerServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(MyTrainerPricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rounds a floating-point rounding artifact to clean cents when loading values', () => {
    component.updateFormValues({
      id: 1, priceOnline: 799.989990234375 as any, pricePersonal: 59.99 as any, priceHybrid: 79.99 as any,
      discount3Months: 0.029999999999999999 as any, discount6Months: 10, discount9Months: 15, discount12Months: 20,
      discount2Programs: 5,
    } as any);

    expect(component.updateTrainerPricingForm.value.priceOnline).toBe(799.99);
    expect(component.updateTrainerPricingForm.value.discount3Months).toBe(0.03);
  });

  it('rounds a stray decimal to clean cents when saving, even if typed in by the browser', () => {
    const trainerService = TestBed.inject(TrainerService) as any;
    trainerService.updateTrainerPricing.and.returnValue({ subscribe: () => { } });
    (component as any).trainerPricing = { id: 7 };
    component.updateTrainerPricingForm.patchValue({
      priceOnline: 799.989990234375, pricePersonal: 59.99, priceHybrid: 79.99,
      discount3Months: 0.029999999999999999, discount6Months: 10, discount9Months: 15, discount12Months: 20,
      discount2Programs: 5,
    });

    component.updateTrainerPricing();

    expect(trainerService.updateTrainerPricing).toHaveBeenCalledWith(
      jasmine.objectContaining({ priceOnline: 799.99, discount3Months: 0.03 }));
  });
});
