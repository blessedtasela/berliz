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
}

/** Mirrors the backend `StripeCheckoutSessionResponse`. */
export interface StripeCheckoutSessionResponse {
  sessionId: string;
  /** Stripe-hosted Checkout URL — redirect the browser here. */
  checkoutUrl: string;
  message?: string;
}
