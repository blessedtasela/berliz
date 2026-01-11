import { TestBed } from '@angular/core/testing';

import { LocationFormatterService } from './location-formatter.service';

describe('LocationFormatterService', () => {
  let service: LocationFormatterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocationFormatterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
