import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { StrapiService } from './strapi.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StrapiService', () => {
  let service: StrapiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(StrapiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
