import { ONBOARDING_STEPS, emptyOnboarding, labelOf, normaliseDate, normaliseOnboarding } from './client-onboarding.options';

describe('client onboarding options', () => {
  it('reads a date sent as an array or a string', () => {
    expect(normaliseDate([2026, 3, 9])).toBe('2026-03-09');
    expect(normaliseDate('2026-03-09T00:00:00')).toBe('2026-03-09');
    expect(normaliseDate(null)).toBeNull();
  });

  it('never leaves a list undefined and keeps the resume step in range', () => {
    const o = normaliseOnboarding({ currentStep: 99 } as any);
    expect(o.equipment).toEqual([]);
    expect(o.availableDays).toEqual([]);
    expect(o.currentStep).toBe(7);
    expect(normaliseOnboarding({ currentStep: 0 } as any).currentStep).toBe(1);
    expect(normaliseOnboarding(null).started).toBeFalse();
  });

  it('falls back to the stored value for an unknown option', () => {
    expect(labelOf([{ value: 'a', label: 'A' }], 'a')).toBe('A');
    expect(labelOf([{ value: 'a', label: 'A' }], 'zzz')).toBe('zzz');
    expect(labelOf([], '')).toBe('');
  });

  it('has seven steps and an empty profile starts at step 1', () => {
    expect(ONBOARDING_STEPS.length).toBe(7);
    expect(emptyOnboarding().currentStep).toBe(1);
  });
});
