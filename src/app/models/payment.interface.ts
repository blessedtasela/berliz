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

  status: string;
  date: Date;
  lastUpdate: Date;

  /** Set once this Stripe payment has been refunded. */
  stripeRefundId?: string | null;
  refundedAt?: Date | null;

  message?: string;
}
