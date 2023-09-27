import { TestBed } from '@angular/core/testing';

import { ResolverDataService } from './resolver-data.service';

describe('ResolverDataService', () => {
  let service: ResolverDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResolverDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
