import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentDetailsModalComponent } from './payment-details-modal.component';

describe('PaymentDetailsModalComponent', () => {
  let component: PaymentDetailsModalComponent;
  let fixture: ComponentFixture<PaymentDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentDetailsModalComponent]
    });
    fixture = TestBed.createComponent(PaymentDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
