import { TestBed } from '@angular/core/testing';

import { MuscleGroupStateService } from './muscle-group-state.service';

describe('MuscleGroupStateService', () => {
  let service: MuscleGroupStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MuscleGroupStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
