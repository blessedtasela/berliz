import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { PaymentDetailPageComponent } from './payment-detail-page.component';
import { selectPayments } from 'src/app/state/payment/payment.selectors';

describe('PaymentDetailPageComponent', () => {
  let component: PaymentDetailPageComponent;
  let fixture: ComponentFixture<PaymentDetailPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentDetailPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore({ selectors: [{ selector: selectPayments, value: [] }] }),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } }
      ]
    });

    fixture = TestBed.createComponent(PaymentDetailPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
