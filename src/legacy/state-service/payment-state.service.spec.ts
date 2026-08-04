import { TestBed } from '@angular/core/testing';

import { PaymentStateService } from './payment-state.service';

describe('PaymentStateService', () => {
  let service: PaymentStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
