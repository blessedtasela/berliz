import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { StripeService } from './stripe.service';
import { environment } from 'src/environments/environment';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StripeService', () => {
  let service: StripeService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [], providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()] });
    service = TestBed.inject(StripeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('starts a booking checkout with no client-supplied amount', () => {
    let checkoutUrl: string | undefined;
    service.createBookingCheckout(50).subscribe(res => checkoutUrl = res.data.checkoutUrl);

    const req = http.expectOne(`${environment.api}/payment/stripe/booking-checkout/50`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush({ data: { sessionId: 'cs_1', checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_1' } });

    expect(checkoutUrl).toBe('https://checkout.stripe.com/c/pay/cs_1');
  });

  it('refunds the whole payment when no amount is given', () => {
    service.refundPayment(9).subscribe();
    const req = http.expectOne(`${environment.api}/payment/stripe/refund/9`);
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'ok' });
  });

  it('refunds just the part asked for, to the cent', () => {
    service.refundPayment(9, 4.5).subscribe();
    const req = http.expectOne(`${environment.api}/payment/stripe/refund/9?amount=4.50`);
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'ok' });
  });
});
