/**
 * Mirrors the backend `BillingSummaryResponse` — admin-only billing overview read from Berliz's
 * own local tables (kept in sync by Stripe webhooks), not live Stripe calls.
 *
 * Deliberately NOT Stripe's own MRR definition — `activeRecurringRevenue` is a plain sum of
 * currently-active Subscription.amount, labelled as Berliz's own number, not MRR.
 */
export interface BillingSummary {
  grossPaymentVolumeThisMonth: number;
  activeSubscriptionCount: number;
  activeRecurringRevenue: number;
  payoutsPendingTotal: number;
  payoutsPaidTotal: number;
  refundsThisMonthCount: number;
  refundsThisMonthTotal: number;
}
