import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import {
  StripeCheckoutSessionRequest, StripeCheckoutSessionResponse,
  StripeConnectOnboardingRequest, StripeConnectOnboardingResponse, StripeConnectStatus
} from '../models/stripe.model';

/** Stripe Checkout — mirrors `StripePaymentRest` on the backend. */
@Injectable({
  providedIn: 'root'
})
export class StripeService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  /** Creates a Checkout Session and returns its hosted URL — redirect the browser there (`window.location.href = response.checkoutUrl`), don't just navigate the Angular router. */
  createCheckoutSession(request: StripeCheckoutSessionRequest): Observable<ApiResponse<StripeCheckoutSessionResponse>> {
    return this.httpClient.post<ApiResponse<StripeCheckoutSessionResponse>>(
      this.url + '/payment/stripe/create-checkout-session',
      request
    );
  }

  /**
   * "Pay now" for one confirmed session. The amount is the booking's own `amountDue` -- the server
   * never takes a price from the client. Redirect the browser to the returned `checkoutUrl`.
   */
  createBookingCheckout(bookingId: number): Observable<ApiResponse<StripeCheckoutSessionResponse>> {
    return this.httpClient.post<ApiResponse<StripeCheckoutSessionResponse>>(
      this.url + `/payment/stripe/booking-checkout/${bookingId}`,
      null
    );
  }

  /** Whether the signed-in trainer/center has finished setting up payouts. Safe to call on every page load. */
  getConnectStatus(): Observable<ApiResponse<StripeConnectStatus>> {
    return this.httpClient.get<ApiResponse<StripeConnectStatus>>(this.url + '/payment/stripe/connect/status');
  }

  /**
   * A Stripe link to set up (or, once done, manage) payouts. The server keeps ONE Connect account per
   * provider and reuses it, so calling this again is safe. Redirect the browser to `onboardingUrl`.
   */
  createConnectOnboardingLink(request: StripeConnectOnboardingRequest = {}): Observable<ApiResponse<StripeConnectOnboardingResponse>> {
    return this.httpClient.post<ApiResponse<StripeConnectOnboardingResponse>>(this.url + '/payment/stripe/connect/onboarding-link', request);
  }

  /** Admin-only — full Stripe refund of a payment. */
  refundPayment(paymentId: number): Observable<ApiResponse<{ id?: number; message?: string }>> {
    return this.httpClient.post<ApiResponse<{ id?: number; message?: string }>>(
      this.url + `/payment/stripe/refund/${paymentId}`,
      null
    );
  }
}
