import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { PersonalizedRequestService } from './personalized-request.service';
import { environment } from 'src/environments/environment';

describe('PersonalizedRequestService', () => {
  let service: PersonalizedRequestService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(PersonalizedRequestService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('pays at the Stripe controller\'s real path (/payment/stripe), not a path that does not exist', () => {
    service.checkout(12).subscribe();
    const req = http.expectOne(`${environment.api}/payment/stripe/personalized-request-checkout/12`);
    expect(req.request.method).toBe('POST');
    req.flush({ data: { checkoutUrl: 'https://pay.example/x' } });
  });

  it('submits a request with what the client asked for and offered', () => {
    service.submit(9, 'Back after an injury', 3, 200).subscribe();
    const req = http.expectOne(`${environment.api}/personalizedRequest/submit`);
    expect(req.request.body).toEqual({ trainerId: 9, description: 'Back after an injury', proposedSessions: 3, proposedAmount: 200 });
    req.flush({ data: {} });
  });
});
