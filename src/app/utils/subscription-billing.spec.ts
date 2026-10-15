import { BILLING_STORE_LABEL, BILLING_STORE_MANAGE_URL, billingStoreOf } from './subscription-billing';

describe('billingStoreOf', () => {
  it('reads the store column the backend sets', () => {
    expect(billingStoreOf({ store: 'app_store', mode: '' })).toBe('app_store');
    expect(billingStoreOf({ store: 'play_store', mode: '' })).toBe('play_store');
  });

  it('also reads APP_STORE / PLAY_STORE from `mode`, which is what the mobile app keys on', () => {
    expect(billingStoreOf({ mode: 'APP_STORE' })).toBe('app_store');
    expect(billingStoreOf({ mode: 'PLAY_STORE' })).toBe('play_store');
  });

  it('is tolerant of spacing, hyphens and the other spellings', () => {
    expect(billingStoreOf({ mode: 'App Store' })).toBe('app_store');
    expect(billingStoreOf({ mode: 'play-store' })).toBe('play_store');
    expect(billingStoreOf({ mode: 'google_play' })).toBe('play_store');
    expect(billingStoreOf({ mode: 'apple' })).toBe('app_store');
  });

  it('is null for Stripe-billed and admin-comped subscriptions -- including ordinary `mode` values', () => {
    expect(billingStoreOf({ mode: 'monthly' })).toBeNull();
    expect(billingStoreOf({ mode: 'online' })).toBeNull();
    expect(billingStoreOf({ mode: '' })).toBeNull();
    expect(billingStoreOf({} as any)).toBeNull();
    expect(billingStoreOf(null)).toBeNull();
    expect(billingStoreOf(undefined)).toBeNull();
  });

  it('prefers the explicit store column over mode', () => {
    expect(billingStoreOf({ store: 'play_store', mode: 'APP_STORE' })).toBe('play_store');
  });

  it('has a label and a manage link for each store', () => {
    expect(BILLING_STORE_LABEL.app_store).toBe('App Store');
    expect(BILLING_STORE_LABEL.play_store).toBe('Google Play');
    expect(BILLING_STORE_MANAGE_URL.app_store).toContain('apps.apple.com');
    expect(BILLING_STORE_MANAGE_URL.play_store).toContain('play.google.com');
  });
});
