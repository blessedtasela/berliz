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
    const loaderSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const trainerServiceSpy = jasmine.createSpyObj('TrainerService', ['updateTrainerPricing', 'addTrainerPricing']);

    TestBed.configureTestingModule({
      declarations: [MyTrainerPricingComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        DatePipe,
        provideMockStore(),
        { provide: NgxUiLoaderService, useValue: loaderSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
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
});
