import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import {
  ConnectAccountSummary,
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

  /**
   * "Pay now" for a Shop order. The amount is the order's own `totalAmount` -- the server never
   * takes a price from the client. Redirect the browser to the returned `checkoutUrl`.
   */
  createOrderCheckout(orderId: number): Observable<ApiResponse<StripeCheckoutSessionResponse>> {
    return this.httpClient.post<ApiResponse<StripeCheckoutSessionResponse>>(
      this.url + `/payment/stripe/order-checkout/${orderId}`,
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

  /** Admin-only — refund a payment: all that is left by default, or just `amount` (dollars) for a partial refund. */
  refundPayment(paymentId: number, amount?: number | null): Observable<ApiResponse<{ id?: number; message?: string }>> {
    const query = amount != null ? `?amount=${encodeURIComponent(amount.toFixed(2))}` : '';
    return this.httpClient.post<ApiResponse<{ id?: number; message?: string }>>(
      this.url + `/payment/stripe/refund/${paymentId}${query}`,
      null
    );
  }

  /** Admin only — every provider's cached Connect status, one local query, no live Stripe calls. */
  getAllConnectAccounts(): Observable<ApiResponse<ConnectAccountSummary[]>> {
    return this.httpClient.get<ApiResponse<ConnectAccountSummary[]>>(this.url + '/payment/stripe/connect/accounts');
  }

  /** Admin only — a live Account.retrieve for exactly one provider, refreshing its cached status. */
  refreshConnectAccountStatus(partnerId: number): Observable<ApiResponse<ConnectAccountSummary>> {
    return this.httpClient.put<ApiResponse<ConnectAccountSummary>>(
      this.url + `/payment/stripe/connect/accounts/${partnerId}/refresh`,
      null
    );
  }
}
