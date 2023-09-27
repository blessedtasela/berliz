import { TestBed } from '@angular/core/testing';

import { PartnerDataService } from './partner-data.service';

describe('PartnerDataService', () => {
  let service: PartnerDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PartnerDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
