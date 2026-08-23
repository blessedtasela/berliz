import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { MuscleGroupService } from './muscle-group.service';

describe('MuscleGroupService', () => {
  let service: MuscleGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(MuscleGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
