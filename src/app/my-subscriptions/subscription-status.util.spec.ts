import { completePaymentLink, subscriptionState, subscriptionStatusClasses, subscriptionStatusLabel } from './subscription-status.util';

describe('subscription status', () => {
  it('maps every server status to what a person sees', () => {
    expect(subscriptionStatusLabel({ status: 'true' })).toBe('Active');
    expect(subscriptionStatusLabel({ status: 'false' })).toBe('Expired');
    expect(subscriptionStatusLabel({ status: 'PENDING_PAYMENT' })).toBe('Awaiting payment');
    expect(subscriptionStatusLabel({ status: 'PAST_DUE' })).toBe('Payment failed');
    expect(subscriptionStatusLabel({ status: 'CANCELLED' })).toBe('Cancelled');
  });

  it('never calls an unpaid checkout "Expired"', () => {
    expect(subscriptionState({ status: 'PENDING_PAYMENT' })).toBe('awaiting_payment');
    expect(subscriptionStatusLabel({ status: 'PENDING_PAYMENT' })).not.toBe('Expired');
  });

  it('reads an unknown or missing status as ended rather than throwing', () => {
    expect(subscriptionState({ status: 'weird' })).toBe('ended');
    expect(subscriptionState(null)).toBe('ended');
    expect(subscriptionState({})).toBe('ended');
  });

  it('gives each state its own colours', () => {
    expect(subscriptionStatusClasses({ status: 'true' })).toContain('green');
    expect(subscriptionStatusClasses({ status: 'PENDING_PAYMENT' })).toContain('amber');
    expect(subscriptionStatusClasses({ status: 'PAST_DUE' })).toContain('red');
    expect(subscriptionStatusClasses({ status: 'false' })).toContain('gray');
  });

  it('links an unpaid package back to its provider\'s Level up page with the package chosen', () => {
    const link = completePaymentLink({ providerPackage: { id: 7 }, trainer: { name: 'Blessed Fit' } } as any);
    expect(link).toEqual({ path: ['/trainers', 'blessed-fit', 'level-up'], query: { plan: 7 } });
    const centerLink = completePaymentLink({ providerPackage: { id: 3 }, center: { name: 'M Fitness Sources' } } as any);
    expect(centerLink?.path).toEqual(['/centers', 'm-fitness-sources', 'level-up']);
  });

  it('has no link when the package or provider is unknown', () => {
    expect(completePaymentLink({ trainer: { name: 'X' } } as any)).toBeNull();
    expect(completePaymentLink({ providerPackage: { id: 1 } } as any)).toBeNull();
    expect(completePaymentLink(null)).toBeNull();
  });
});
