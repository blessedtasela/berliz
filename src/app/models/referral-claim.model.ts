/** A specific, still-open bookable slot with a provider who accepts referral-reward sessions. */
export interface ReferralSlotOption {
  /** "yyyy-MM-dd" */
  date: string;
  /** "HH:mm:ss" */
  startTime: string;
  /** "HH:mm:ss" */
  endTime: string;
}

/** A trainer or center that accepts referral-reward bookings, with their open slots over the lookahead window. */
export interface ReferralEligibleProvider {
  trainerId: number | null;
  centerId: number | null;
  name: string;
  address: string | null;
  slots: ReferralSlotOption[];
}

export interface ReferralWaitlistStatus {
  id: number;
  sessionCreditId: number;
  joinedDate: string;
  notifiedDate: string | null;
  message?: string;
}
