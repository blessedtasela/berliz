import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { PaymentDetailsModalComponent } from './payment-details-modal.component';

describe('PaymentDetailsModalComponent', () => {
  let component: PaymentDetailsModalComponent;
  let fixture: ComponentFixture<PaymentDetailsModalComponent>;

  beforeEach(() => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [PaymentDetailsModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { paymentData: { date: new Date().toISOString(), lastUpdate: new Date().toISOString() } } }
      ]
    });
    fixture = TestBed.createComponent(PaymentDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  const currency = () => fixture.nativeElement.querySelector('[data-testid="payment-currency"]') as HTMLElement | null;

  it('shows the currency next to the amount for a store purchase, which is in the buyer\'s own currency', () => {
    component.paymentData = { ...component.paymentData, amount: 9.99, currency: 'GBP', paymentMethod: 'apple_iap' } as any;
    fixture.detectChanges();

    expect(currency()?.textContent?.trim()).toBe('GBP');
  });

  it('shows no currency for a Stripe payment, which is in the platform currency', () => {
    component.paymentData = { ...component.paymentData, amount: 115, currency: null, paymentMethod: 'stripe' } as any;
    fixture.detectChanges();

    expect(currency()).toBeNull();
  });
});
