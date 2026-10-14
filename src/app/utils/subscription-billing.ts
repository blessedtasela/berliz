import { Subscriptions } from '../models/subscriptions.interface';

/** The two stores that can bill a subscription instead of Stripe. */
export type BillingStore = 'app_store' | 'play_store';

export const BILLING_STORE_LABEL: Record<BillingStore, string> = {
  app_store: 'App Store',
  play_store: 'Google Play',
};

/** Where a person manages or cancels a subscription they bought in each store. */
export const BILLING_STORE_MANAGE_URL: Record<BillingStore, string> = {
  app_store: 'https://apps.apple.com/account/subscriptions',
  play_store: 'https://play.google.com/store/account/subscriptions',
};

/**
 * Which store, if any, bills this subscription -- bought in the iOS or Android app through In-App Purchase
 * rather than on the web through Stripe. Only that store can cancel it or change the plan, so the web must not
 * offer Stripe's cancel / resume / renew for it.
 *
 * The backend sets `store`, and mirrors it into `mode` as APP_STORE / PLAY_STORE (the field the mobile app
 * reads), so either one counts. null means billed by Stripe, or comped by an admin.
 */
export function billingStoreOf(sub: Pick<Subscriptions, 'store' | 'mode'> | null | undefined): BillingStore | null {
  const raw = String(sub?.store || sub?.mode || '').toLowerCase().replace(/[\s-]+/g, '_');
  if (raw === 'app_store' || raw === 'apple') return 'app_store';
  if (raw === 'play_store' || raw === 'google_play' || raw === 'google') return 'play_store';
  return null;
}
