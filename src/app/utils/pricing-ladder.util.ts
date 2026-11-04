/**
 * The maths behind a trainer's pricing, kept out of any screen so it can be checked rule by rule.
 *
 * A trainer sets a per-session rate for each volume (a single session, a 5-pack, a 10-pack, 15 or more) in each tier
 * (in person, hybrid, online). Everything else is derived: pack totals, the monthly total at N sessions a month, and
 * commitment discounts. Three rules hold throughout:
 *  - **Floors.** No rate goes below its tier's floor (in person CA$70, hybrid CA$59.99, online CA$49.99). A floor is a
 *    minimum, never a price: a trainer's own rate can be higher.
 *  - **Ladder.** More sessions never cost more per session than fewer: single >= 5-pack >= 10-pack >= 15+.
 *  - **Defaults.** Until a trainer sets their own, every rate starts at its tier's floor. Nobody's real prices are baked in.
 */
export type PricingTier = 'IN_PERSON' | 'HYBRID' | 'ONLINE';

export const PRICING_TIERS: PricingTier[] = ['IN_PERSON', 'HYBRID', 'ONLINE'];

export const TIER_LABEL: Record<PricingTier, string> = { IN_PERSON: 'In person', HYBRID: 'Hybrid', ONLINE: 'Online' };

/** The minimum per-session price in each tier, in CAD. */
export const TIER_FLOOR: Record<PricingTier, number> = { IN_PERSON: 70, HYBRID: 59.99, ONLINE: 49.99 };

/** Where each volume band starts. */
export const PACK_SIZES = { five: 5, ten: 10, fifteen: 15 } as const;

/** Per-session rates by volume. */
export interface Ladder {
  single: number;
  five: number;
  ten: number;
  fifteen: number;
}

export const LADDER_STEPS: { key: keyof Ladder; label: string }[] = [
  { key: 'single', label: 'Single session' },
  { key: 'five', label: '5 sessions' },
  { key: 'ten', label: '10 sessions' },
  { key: 'fifteen', label: '15+ sessions' },
];

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

/** The starting ladder for a tier: every rate at the floor. */
export function defaultLadder(tier: PricingTier): Ladder {
  const floor = TIER_FLOOR[tier];
  return { single: floor, five: floor, ten: floor, fifteen: floor };
}

/** Which per-session rate applies to a purchase of this many sessions. */
export function rateFor(ladder: Ladder, sessions: number): number {
  if (sessions >= PACK_SIZES.fifteen) return ladder.fifteen;
  if (sessions >= PACK_SIZES.ten) return ladder.ten;
  if (sessions >= PACK_SIZES.five) return ladder.five;
  return ladder.single;
}

/** What `sessions` sessions cost together, at the rate for that volume. */
export function packTotal(ladder: Ladder, sessions: number): number {
  return round2(rateFor(ladder, sessions) * Math.max(0, Math.floor(sessions)));
}

/** A month at `sessionsPerMonth` sessions: that many sessions, each at the rate for that volume. */
export function monthlyTotal(ladder: Ladder, sessionsPerMonth: number): number {
  return packTotal(ladder, sessionsPerMonth);
}

/** A commitment of `months` months with `discountPercent` off the whole. */
export function commitmentTotal(monthly: number, months: number, discountPercent: number): number {
  const pct = Math.min(Math.max(discountPercent, 0), 100);
  return round2(monthly * Math.max(0, months) * (1 - pct / 100));
}

/** What one session costs inside a total (for "CA$80.00 each" next to a pack). */
export function perSession(total: number, sessions: number): number {
  return sessions > 0 ? round2(total / sessions) : 0;
}

export interface LadderIssue {
  /** The rate at fault. */
  key: keyof Ladder;
  kind: 'BELOW_FLOOR' | 'LADDER_BREAK';
  message: string;
}

/**
 * Every way this ladder breaks the rules, in plain words. Empty when it is fine. Reported with every pricing change
 * so a plan can never end up costing more per session than a smaller one.
 */
export function checkLadder(tier: PricingTier, ladder: Ladder): LadderIssue[] {
  const floor = TIER_FLOOR[tier];
  const issues: LadderIssue[] = [];

  for (const { key, label } of LADDER_STEPS) {
    if (ladder[key] < floor) {
      issues.push({ key, kind: 'BELOW_FLOOR', message: `${label} is below the ${TIER_LABEL[tier].toLowerCase()} minimum of CA$${floor.toFixed(2)} per session.` });
    }
  }

  for (let i = 1; i < LADDER_STEPS.length; i++) {
    const smaller = LADDER_STEPS[i - 1];
    const larger = LADDER_STEPS[i];
    if (ladder[larger.key] > ladder[smaller.key]) {
      issues.push({
        key: larger.key,
        kind: 'LADDER_BREAK',
        message: `${larger.label} (CA$${ladder[larger.key].toFixed(2)} each) costs more per session than ${smaller.label.toLowerCase()} (CA$${ladder[smaller.key].toFixed(2)} each). More sessions must never cost more per session.`,
      });
    }
  }
  return issues;
}

/** True when a ladder follows every rule. */
export function ladderIsValid(tier: PricingTier, ladder: Ladder): boolean {
  return checkLadder(tier, ladder).length === 0;
}

/**
 * Compares tiers at the same volume: a tier that is meant to be pricier (in person over hybrid over online) should not
 * come out cheaper at the same number of sessions. Returns a warning per violation; it is advice, not a hard rule,
 * because a trainer may price tiers however they like as long as each ladder is itself valid.
 */
export function tierOrderWarnings(ladders: Record<PricingTier, Ladder>, sessions: number): string[] {
  const order: PricingTier[] = ['IN_PERSON', 'HYBRID', 'ONLINE'];
  const warnings: string[] = [];
  for (let i = 1; i < order.length; i++) {
    const pricier = order[i - 1];
    const cheaper = order[i];
    const a = rateFor(ladders[pricier], sessions);
    const b = rateFor(ladders[cheaper], sessions);
    if (a < b) {
      warnings.push(`At ${sessions} sessions, ${TIER_LABEL[pricier].toLowerCase()} (CA$${a.toFixed(2)} each) costs less than ${TIER_LABEL[cheaper].toLowerCase()} (CA$${b.toFixed(2)} each).`);
    }
  }
  return warnings;
}
