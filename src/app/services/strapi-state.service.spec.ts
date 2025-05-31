import { TestBed } from '@angular/core/testing';

import { StrapiStateService } from './strapi-state.service';

describe('StrapiStateService', () => {
  let service: StrapiStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StrapiStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
