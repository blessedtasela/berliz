import { TestBed } from '@angular/core/testing';

import { PartnerStateService } from './partner-state.service';

describe('PartnerStateService', () => {
  let service: PartnerStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PartnerStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
