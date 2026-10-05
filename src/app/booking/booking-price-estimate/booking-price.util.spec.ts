import { applyOffer, estimateBookingPrice, sessionPrice } from './booking-price.util';

describe('booking-price.util', () => {
  it('prices a session by minutes', () => {
    expect(sessionPrice(100, 60)).toBe(100);
    expect(sessionPrice(100, 30)).toBe(50);
    expect(sessionPrice(100, 90)).toBe(150);
    expect(sessionPrice(33.33, 45)).toBe(25);
  });

  it('applies each offer type and never goes below zero', () => {
    expect(applyOffer(100, { type: 'percentage', value: 20 })).toBe(80);
    expect(applyOffer(100, { type: 'percentage', value: 150 })).toBe(0);
    expect(applyOffer(100, { type: 'fixed', value: 30 })).toBe(70);
    expect(applyOffer(100, { type: 'fixed', value: 500 })).toBe(0);
    expect(applyOffer(100, { type: 'free_session', value: null })).toBe(0);
    expect(applyOffer(100, { type: 'custom', value: 99 })).toBe(100);
    expect(applyOffer(100, null)).toBe(100);
  });

  it('adds the location fee to the session price', () => {
    const e = estimateBookingPrice({ hourlyRate: 100, minutes: 60, locationFee: 15 })!;
    expect(e.sessionPrice).toBe(100);
    expect(e.locationFee).toBe(15);
    expect(e.total).toBe(115);
    expect(e.discounted).toBeFalse();
  });

  it('applies the provider promotion and then a credit, but never discounts the location fee', () => {
    const e = estimateBookingPrice({
      hourlyRate: 100, minutes: 60, locationFee: 10,
      promotion: { type: 'percentage', value: 20 },
      credit: { type: 'fixed', value: 30 },
    })!;
    expect(e.sessionAfterRewards).toBe(50);   // 100 -> 80 -> 50
    expect(e.total).toBe(60);
    expect(e.discounted).toBeTrue();
  });

  it('charges only the location fee when a package covers the session', () => {
    const e = estimateBookingPrice({ hourlyRate: 100, minutes: 60, locationFee: 10, usesPackage: true })!;
    expect(e.sessionAfterRewards).toBe(0);
    expect(e.total).toBe(10);
  });

  it('a free session credit leaves just the location fee', () => {
    const e = estimateBookingPrice({ hourlyRate: 100, minutes: 60, locationFee: 10, credit: { type: 'free_session', value: null } })!;
    expect(e.total).toBe(10);
  });

  it('returns null when the provider has no rate or the length is unusable', () => {
    expect(estimateBookingPrice({ hourlyRate: null, minutes: 60 })).toBeNull();
    expect(estimateBookingPrice({ hourlyRate: undefined, minutes: 60 })).toBeNull();
    expect(estimateBookingPrice({ hourlyRate: 100, minutes: 0 })).toBeNull();
  });

  it('ignores a missing or negative location fee', () => {
    expect(estimateBookingPrice({ hourlyRate: 100, minutes: 60, locationFee: null })!.total).toBe(100);
    expect(estimateBookingPrice({ hourlyRate: 100, minutes: 60, locationFee: -5 })!.total).toBe(100);
  });
});
