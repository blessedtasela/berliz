import { TestBed } from '@angular/core/testing';

import { TrainerDataService } from './trainer-data.service';

describe('TrainerDataService', () => {
  let service: TrainerDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainerDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
