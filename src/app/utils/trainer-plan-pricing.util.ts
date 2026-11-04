import { TrainerPricing } from 'src/app/models/trainers.interface';

/**
 * A trainer's monthly plans (online / hybrid / personal). The price the page shows is worked out here with the same arithmetic
 * the server uses to charge it (TrainerPlanPricing.java): the monthly rate, less the commitment discount for 3, 6, 9 or 12
 * months, times the months, less the "two programs" discount once. The server never trusts this number; it prices again.
 */
export type TrainerPlanMode = 'online' | 'hybrid' | 'personal';

export const TRAINER_PLAN_MODES: { mode: TrainerPlanMode; label: string; blurb: string }[] = [
  { mode: 'online', label: 'Online', blurb: 'Programs and check-ins remotely.' },
  { mode: 'hybrid', label: 'Hybrid', blurb: 'A mix of online coaching and in-person sessions.' },
  { mode: 'personal', label: 'Personal', blurb: 'One-to-one, in person.' },
];

export const TRAINER_PLAN_MONTHS = [1, 3, 6, 9, 12];

export interface TrainerPlanQuote {
  mode: TrainerPlanMode;
  months: number;
  monthlyRate: number;
  commitmentPercent: number;
  monthlyAfterDiscount: number;
  twoProgramsOff: number;
  total: number;
}

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const clampPercent = (p: unknown): number => Math.min(100, Math.max(0, num(p)));

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

/** The monthly rate the trainer set for a mode, or null when they do not offer it. */
export function monthlyRate(pricing: TrainerPricing | null | undefined, mode: TrainerPlanMode): number | null {
  if (!pricing) return null;
  const raw = mode === 'online' ? pricing.priceOnline : mode === 'hybrid' ? pricing.priceHybrid : pricing.pricePersonal;
  const rate = num(raw);
  return rate > 0 ? rate : null;
}

/** The modes this trainer actually prices, in a fixed order. */
export function offeredModes(pricing: TrainerPricing | null | undefined): typeof TRAINER_PLAN_MODES {
  return TRAINER_PLAN_MODES.filter(m => monthlyRate(pricing, m.mode) != null);
}

export function commitmentPercent(pricing: TrainerPricing, months: number): number {
  switch (months) {
    case 3: return clampPercent(pricing.discount3Months);
    case 6: return clampPercent(pricing.discount6Months);
    case 9: return clampPercent(pricing.discount9Months);
    case 12: return clampPercent(pricing.discount12Months);
    default: return 0;
  }
}

/** Null when the trainer does not offer the mode or the months are not one of 1, 3, 6, 9, 12. */
export function trainerPlanQuote(pricing: TrainerPricing | null | undefined, mode: TrainerPlanMode, months: number, twoPrograms: boolean): TrainerPlanQuote | null {
  if (!TRAINER_PLAN_MONTHS.includes(months)) return null;
  const rate = monthlyRate(pricing, mode);
  if (!pricing || rate == null) return null;

  const commitment = commitmentPercent(pricing, months);
  const monthly = round2(rate - (rate * commitment) / 100);
  const twoOff = twoPrograms ? round2((rate * clampPercent(pricing.discount2Programs)) / 100) : 0;
  const total = Math.max(0, round2(monthly * months - twoOff));
  return { mode, months, monthlyRate: round2(rate), commitmentPercent: commitment, monthlyAfterDiscount: monthly, twoProgramsOff: twoOff, total };
}

/** Every amount carries its currency: CA$285.00. */
export function caMoney(amount: number): string {
  return `CA$${amount.toFixed(2)}`;
}
