/**
 * Slot times are on the PROVIDER's clock. A client in another city needs to be told which clock that is, and
 * what it is on theirs, or "6:00 PM" means two different things.
 */

/** "PDT", "GMT+1"... for a zone at a moment; null when the zone name is not one the browser knows. */
export function zoneAbbreviation(zone: string, at: Date = new Date()): string | null {
  try {
    const part = new Intl.DateTimeFormat('en-CA', { timeZone: zone, timeZoneName: 'short' })
      .formatToParts(at).find(p => p.type === 'timeZoneName');
    return part?.value ?? null;
  } catch {
    return null;
  }
}

/** "Vancouver (PDT)" from "America/Vancouver"; the raw id when it has no readable city. */
export function zoneLabel(zone: string, at: Date = new Date()): string {
  const city = zone.includes('/') ? zone.slice(zone.lastIndexOf('/') + 1).replace(/_/g, ' ') : zone;
  const abbr = zoneAbbreviation(zone, at);
  return abbr ? `${city} (${abbr})` : city;
}

/** The viewer's own zone id, or null when the browser will not say. */
export function viewerZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

/** True when two zone ids are the same wall clock at that moment (so no conversion note is needed). */
export function sameClock(a: string, b: string, at: Date): boolean {
  if (a === b) return true;
  const fmt = (zone: string) => {
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: zone, hour12: false, hour: '2-digit', minute: '2-digit', day: '2-digit' }).format(at); }
    catch { return zone; }
  };
  return fmt(a) === fmt(b);
}

/** A time of day as a client reads it: "6:00 PM". */
export function formatClock(at: Date, zone: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: zone, hour: 'numeric', minute: '2-digit', hour12: true })
      .format(at).replace(/\s?([ap])\.?m\.?/i, (_, c) => ' ' + c.toUpperCase() + 'M');
  } catch {
    return '';
  }
}

/** How far `zone`'s clock is ahead of UTC at that instant, in minutes (negative for the Americas). */
function offsetMinutes(zone: string, at: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(at);
  const n = (type: string) => Number(parts.find(p => p.type === type)?.value);
  const wallAsUtc = Date.UTC(n('year'), n('month') - 1, n('day'), n('hour'), n('minute'), n('second'));
  return (wallAsUtc - (at.getTime() - at.getMilliseconds())) / 60000;
}

/** The instant of "yyyy-MM-dd" + "HH:mm[:ss]" on the wall clock of `zone` (the way the server reads a picked slot). */
export function instantInZone(date: string, time: string, zone: string): Date | null {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  if ([y, m, d, hh, mm].some(n => Number.isNaN(n))) return null;
  try {
    const wall = Date.UTC(y, m - 1, d, hh, mm);
    // Two passes: the offset at the first guess can differ from the offset at the real instant around a DST change.
    let instant = wall - offsetMinutes(zone, new Date(wall)) * 60000;
    instant = wall - offsetMinutes(zone, new Date(instant)) * 60000;
    return new Date(instant);
  } catch {
    return null;
  }
}
