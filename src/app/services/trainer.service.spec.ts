import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { TrainerService } from './trainer.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('TrainerService', () => {
  let service: TrainerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(TrainerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
