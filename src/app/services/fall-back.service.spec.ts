import { TestBed } from '@angular/core/testing';

import { FallBackService } from './fall-back.service';

describe('FallBackService', () => {
  let service: FallBackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FallBackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
