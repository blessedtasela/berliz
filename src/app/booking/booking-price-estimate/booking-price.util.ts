/**
 * An up-front estimate of what a session will cost, using the same arithmetic as the server
 * (BookingPricing) so the number a client sees before booking is the number they are later asked
 * to pay. It is an estimate only -- the price is fixed by the server when the provider confirms.
 */

/** The trial price when a trainer has not set their own (mirrors the server). */
export const DEFAULT_TRIAL_PRICE = 100;

export interface Offer {
  type: string | null | undefined;
  value: number | null | undefined;
}

export interface PriceEstimateInput {
  /** The provider's hourly rate; null/undefined means they can't be priced in-app. */
  hourlyRate: number | null | undefined;
  minutes: number;
  /** The chosen location's fee, if any. Always payable. */
  locationFee?: number | null;
  /** The provider's own promotion being claimed. */
  promotion?: Offer | null;
  /** A Berliz session credit being redeemed. */
  credit?: Offer | null;
  /** The session is covered by a package the client already bought. */
  usesPackage?: boolean;
  /** A trial session is one flat price (not rate x minutes); the price is the trainer's own, else the platform's. */
  sessionType?: 'SINGLE' | 'TRIAL' | null;
  trialPrice?: number | null;
  /** Percent off a first trial for a new member (Berliz-funded); ignored when another reward is used instead. */
  newMemberPercent?: number | null;
  /** What the gym charges at the door. Shown, but paid to the gym: never part of the total. */
  gymDropIn?: number | null;
}

export interface PriceEstimate {
  /** Rate x minutes, before any reward. */
  sessionPrice: number;
  /** What the session part comes to after rewards (0 when a package covers it). */
  sessionAfterRewards: number;
  locationFee: number;
  total: number;
  /** True when a reward or package brought the session part down. */
  discounted: boolean;
  /** The new-member offer taken off a first trial (0 when none). */
  introDiscount: number;
  /** Paid to the gym, on top of the total. */
  gymDropIn: number;
  isTrial: boolean;
}

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export function sessionPrice(hourlyRate: number, minutes: number): number {
  return round2((minutes / 60) * hourlyRate);
}

/** percentage / fixed / free_session reduce the price (never below zero); anything else leaves it as is. */
export function applyOffer(price: number, offer: Offer | null | undefined): number {
  if (!offer || !offer.type) return price;
  const value = offer.value ?? 0;
  let result: number;
  switch (offer.type) {
    case 'percentage': result = price - price * Math.min(Math.max(value, 0), 100) / 100; break;
    case 'fixed': result = price - Math.max(value, 0); break;
    case 'free_session': result = 0; break;
    default: result = price;
  }
  return round2(Math.max(result, 0));
}

/** null when there is no rate to price from. */
export function estimateBookingPrice(input: PriceEstimateInput): PriceEstimate | null {
  const isTrial = input.sessionType === 'TRIAL' && input.trialPrice != null;
  if (!isTrial && (input.hourlyRate == null || !(input.minutes > 0))) return null;

  const base = isTrial ? round2(input.trialPrice as number) : sessionPrice(input.hourlyRate as number, input.minutes);
  let session = base;
  let introDiscount = 0;
  if (input.usesPackage) {
    session = 0;
  } else {
    session = applyOffer(session, input.promotion);
    session = applyOffer(session, input.credit);
    // The first-trial offer is never stacked on another reward.
    const otherReward = !!input.promotion?.type || !!input.credit?.type;
    if (isTrial && !otherReward && input.newMemberPercent) {
      introDiscount = round2(base * Math.min(Math.max(input.newMemberPercent, 0), 100) / 100);
      session = round2(Math.max(session - introDiscount, 0));
    }
  }
  const fee = input.locationFee && input.locationFee > 0 ? input.locationFee : 0;
  return {
    sessionPrice: base,
    sessionAfterRewards: session,
    locationFee: fee,
    total: round2(session + fee),
    discounted: session < base,
    introDiscount,
    gymDropIn: input.gymDropIn && input.gymDropIn > 0 ? round2(input.gymDropIn) : 0,
    isTrial,
  };
}
