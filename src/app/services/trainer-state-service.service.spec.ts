import { TestBed } from '@angular/core/testing';

import { TrainerStateServiceService } from './trainer-state-service.service';

describe('TrainerStateServiceService', () => {
  let service: TrainerStateServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainerStateServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
