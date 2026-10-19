import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { SubscriptionService } from './subscription.service';
import { environment } from 'src/environments/environment';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(SubscriptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('asks the server to remind a subscriber', () => {
    const http = TestBed.inject(HttpTestingController);
    service.remind(4).subscribe();
    const req = http.expectOne(`${environment.api}/subscription/remind/4`);
    expect(req.request.method).toBe('POST');
    req.flush('{"message":"ok"}');
    http.verify();
  });
});
