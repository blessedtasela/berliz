import { ProviderPackage } from 'src/app/models/provider-package.model';
import { caMoney } from 'src/app/utils/trainer-plan-pricing.util';

/**
 * A trainer/center sells three different things, and the client should always know which one they're getting:
 *
 *  - subscription: billed again every month until cancelled (billingType RECURRING)
 *  - pack: a fixed number of sessions, paid once, booked later (sessionCount set)
 *  - membership: paid once for a period of unlimited sessions (no sessionCount, not recurring)
 *
 * A single session is none of these -- it's a request the provider confirms, with no commitment.
 */
export type PlanKind = 'weekly' | 'subscription' | 'pack' | 'membership';

type PlanLike = Pick<ProviderPackage, 'billingType' | 'sessionCount'> & { sessionsPerWeek?: number | null };

export function planKind(plan: PlanLike): PlanKind {
  if (plan.sessionsPerWeek) return 'weekly';
  if (plan.billingType === 'RECURRING') return 'subscription';
  return plan.sessionCount ? 'pack' : 'membership';
}

export const PLAN_KIND_LABEL: Record<PlanKind, string> = {
  weekly: 'Weekly plan',
  subscription: 'Subscription',
  pack: 'Session pack',
  membership: 'Membership',
};

/** The button on a plan: what pressing it actually does. */
export function planActionLabel(plan: PlanLike): string {
  switch (planKind(plan)) {
    case 'weekly': return 'Subscribe';
    case 'subscription': return 'Subscribe';
    case 'pack': return 'Buy pack';
    default: return 'Get membership';
  }
}

/** Next to the price: "/ month" for a subscription, "one-time" otherwise. */
export function planPriceNote(plan: PlanLike): string {
  const kind = planKind(plan);
  if (kind === 'weekly') return plan.billingType === 'RECURRING' ? '/ month, renews' : 'per term';
  return kind === 'subscription' ? '/ month' : 'one-time';
}

/** One line on what's included, e.g. "5 sessions" or "Unlimited sessions". */
export function planIncludes(plan: Pick<ProviderPackage, 'billingType' | 'sessionCount' | 'groupSize'> & { sessionsPerWeek?: number | null }): string {
  if (plan.sessionsPerWeek) return `${plan.sessionsPerWeek} session${plan.sessionsPerWeek === 1 ? '' : 's'} a week at fixed times${plan.sessionCount ? ` · ${plan.sessionCount} sessions` : ''}`;
  const sessions = plan.sessionCount
    ? `${plan.sessionCount} session${plan.sessionCount === 1 ? '' : 's'}`
    : 'Unlimited sessions';
  return plan.groupSize > 1 ? `${sessions} · group of ${plan.groupSize}` : sessions;
}

/** What happens next, in plain words, shown before the client pays. */
export function planCheckoutNote(plan: Pick<ProviderPackage, 'billingType' | 'sessionCount' | 'durationDays'> & { sessionsPerWeek?: number | null }): string {
  switch (planKind(plan)) {
    case 'weekly':
      return `You pay now${plan.billingType === 'RECURRING' ? ' and again each month until you cancel' : ' for the whole term'}. Then you choose your weekly days and times and your sessions are booked and held for you every week. You can pause or cancel any time from Weekly subscriptions.`;
    case 'subscription':
      return 'You\'re charged now and again every month until you cancel. Cancel any time from My Subscriptions — access runs to the end of the period you paid for.';
    case 'pack':
      return `You pay once now. Then book your sessions whenever suits you — each one uses a session from the pack${plan.durationDays ? `, which is valid for ${plan.durationDays} days` : ''}.`;
    default:
      return `You pay once now for unlimited sessions${plan.durationDays ? ` for ${plan.durationDays} days` : ''}. Book as many as you like while it lasts.`;
  }
}

/** How a plan's price is shown (owner rule, Nov 2026): the amount per session after any discount and how many sessions, not the lump total -- ported to mobile's utils/provider-package.ts (same wording). */
export interface PlanPriceView {
  /** "CA$18" -- per session when the plan has a session count, otherwise the plan price itself. */
  amount: string;
  /** "/ session", or whatever {@link planPriceNote} says when there's no session count to divide by. */
  note: string;
  /** "5 sessions" ("5 sessions a month" for a subscription), or "Unlimited sessions". */
  sessions: string;
  /** What is actually charged, in small print: "Paid once: CA$90" / "Billed CA$90 every month". Empty when the headline already is the price. */
  charged: string;
  /** "Save 10% on every session vs CA$20 for a single one", when the provider's single-session rate is known and higher. */
  saving: string | null;
}

type PricedPlanLike = PlanLike & { price: number };

/** @param singleSessionRate The provider's plain single-session rate (hourlyRate), for the "Save X% vs a single session" comparison -- omit or pass null/0 when it isn't known. */
export function planPriceView(plan: PricedPlanLike, singleSessionRate?: number | null): PlanPriceView {
  const count = plan.sessionCount ?? 0;
  if (count <= 0) {
    return { amount: caMoney(plan.price), note: planPriceNote(plan), sessions: 'Unlimited sessions', charged: '', saving: null };
  }

  const recurring = planKind(plan) === 'subscription';
  const each = Math.round((plan.price / count) * 100) / 100;
  const single = Number(singleSessionRate ?? 0);
  const pct = single > 0 && each < single ? Math.round(((single - each) / single) * 100) : 0;

  return {
    amount: caMoney(each),
    note: '/ session',
    sessions: `${count} session${count === 1 ? '' : 's'}${recurring ? ' a month' : ''}`,
    charged: recurring ? `Billed ${caMoney(plan.price)} every month` : `Paid once: ${caMoney(plan.price)}`,
    saving: pct > 0 ? `Save ${pct}% on every session vs ${caMoney(single)} for a single one` : null,
  };
}

/** The order the Level Up page lists them in: the ongoing commitment first, then the one-off buys. */
export const PLAN_KIND_ORDER: PlanKind[] = ['weekly', 'subscription', 'pack', 'membership'];

/** One line under each group's heading, saying how that kind is billed and used. */
export const PLAN_KIND_BLURB: Record<PlanKind, string> = {
  weekly: 'Fixed days and times every week, booked and held for you.',
  subscription: 'Billed every month until you cancel.',
  pack: 'Pay once, then book your sessions whenever suits you.',
  membership: 'Pay once for unlimited sessions over a set period.',
};

export interface PlanGroup<T extends PlanLike = ProviderPackage> {
  kind: PlanKind;
  plans: T[];
}

/** Plans split by kind, in {@link PLAN_KIND_ORDER}, skipping kinds the provider doesn't sell. Keeps each group's incoming order. */
export function groupPlansByKind<T extends PlanLike>(plans: T[]): PlanGroup<T>[] {
  return PLAN_KIND_ORDER
    .map(kind => ({ kind, plans: plans.filter(p => planKind(p) === kind) }))
    .filter(group => group.plans.length > 0);
}
