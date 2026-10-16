import { ProviderPackage } from 'src/app/models/provider-package.model';

/**
 * A trainer/center sells three different things, and the client should always know which one they're getting:
 *
 *  - subscription: billed again every month until cancelled (billingType RECURRING)
 *  - pack: a fixed number of sessions, paid once, booked later (sessionCount set)
 *  - membership: paid once for a period of unlimited sessions (no sessionCount, not recurring)
 *
 * A single session is none of these -- it's a request the provider confirms, with no commitment.
 */
export type PlanKind = 'subscription' | 'pack' | 'membership';

type PlanLike = Pick<ProviderPackage, 'billingType' | 'sessionCount'>;

export function planKind(plan: PlanLike): PlanKind {
  if (plan.billingType === 'RECURRING') return 'subscription';
  return plan.sessionCount ? 'pack' : 'membership';
}

export const PLAN_KIND_LABEL: Record<PlanKind, string> = {
  subscription: 'Subscription',
  pack: 'Session pack',
  membership: 'Membership',
};

/** The button on a plan: what pressing it actually does. */
export function planActionLabel(plan: PlanLike): string {
  switch (planKind(plan)) {
    case 'subscription': return 'Subscribe';
    case 'pack': return 'Buy pack';
    default: return 'Get membership';
  }
}

/** Next to the price: "/ month" for a subscription, "one-time" otherwise. */
export function planPriceNote(plan: PlanLike): string {
  return planKind(plan) === 'subscription' ? '/ month' : 'one-time';
}

/** One line on what's included, e.g. "5 sessions" or "Unlimited sessions". */
export function planIncludes(plan: Pick<ProviderPackage, 'billingType' | 'sessionCount' | 'groupSize'>): string {
  const sessions = plan.sessionCount
    ? `${plan.sessionCount} session${plan.sessionCount === 1 ? '' : 's'}`
    : 'Unlimited sessions';
  return plan.groupSize > 1 ? `${sessions} · group of ${plan.groupSize}` : sessions;
}

/** What happens next, in plain words, shown before the client pays. */
export function planCheckoutNote(plan: Pick<ProviderPackage, 'billingType' | 'sessionCount' | 'durationDays'>): string {
  switch (planKind(plan)) {
    case 'subscription':
      return 'You\'re charged now and again every month until you cancel. Cancel any time from My Subscriptions — access runs to the end of the period you paid for.';
    case 'pack':
      return `You pay once now. Then book your sessions whenever suits you — each one uses a session from the pack${plan.durationDays ? `, which is valid for ${plan.durationDays} days` : ''}.`;
    default:
      return `You pay once now for unlimited sessions${plan.durationDays ? ` for ${plan.durationDays} days` : ''}. Book as many as you like while it lasts.`;
  }
}
