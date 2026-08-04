import { TestBed } from '@angular/core/testing';

import { CenterStateService } from './center-state.service';

describe('CenterStateService', () => {
  let service: CenterStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CenterStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
