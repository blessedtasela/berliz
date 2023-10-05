import { TestBed } from '@angular/core/testing';

import { TrainerSateServiceService } from './trainer-sate-service.service';

describe('TrainerSateServiceService', () => {
  let service: TrainerSateServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainerSateServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
