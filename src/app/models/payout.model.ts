export interface Payout {
  id: number;

  bookingId: number | null;
  bookingScheduledAt: Date | null;
  bookingDurationMinutes: number | null;

  paymentId: number | null;

  trainerId: number | null;
  trainerName: string | null;

  centerId: number | null;
  centerName: string | null;

  grossAmount: number;
  commissionAmount: number;
  payoutAmount: number;
  commissionRate: number;

  /** PY-19: true once a refund has recomputed this payout's amounts at least once. */
  refundAdjusted?: boolean | null;
  /** What grossAmount was before the first refund adjustment -- only set when refundAdjusted is true. */
  originalGrossAmount?: number | null;

  /** PENDING | PAID | FAILED | UPCOMING */
  status: string;
  /** True only for an UPCOMING row -- the commission rate/amounts can still change before the session completes. */
  estimate?: boolean | null;
  stripeTransferId: string | null;

  date: Date;
  lastUpdate: Date;

  /** PY-22: "AUTOMATIC" (the Sunday sweep) or "MANUAL" (an admin's own "Pay out"). Null until a release has been attempted. */
  releaseMethod?: string | null;
  /** PY-22: why this payout was released -- "Automatic weekly payout" for automatic releases, or the admin's own stated reason for a manual one. */
  releaseReason?: string | null;
  /** PY-22: when this payout actually reached PAID. Null while PENDING/FAILED. */
  paidDate?: Date | null;
  /** PY-22: when the automatic job will next attempt this payout, if it's still PENDING/FAILED (the coming Sunday 00:00 Pacific). Null once PAID. */
  nextScheduledReleaseDate?: Date | null;

  /** BOOKING (a completed session) or ORDER (a shop sale): where the money came from. */
  source?: 'BOOKING' | 'ORDER' | null;
  /** One plain sentence: who paid for what. */
  description?: string | null;

  /** Who booked the session, or bought from the store. */
  clientName?: string | null;
  clientEmail?: string | null;

  bookedAt?: Date | null;
  bookingStatus?: string | null;
  /** SINGLE or TRIAL. */
  sessionType?: string | null;
  locationLabel?: string | null;
  locationFee?: number | null;
  /** What the client paid for this session. */
  clientPaid?: number | null;
  bookingPaymentStatus?: string | null;
  /** Set when the session belongs to a monthly plan. */
  planId?: number | null;
  urgent?: boolean | null;

  paymentMethod?: string | null;
  paidAt?: Date | null;
  /** For a shop sale: the order and the store it was bought from (the earnings view reads both; the backend's PayoutResponse sends them). */
  orderId?: number | null;
  storeName?: string | null;
  orderItemCount?: number | null;

  /** What happened, in order: requested, client paid, session time, share recorded, paid out. */
  events?: { label: string; at: Date }[];

  message?: string;
}

/** PY-22: admin-visible proof the weekly automatic payout job is actually running. */
export interface PayoutScheduleStatus {
  scheduleDescription: string;
  nextRunDate: Date;

  /** Null if the job has never run yet. */
  lastRunDate: Date | null;
  lastRunPaidCount: number | null;
  lastRunSkippedCount: number | null;
  lastRunFailedCount: number | null;
  lastRunFailureDetail: string | null;
}
