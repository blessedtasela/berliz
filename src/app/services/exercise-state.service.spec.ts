import { TestBed } from '@angular/core/testing';

import { ExerciseStateService } from './exercise-state.service';

describe('ExerciseStateService', () => {
  let service: ExerciseStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExerciseStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
