import { TestBed } from '@angular/core/testing';

import { TestimonialStateService } from './testimonial-state.service';

describe('TestimonialStateService', () => {
  let service: TestimonialStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestimonialStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
