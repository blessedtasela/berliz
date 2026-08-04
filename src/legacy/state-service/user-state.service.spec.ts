import { TestBed } from '@angular/core/testing';

import { UserStateService } from '../../legacy/state-service/user-state.service';

describe('UserStateService', () => {
  let service: UserStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
