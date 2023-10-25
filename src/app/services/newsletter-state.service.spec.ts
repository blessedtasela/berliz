import { TestBed } from '@angular/core/testing';

import { NewsletterStateService } from './newsletter-state.service';

describe('NewsletterStateService', () => {
  let service: NewsletterStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewsletterStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
