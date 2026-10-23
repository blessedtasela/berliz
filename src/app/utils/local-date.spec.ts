import { calendarDayDate, calendarDayKey, instantOnLocalDay, localDateString, localDayKey, localDayOfInstant } from './local-date';

describe('local-date', () => {
  it('formats the local calendar day, zero-padded', () => {
    expect(localDateString(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
    expect(localDateString(new Date(2026, 9, 18, 0, 5))).toBe('2026-10-18');
  });

  it('is the local day even late in the evening, when UTC is already tomorrow', () => {
    // 23:30 local: whatever the zone, the local day must be the same calendar day we built.
    const late = new Date(2026, 9, 18, 23, 30);
    expect(localDateString(late)).toBe('2026-10-18');
  });

  it('builds an instant on the chosen local day at the given time of day', () => {
    const at = instantOnLocalDay('2026-10-19', new Date(2026, 9, 18, 21, 15, 7));
    expect([at.getFullYear(), at.getMonth(), at.getDate(), at.getHours(), at.getMinutes(), at.getSeconds()])
      .toEqual([2026, 9, 19, 21, 15, 7]);
  });

  it('round-trips a picked day through the instant it is stored as', () => {
    for (const day of ['2026-01-01', '2026-03-08', '2026-10-31', '2026-12-31']) {
      expect(localDayOfInstant(instantOnLocalDay(day).toISOString())).toBe(day);
    }
  });

  it('reads a stored calendar day as the same y-m-d locally, whatever the zone', () => {
    const d = calendarDayDate('2026-10-19T00:00:00.000Z');
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 9, 19]);
  });

  it('gives the same day key for a stored day and the same local day', () => {
    expect(calendarDayKey('2026-10-19T00:00:00.000Z')).toBe(localDayKey(new Date(2026, 9, 19, 17, 0)));
    expect(calendarDayKey('2026-10-20T00:00:00.000Z') - calendarDayKey('2026-10-19T00:00:00.000Z')).toBe(86_400_000);
  });
});
