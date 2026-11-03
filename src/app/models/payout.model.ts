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

  /** PENDING | PAID | FAILED */
  status: string;
  stripeTransferId: string | null;

  date: Date;
  lastUpdate: Date;

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
