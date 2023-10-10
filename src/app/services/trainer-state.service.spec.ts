import { TestBed } from '@angular/core/testing';

import { TrainerStateService } from './trainer-state.service';

describe('TrainerStateServiceService', () => {
  let service: TrainerStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainerStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
