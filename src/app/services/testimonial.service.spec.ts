import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { TestimonialService } from './testimonial.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('TestimonialService', () => {
  let service: TestimonialService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(TestimonialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
