export interface Payments {
  id: number;

  userId: number;
  userFirstname: string;
  userLastname: string;
  userEmail: string;

  payerId: number;
  payerEmail: string;

  subscriptionId: number;

  paymentMethod: string;
  amount: number;
  /**
   * ISO 4217 code the amount is in. Absent/null means the platform currency (every Stripe payment); set for
   * App Store / Google Play purchases (payment method `apple_iap` / `google_play`), which are charged in the
   * buyer's own currency -- so it must be shown next to the amount.
   */
  currency?: string | null;

  status: string;
  date: Date;
  lastUpdate: Date;

  /** Set once this Stripe payment has been refunded. */
  stripeRefundId?: string | null;
  refundedAt?: Date | null;
  /** Total handed back so far (partial refunds add up), and what can still be refunded. */
  refundedAmount?: number | null;
  refundableAmount?: number | null;

  /** Set for recurring-renewal payments (invoice.paid), null for one-time Checkout/booking payments. */
  stripeInvoiceId?: string | null;
  /** App Store / Google Play purchase id (via RevenueCat), when this payment came from a store instead of Stripe. */
  storeTransactionId?: string | null;

  message?: string;
}
