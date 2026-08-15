import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { AddPaymentsModalComponent } from './add-payments-modal.component';
import { PaymentService } from 'src/app/services/payment.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('AddPaymentsModalComponent', () => {
  let component: AddPaymentsModalComponent;
  let fixture: ComponentFixture<AddPaymentsModalComponent>;

  beforeEach(() => {
    const paymentServiceSpy = jasmine.createSpyObj('PaymentService', ['addPayment']);
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [AddPaymentsModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        provideMockStore(),
        { provide: PaymentService, useValue: paymentServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackbarServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(AddPaymentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
