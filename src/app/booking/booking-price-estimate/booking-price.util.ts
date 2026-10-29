/**
 * An up-front estimate of what a session will cost, using the same arithmetic as the server
 * (BookingPricing) so the number a client sees before booking is the number they are later asked
 * to pay. It is an estimate only -- the price is fixed by the server when the provider confirms.
 */

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
  /**
   * Set for a trial session: its flat price (the trainer's own, else the platform default). Replaces rate x length, and
   * works for a trainer with no hourly rate at all.
   */
  trialPrice?: number | null;
  /** Percent off a first trial for a new member (Berliz-funded), when the client is eligible. */
  introPercent?: number | null;
  /** What the gym charges at the door. Paid to the gym, never part of the Berliz total. */
  dropInFee?: number | null;
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
  trial: boolean;
  /** The new-member offer taken off a first trial (0 when none). */
  introDiscount: number;
  /** The gym's drop-in, paid to the gym (0 when none). */
  dropInFee: number;
  /** What the client pays Berliz now-ish: session after offers plus any travel/location fee. Same as `total`. */
  payable: number;
  /** The real cost of the session: everything payable through Berliz plus the gym's drop-in. */
  totalWithDropIn: number;
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
  const trial = input.trialPrice != null;
  if (!trial && (input.hourlyRate == null || !(input.minutes > 0))) return null;

  const base = trial ? round2(input.trialPrice as number) : sessionPrice(input.hourlyRate as number, input.minutes);
  let session = base;
  if (input.usesPackage) {
    session = 0;
  } else {
    session = applyOffer(session, input.promotion);
    session = applyOffer(session, input.credit);
  }
  // The first-trial offer is Berliz-funded and taken off after promotions and credits, like the server does.
  let introDiscount = 0;
  if (trial && !input.usesPackage && input.introPercent && input.introPercent > 0) {
    introDiscount = Math.min(round2(base * Math.min(input.introPercent, 100) / 100), session);
    session = round2(Math.max(session - introDiscount, 0));
  }
  const fee = input.locationFee && input.locationFee > 0 ? input.locationFee : 0;
  const dropIn = input.dropInFee && input.dropInFee > 0 ? round2(input.dropInFee) : 0;
  const total = round2(session + fee);
  return {
    sessionPrice: base,
    sessionAfterRewards: session,
    locationFee: fee,
    total,
    discounted: session < base,
    trial,
    introDiscount,
    dropInFee: dropIn,
    payable: total,
    totalWithDropIn: round2(total + dropIn),
  };
}
