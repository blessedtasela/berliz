import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { StrapiService } from './strapi.service';

describe('StrapiService', () => {
  let service: StrapiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(StrapiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
