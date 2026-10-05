import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { MuscleGroupService } from './muscle-group.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('MuscleGroupService', () => {
  let service: MuscleGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(MuscleGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
