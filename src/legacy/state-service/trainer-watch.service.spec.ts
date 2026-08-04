import { TestBed } from '@angular/core/testing';

import { TrainerWatchService } from './trainer-watch.service';

describe('TrainerWatchService', () => {
  let service: TrainerWatchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainerWatchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
