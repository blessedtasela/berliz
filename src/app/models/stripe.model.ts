/** Mirrors the backend `StripeCheckoutSessionRequest`. */
export interface StripeCheckoutSessionRequest {
  /** Existing Subscription id this payment is for, if any. */
  subscriptionId?: number;
  /** Amount in whole currency units (e.g. dollars), not cents. */
  amount: number;
  /** ISO currency code, e.g. "usd". Defaults to "usd" when omitted. */
  currency?: string;
  /** Line-item description shown on the Checkout page. */
  productName?: string;
  /** Recurring monthly Stripe Subscription instead of a one-time payment. Defaults to false. */
  recurring?: boolean;
  successUrl?: string;
  cancelUrl?: string;
  /** A promo code to take off the first charge of the plan this subscription is for; validated again server-side. */
  discountCode?: string;
}

/** Mirrors the backend `StripeCheckoutSessionResponse`. */
export interface StripeCheckoutSessionResponse {
  sessionId: string;
  /** Stripe-hosted Checkout URL — redirect the browser here. */
  checkoutUrl: string;
  message?: string;
}

/** Mirrors the backend `StripeConnectOnboardingRequest` — all optional. */
export interface StripeConnectOnboardingRequest {
  /** Two-letter country of the connected account; the server defaults to US. Only used when the account is first created. */
  country?: string;
  /** Where Stripe sends the provider if their onboarding link expires. */
  refreshUrl?: string;
  /** Where Stripe sends the provider when they finish (or leave) onboarding. */
  returnUrl?: string;
}

/** Mirrors the backend `StripeConnectOnboardingResponse`. */
export interface StripeConnectOnboardingResponse {
  accountId: string;
  /** A one-time Stripe link: onboarding while setup is unfinished, the Express dashboard once it is complete. Redirect the browser. */
  onboardingUrl: string;
  message?: string;
}

/** Mirrors the backend `StripeConnectStatusResponse`. */
export interface StripeConnectStatus {
  /** False when Stripe isn't configured on the server at all — show nothing. */
  configured: boolean;
  connected: boolean;
  accountId?: string | null;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  /** Details submitted and payouts enabled: transfers to this provider will go through. */
  ready: boolean;
  message?: string;
}
