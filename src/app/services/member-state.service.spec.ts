import { TestBed } from '@angular/core/testing';

import { MemberStateService } from './member-state.service';

describe('MemberStateService', () => {
  let service: MemberStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MemberStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
