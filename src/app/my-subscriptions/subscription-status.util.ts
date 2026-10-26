import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { nameSlug } from 'src/app/utils/closest-slug';

/**
 * What a subscription's raw `status` means to the person looking at it. The server stores "true" (active), "false" (ended) and
 * three more states: PENDING_PAYMENT (checkout started, nothing paid), PAST_DUE (a renewal failed) and CANCELLED. The screens only
 * knew the first two, so an unpaid checkout read as "Expired" and was missing from every counter.
 */
export type SubscriptionState = 'active' | 'ended' | 'awaiting_payment' | 'payment_failed' | 'cancelled';

export function subscriptionState(sub: { status?: string | null } | null | undefined): SubscriptionState {
  switch ((sub?.status ?? '').toString().toLowerCase()) {
    case 'true': return 'active';
    case 'pending_payment': return 'awaiting_payment';
    case 'past_due': return 'payment_failed';
    case 'cancelled': return 'cancelled';
    default: return 'ended';
  }
}

const LABELS: Record<SubscriptionState, string> = {
  active: 'Active',
  ended: 'Expired',
  awaiting_payment: 'Awaiting payment',
  payment_failed: 'Payment failed',
  cancelled: 'Cancelled',
};

export function subscriptionStatusLabel(sub: { status?: string | null } | null | undefined): string {
  return LABELS[subscriptionState(sub)];
}

/** Pill colours for a state (light and dark). */
export function subscriptionStatusClasses(sub: { status?: string | null } | null | undefined): string {
  switch (subscriptionState(sub)) {
    case 'active':
      return 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900';
    case 'awaiting_payment':
      return 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-100 dark:border-amber-900';
    case 'payment_failed':
      return 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
  }
}

/** Where to finish paying for (or retry) a package: the provider's Level up page with that package pre-selected; null when unknown. */
export function completePaymentLink(sub: Subscriptions | null | undefined): { path: string[]; query: { plan: number } } | null {
  const pkg = sub?.providerPackage as { id?: number } | null | undefined;
  const trainerName = (sub?.trainer as { name?: string } | null | undefined)?.name;
  const centerName = (sub?.center as { name?: string } | null | undefined)?.name;
  if (!pkg?.id || !(trainerName || centerName)) return null;
  return {
    path: [trainerName ? '/trainers' : '/centers', nameSlug((trainerName || centerName) as string), 'level-up'],
    query: { plan: pkg.id },
  };
}
