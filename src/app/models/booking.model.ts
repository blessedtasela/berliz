export interface Booking {
  id: number;

  clientId: number;
  clientFirstname: string;
  clientLastname: string;
  clientEmail: string;
  clientUsername?: string;
  clientPhoto?: string;

  trainerId: number | null;
  trainerName: string | null;

  centerId: number | null;
  centerName: string | null;

  scheduledAt: Date;
  durationMinutes: number;

  /** pending | confirmed | cancelled | completed | no_show */
  status: string;
  notes: string;

  /** True when the client explicitly requested a time outside the provider's normal lead-time/availability rules. */
  isUrgent?: boolean;

  /** Where the session happens (a listed location, or the client's own address); null when none was chosen. Snapshotted at booking time. */
  locationLabel?: string | null;
  /** Surcharge that applied to that location when the booking was made; null/0 means none. */
  locationFee?: number | null;
  /** True when the client supplied their own location rather than picking a listed one. */
  locationCustom?: boolean | null;

  /** What the client owes for this session (price + location fee, less rewards); set when the provider confirms it. */
  amountDue?: number | null;
  /** null (never priced / provider has no rate) | NOT_REQUIRED | UNPAID | PAID | REFUNDED | PARTIALLY_REFUNDED. */
  paymentStatus?: 'NOT_REQUIRED' | 'UNPAID' | 'PAID' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | null;
  /** The cancellation policy that applies to this session (the provider's, pinned at confirmation, or the platform default). */
  freeCancelHours?: number | null;
  lateCancelRefundPercent?: number | null;
  /** Net amount paid so far, after refunds. */
  amountPaid?: number | null;
  /** What still has to be paid right now: all of it, or only the difference after a paid session was extended. 0 when nothing is owed. */
  balanceDue?: number | null;
  /** While confirmed and unpaid: the moment it is cancelled automatically for non-payment. */
  paymentDueAt?: Date | null;

  date: Date;
  lastUpdate: Date;

  /** Present only when a reward was redeemed against this booking, e.g. "Free session (redeemed reward)" or "20% off -- New member special". */
  appliedRewardLabel?: string | null;

  message?: string;
}

/** One entry in a provider's "my clients" list — GET /booking/myClients. Picker for "book on behalf of a client". */
export interface MyClientSummary {
  userId: number;
  name: string;
  email: string;
  photo?: string;
  status: string;
  lastBookingAt: Date;
  bookingCount: number;
}
