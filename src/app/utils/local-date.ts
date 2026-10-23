/**
 * Calendar-day helpers.
 *
 * `new Date().toISOString().slice(0, 10)` is the day in UTC, not the user's day: in Vancouver after 5 pm it is already
 * "tomorrow", so a form that defaulted its date picker that way offered tomorrow's date. These helpers read the user's
 * own calendar.
 *
 * Fields that mean a whole calendar day (a progress check-in date, a workout log date, a task or promotion start/end)
 * are sent as `yyyy-MM-dd` and stored at UTC midnight. They must therefore be *shown* in UTC
 * (`| date:'mediumDate':'UTC'`); shown in the viewer's zone they read one day early everywhere west of UTC.
 */

/** The user's local calendar day as `yyyy-MM-dd` (what an `<input type="date">` expects). */
export function localDateString(d: Date = new Date()): string {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/**
 * An instant on the given local calendar day, at the current local time of day. Used for things that really happened at
 * a moment (a run) when the user picks the day: shown in the viewer's zone it lands on the day they picked, wherever they are.
 */
export function instantOnLocalDay(day: string, now: Date = new Date()): Date {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, now.getHours(), now.getMinutes(), now.getSeconds());
}

/** The viewer-local `yyyy-MM-dd` of a stored instant (the inverse of {@link instantOnLocalDay}). */
export function localDayOfInstant(value: string | number | Date): string {
  return localDateString(new Date(value));
}

/**
 * A stored calendar day (UTC midnight, see above) as a Date at *local* midnight of that same year-month-day, so local-time
 * code (week numbers, streaks, `toLocaleDateString`) sees the day the user picked instead of the day before.
 */
export function calendarDayDate(value: string | number | Date): Date {
  const d = new Date(value);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** `Date.UTC` of a Date's local year-month-day: a day number that is the same for the same calendar day anywhere. */
export function localDayKey(d: Date = new Date()): number {
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

/** The day key of a stored calendar day (see {@link calendarDayDate}). */
export function calendarDayKey(value: string | number | Date): number {
  return localDayKey(calendarDayDate(value));
}
