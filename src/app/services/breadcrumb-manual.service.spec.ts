import { TestBed } from '@angular/core/testing';

import { BreadcrumbManualService } from './breadcrumb-manual.service';

describe('BreadcrumbManualService', () => {
  let service: BreadcrumbManualService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BreadcrumbManualService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
