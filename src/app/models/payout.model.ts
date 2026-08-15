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

  message?: string;
}
