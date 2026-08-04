import { TestBed } from '@angular/core/testing';

import { ContactUsStateService } from './contact-us-state.service';

describe('ContactUsStateService', () => {
  let service: ContactUsStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactUsStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
