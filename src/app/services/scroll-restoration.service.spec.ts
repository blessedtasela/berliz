import { TestBed } from '@angular/core/testing';

import { ScrollRestorationService } from './scroll-restoration.service';

describe('ScrollRestorationService', () => {
  let service: ScrollRestorationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScrollRestorationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
