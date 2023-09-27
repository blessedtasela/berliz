import { TestBed } from '@angular/core/testing';

import { InitializeDataService } from './initialize-data.service';

describe('InitializeDataService', () => {
  let service: InitializeDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InitializeDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
