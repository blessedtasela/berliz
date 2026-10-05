import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CenterService } from './center.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('CenterService', () => {
  let service: CenterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(CenterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
