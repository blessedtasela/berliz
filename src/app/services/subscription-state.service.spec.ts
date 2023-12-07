import { TestBed } from '@angular/core/testing';

import { SubscriptionStateService } from './subscription-state.service';

describe('SubscriptionStateService', () => {
  let service: SubscriptionStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubscriptionStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
