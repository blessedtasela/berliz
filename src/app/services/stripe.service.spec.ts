import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import {
  StripeCheckoutSessionRequest,
  StripeCheckoutSessionResponse,
  StripeConnectOnboardingResponse,
  StripeService
} from './stripe.service';

describe('StripeService', () => {
  let service: StripeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(StripeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createCheckoutSession posts the request to the backend create-checkout-session endpoint', () => {
    const request: StripeCheckoutSessionRequest = { amount: 100, productName: 'Monthly membership' };
    const mockResponse: ApiResponse<StripeCheckoutSessionResponse> = {
      message: 'Checkout session created successfully',
      success: true,
      statusCode: 200,
      data: { sessionId: 'cs_test_1', checkoutUrl: 'https://checkout.stripe.com/pay/cs_test_1' }
    };

    service.createCheckoutSession(request).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.api}/payment/stripe/create-checkout-session`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockResponse);
  });

  it('redirectToCheckout redirects the browser to the checkout URL returned by the backend', () => {
    const redirectSpy = spyOn<any>(service, 'redirect');
    const mockResponse: ApiResponse<StripeCheckoutSessionResponse> = {
      message: 'ok',
      success: true,
      statusCode: 200,
      data: { sessionId: 'cs_test_2', checkoutUrl: 'https://checkout.stripe.com/pay/cs_test_2' }
    };

    service.redirectToCheckout({ amount: 50 }).subscribe();

    const req = httpMock.expectOne(`${environment.api}/payment/stripe/create-checkout-session`);
    req.flush(mockResponse);

    expect(redirectSpy).toHaveBeenCalledOnceWith('https://checkout.stripe.com/pay/cs_test_2');
  });

  it('redirectToCheckout does not redirect when the backend response has no checkout URL', () => {
    const redirectSpy = spyOn<any>(service, 'redirect');
    const mockResponse = { message: 'failed', success: false, statusCode: 500, data: null } as unknown as ApiResponse<StripeCheckoutSessionResponse>;

    service.redirectToCheckout({ amount: 50 }).subscribe();

    const req = httpMock.expectOne(`${environment.api}/payment/stripe/create-checkout-session`);
    req.flush(mockResponse);

    expect(redirectSpy).not.toHaveBeenCalled();
  });

  it('createConnectOnboardingLink posts to the backend connect onboarding-link endpoint', () => {
    const mockResponse: ApiResponse<StripeConnectOnboardingResponse> = {
      message: 'ok',
      success: true,
      statusCode: 200,
      data: { accountId: 'acct_test_1', onboardingUrl: 'https://connect.stripe.com/setup/e/acct_test_1' }
    };

    service.createConnectOnboardingLink({ country: 'US' }).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.api}/payment/stripe/connect/onboarding-link`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ country: 'US' });
    req.flush(mockResponse);
  });

  it('getStripe memoizes the Stripe.js load — only loads once across repeated calls', async () => {
    // Stub the protected loader instead of the real @stripe/stripe-js loadStripe()
    // so no script tag is injected and no network call to js.stripe.com happens in tests.
    const loadSpy = spyOn<any>(service, 'loadStripeJs').and.resolveTo(null);

    const first = await service.getStripe();
    const second = await service.getStripe();

    expect(loadSpy).toHaveBeenCalledTimes(1);
    expect(first).toBeNull();
    expect(second).toBeNull();
  });
});
