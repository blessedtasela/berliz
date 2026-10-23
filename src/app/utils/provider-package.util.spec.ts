import { groupPlansByKind, planActionLabel, planCheckoutNote, planIncludes, planKind, planPriceNote } from './provider-package.util';

describe('provider-package util', () => {
  const pack = { billingType: 'ONE_TIME' as const, sessionCount: 5 };
  const membership = { billingType: 'ONE_TIME' as const, sessionCount: null };
  const subscription = { billingType: 'RECURRING' as const, sessionCount: null };

  it('tells a session pack, a membership and a subscription apart', () => {
    expect(planKind(pack)).toBe('pack');
    expect(planKind(membership)).toBe('membership');
    expect(planKind(subscription)).toBe('subscription');
  });

  it('treats a recurring plan as a subscription even when it has a session count', () => {
    expect(planKind({ billingType: 'RECURRING', sessionCount: 8 })).toBe('subscription');
  });

  it('labels the button by what it does', () => {
    expect(planActionLabel(pack)).toBe('Buy pack');
    expect(planActionLabel(subscription)).toBe('Subscribe');
    expect(planActionLabel(membership)).toBe('Get membership');
  });

  it('says "/ month" only for a subscription', () => {
    expect(planPriceNote(subscription)).toBe('/ month');
    expect(planPriceNote(pack)).toBe('one-time');
    expect(planPriceNote(membership)).toBe('one-time');
  });

  it('says what is included', () => {
    expect(planIncludes({ ...pack, groupSize: 1 })).toBe('5 sessions');
    expect(planIncludes({ billingType: 'ONE_TIME', sessionCount: 1, groupSize: 1 })).toBe('1 session');
    expect(planIncludes({ ...subscription, groupSize: 1 })).toBe('Unlimited sessions');
    expect(planIncludes({ ...pack, groupSize: 3 })).toBe('5 sessions · group of 3');
  });

  it('explains what happens after paying, in the words of that kind of plan', () => {
    expect(planCheckoutNote({ ...subscription, durationDays: null })).toContain('every month until you cancel');
    expect(planCheckoutNote({ ...pack, durationDays: 60 })).toContain('valid for 60 days');
    expect(planCheckoutNote({ ...pack, durationDays: null })).not.toContain('valid for');
    expect(planCheckoutNote({ ...membership, durationDays: 30 })).toContain('unlimited sessions for 30 days');
  });

  it('groups plans by kind in a fixed order, skipping kinds that are not sold', () => {
    const plans = [
      { id: 1, ...membership },
      { id: 2, ...pack },
      { id: 3, ...pack },
    ];

    const groups = groupPlansByKind(plans);

    expect(groups.map(g => g.kind)).toEqual(['pack', 'membership']);
    expect(groups[0].plans.map(p => p.id)).toEqual([2, 3]);
  });

  it('puts the subscription first', () => {
    const groups = groupPlansByKind([{ id: 1, ...pack }, { id: 2, ...subscription }]);

    expect(groups.map(g => g.kind)).toEqual(['subscription', 'pack']);
  });
});
