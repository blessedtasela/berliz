import {
  Ladder, TIER_FLOOR, checkLadder, commitmentTotal, defaultLadder, ladderIsValid, monthlyTotal, packTotal, perSession, rateFor, tierOrderWarnings,
} from './pricing-ladder.util';

describe('pricing-ladder.util', () => {
  // The owner's own ladders, used as worked examples. They are inputs here, never defaults.
  const inPerson: Ladder = { single: 100, five: 80, ten: 75, fifteen: 70 };
  const hybrid: Ladder = { single: 80, five: 65, ten: 55, fifteen: 50 };
  const online: Ladder = { single: 65, five: 55, ten: 45, fifteen: 40 };

  it('starts every rate at the tier floor until a trainer sets their own', () => {
    expect(defaultLadder('IN_PERSON')).toEqual({ single: 70, five: 70, ten: 70, fifteen: 70 });
    expect(defaultLadder('HYBRID')).toEqual({ single: 59.99, five: 59.99, ten: 59.99, fifteen: 59.99 });
    expect(defaultLadder('ONLINE')).toEqual({ single: 49.99, five: 49.99, ten: 49.99, fifteen: 49.99 });
  });

  it('a default ladder is itself valid for its tier', () => {
    for (const tier of ['IN_PERSON', 'HYBRID', 'ONLINE'] as const) expect(ladderIsValid(tier, defaultLadder(tier))).toBeTrue();
  });

  it('picks the per-session rate for the volume', () => {
    expect(rateFor(inPerson, 1)).toBe(100);
    expect(rateFor(inPerson, 4)).toBe(100);
    expect(rateFor(inPerson, 5)).toBe(80);
    expect(rateFor(inPerson, 9)).toBe(80);
    expect(rateFor(inPerson, 10)).toBe(75);
    expect(rateFor(inPerson, 14)).toBe(75);
    expect(rateFor(inPerson, 15)).toBe(70);
    expect(rateFor(inPerson, 40)).toBe(70);
  });

  it('works out pack totals from the ladder', () => {
    expect(packTotal(inPerson, 5)).toBe(400);
    expect(packTotal(inPerson, 10)).toBe(750);
    expect(packTotal(inPerson, 15)).toBe(1050);
    expect(packTotal(hybrid, 5)).toBe(325);
    expect(packTotal(hybrid, 10)).toBe(550);
    expect(packTotal(hybrid, 15)).toBe(750);
    expect(packTotal(online, 5)).toBe(275);
    expect(packTotal(online, 10)).toBe(450);
    expect(packTotal(online, 15)).toBe(600);
  });

  it('prices a month from the ladder: 12 sessions sit in the 10-session tier', () => {
    expect(monthlyTotal(inPerson, 12)).toBe(900);
    expect(monthlyTotal(hybrid, 12)).toBe(660);
    expect(monthlyTotal(online, 12)).toBe(540);
  });

  it('applies a commitment discount to the whole, never above 100% or below 0%', () => {
    expect(commitmentTotal(900, 3, 3)).toBe(2619);
    expect(commitmentTotal(900, 12, 15)).toBe(9180);
    expect(commitmentTotal(900, 3, 0)).toBe(2700);
    expect(commitmentTotal(900, 3, -5)).toBe(2700);
    expect(commitmentTotal(900, 3, 150)).toBe(0);
  });

  it('shows what one session costs inside a total', () => {
    expect(perSession(399.99, 5)).toBe(80);
    expect(perSession(299.99, 5)).toBe(60);
    expect(perSession(100, 0)).toBe(0);
  });

  describe('the rules', () => {
    it('accepts a ladder that falls as sessions climb and stays at or above the floor', () => {
      expect(checkLadder('IN_PERSON', inPerson)).toEqual([]);
    });

    it('flags any rate below its tier floor, and says which', () => {
      const issues = checkLadder('ONLINE', online);   // 40 < 49.99 at 15+, 45 < 49.99 at 10
      expect(issues.filter(i => i.kind === 'BELOW_FLOOR').map(i => i.key)).toEqual(['ten', 'fifteen']);
      expect(issues[0].message).toContain('CA$49.99');
    });

    it('treats the floor as a minimum, not a price: a rate exactly at it is fine', () => {
      expect(ladderIsValid('IN_PERSON', { single: 70, five: 70, ten: 70, fifteen: 70 })).toBeTrue();
      expect(ladderIsValid('IN_PERSON', { single: 69.99, five: 69.99, ten: 69.99, fifteen: 69.99 })).toBeFalse();
    });

    it('flags a bigger volume that costs more per session than a smaller one', () => {
      const broken: Ladder = { single: 100, five: 80, ten: 90, fifteen: 70 };
      const issues = checkLadder('IN_PERSON', broken);
      expect(issues.length).toBe(1);
      expect(issues[0].kind).toBe('LADDER_BREAK');
      expect(issues[0].key).toBe('ten');
      expect(issues[0].message).toContain('never cost more per session');
    });

    it('the old monthly prices break the ladder: CA$1,399.99 for 12 sessions is dearer per session than the 5-pack', () => {
      expect(perSession(1399.99, 12)).toBeGreaterThan(rateFor(inPerson, 5));
    });
  });

  describe('tier order', () => {
    it('is quiet when each tier is pricier than the next at the same volume', () => {
      expect(tierOrderWarnings({ IN_PERSON: inPerson, HYBRID: hybrid, ONLINE: online }, 12)).toEqual([]);
    });

    it('warns when a pricier tier comes out cheaper at some volume', () => {
      const cheapInPerson: Ladder = { single: 100, five: 60, ten: 55, fifteen: 52 };
      const warnings = tierOrderWarnings({ IN_PERSON: cheapInPerson, HYBRID: hybrid, ONLINE: online }, 12);
      expect(warnings.length).toBe(0);   // 55 vs 55 is level, not cheaper
      const worse = tierOrderWarnings({ IN_PERSON: { single: 100, five: 60, ten: 50, fifteen: 50 }, HYBRID: hybrid, ONLINE: online }, 12);
      expect(worse.length).toBe(1);
      expect(worse[0]).toContain('in person');
    });
  });

  it('keeps the floors where the owner set them', () => {
    expect(TIER_FLOOR).toEqual({ IN_PERSON: 70, HYBRID: 59.99, ONLINE: 49.99 });
  });
});
