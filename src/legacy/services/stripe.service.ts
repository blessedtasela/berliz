import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';

export interface StripeCheckoutSessionRequest {
  /** Existing Subscription id this payment is for, if any. */
  subscriptionId?: number;
  /** Amount in whole currency units (e.g. dollars), not cents. */
  amount: number;
  /** ISO currency code, e.g. "usd". Defaults server-side to "usd" when omitted. */
  currency?: string;
  /** Line-item description shown on the Checkout page. */
  productName?: string;
  /** Recurring (mode=subscription) vs one-time (mode=payment). Defaults to one-time. */
  recurring?: boolean;
  successUrl?: string;
  cancelUrl?: string;
}

export interface StripeCheckoutSessionResponse {
  sessionId: string;
  /** Stripe-hosted Checkout URL — redirect the browser here. */
  checkoutUrl: string;
  message?: string;
}

export interface StripeConnectOnboardingRequest {
  country?: string;
  refreshUrl?: string;
  returnUrl?: string;
}

export interface StripeConnectOnboardingResponse {
  accountId: string;
  onboardingUrl: string;
  message?: string;
}

/**
 * Reusable Stripe integration for the frontend. Not wired into any
 * component yet — the Subscription page this would plug into is being
 * rebuilt separately. Integrating it later is meant to be a one-line call:
 *
 *   this.stripeService.redirectToCheckout({ amount: 49.99 }).subscribe();
 */
@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private readonly url = environment.api;
  private stripePromise: Promise<Stripe | null> | null = null;

  constructor(private httpClient: HttpClient) { }

  /**
   * Lazily loads Stripe.js exactly once (memoized) using the publishable
   * key from environment config. Safe to call repeatedly — later callers
   * get the same in-flight/resolved promise.
   */
  getStripe(): Promise<Stripe | null> {
    if (!this.stripePromise) {
      this.stripePromise = this.loadStripeJs();
    }
    return this.stripePromise;
  }

  /** Calls the backend to create a Stripe Checkout Session for the current user. */
  createCheckoutSession(request: StripeCheckoutSessionRequest): Observable<ApiResponse<StripeCheckoutSessionResponse>> {
    return this.httpClient.post<ApiResponse<StripeCheckoutSessionResponse>>(
      `${this.url}/payment/stripe/create-checkout-session`, request);
  }

  /**
   * Creates a Checkout Session on the backend, then redirects the browser
   * to Stripe's hosted Checkout page on success. This is the one-line
   * integration point a "Subscribe"/"Pay" button would call.
   */
  redirectToCheckout(request: StripeCheckoutSessionRequest): Observable<ApiResponse<StripeCheckoutSessionResponse>> {
    return this.createCheckoutSession(request).pipe(
      tap(response => {
        if (response?.data?.checkoutUrl) {
          this.redirect(response.data.checkoutUrl);
        }
      })
    );
  }

  /**
   * Kicks off Stripe Connect Express onboarding for the current user
   * (trainer/center payouts). Future work — no UI calls this yet.
   */
  createConnectOnboardingLink(
    request: StripeConnectOnboardingRequest = {}
  ): Observable<ApiResponse<StripeConnectOnboardingResponse>> {
    return this.httpClient.post<ApiResponse<StripeConnectOnboardingResponse>>(
      `${this.url}/payment/stripe/connect/onboarding-link`, request);
  }

  /** Extracted so tests can stub it without loading real Stripe.js / hitting the network. */
  protected loadStripeJs(): Promise<Stripe | null> {
    return loadStripe(environment.stripePublishableKey);
  }

  /** Extracted so tests can spy on it without triggering a real page navigation. */
  protected redirect(url: string): void {
    window.location.href = url;
  }
}
