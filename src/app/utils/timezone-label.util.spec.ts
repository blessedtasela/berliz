import { formatClock, instantInZone, sameClock, zoneAbbreviation, zoneLabel } from './timezone-label.util';

describe('timezone-label.util', () => {
  const summerNoonUtc = new Date('2026-07-15T19:00:00Z');   // 12:00 in Vancouver (PDT)

  it('names a zone as city plus abbreviation', () => {
    expect(zoneLabel('America/Vancouver', summerNoonUtc)).toContain('Vancouver (');
    expect(zoneAbbreviation('America/Vancouver', summerNoonUtc)).toMatch(/PDT|GMT-7/);
  });

  it('falls back to the raw id for something it cannot read', () => {
    expect(zoneLabel('Not/AZone')).toBe('AZone');
    expect(zoneAbbreviation('Not/AZone')).toBeNull();
  });

  it('turns a picked slot into the right instant on the provider clock, whatever zone the browser is in', () => {
    // 6:00 PM on the Vancouver wall clock in July is 01:00 UTC the next day.
    expect(instantInZone('2026-07-15', '18:00:00', 'America/Vancouver')!.toISOString()).toBe('2026-07-16T01:00:00.000Z');
    // In winter the offset differs, so check it round-trips instead of hard-coding the zone rules: the instant reads as 6:00 PM there.
    expect(formatClock(instantInZone('2026-12-15', '18:00', 'America/Vancouver')!, 'America/Vancouver')).toBe('6:00 PM');
    expect(instantInZone('2026-07-15', '09:30', 'Africa/Casablanca')).not.toBeNull();
    expect(instantInZone('nope', '18:00', 'America/Vancouver')).toBeNull();
  });

  it('formats a clock time for a zone', () => {
    expect(formatClock(summerNoonUtc, 'America/Vancouver')).toBe('12:00 PM');
    expect(formatClock(summerNoonUtc, 'UTC')).toBe('7:00 PM');
  });

  it('knows when two zones show the same clock', () => {
    expect(sameClock('America/Vancouver', 'America/Vancouver', summerNoonUtc)).toBeTrue();
    expect(sameClock('America/Vancouver', 'America/Los_Angeles', summerNoonUtc)).toBeTrue();
    expect(sameClock('America/Vancouver', 'UTC', summerNoonUtc)).toBeFalse();
  });
});
