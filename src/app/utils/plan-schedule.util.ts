/**
 * Turns "how I want to train" into the list of sessions for a monthly plan. Pure and timezone-free: dates are
 * plain "YYYY-MM-DD" strings and times "HH:mm", the same wall-clock values the server expects.
 */

export interface PlanSession {
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm (24h) */
  time: string;
  durationMinutes: number;
}

/** 0 = Sunday ... 6 = Saturday (JS getDay). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** One step of a rotation: train this many days in a row, then rest this many. */
export interface RotationStep {
  on: number;
  off: number;
}

export type PlanPattern =
  /** The same time on each chosen weekday. */
  | { kind: 'weekly'; weekdays: Weekday[]; time: string }
  /** A time of its own for each chosen weekday. */
  | { kind: 'weeklyCustom'; times: Partial<Record<Weekday, string>> }
  /** Train N days, rest M, then the next step; the whole cycle repeats until the end date (e.g. 2 on, 1 off). */
  | { kind: 'rotation'; steps: RotationStep[]; time: string }
  /** Exactly these dates; `times` overrides the shared time for a date. */
  | { kind: 'dates'; dates: string[]; time: string; times?: Record<string, string> };

export const MAX_PLAN_SESSIONS = 62;
export const MAX_PLAN_SPAN_DAYS = 92;

export const WEEKDAY_LABELS: ReadonlyArray<{ value: Weekday; short: string; long: string }> = [
  { value: 1, short: 'Mon', long: 'Monday' },
  { value: 2, short: 'Tue', long: 'Tuesday' },
  { value: 3, short: 'Wed', long: 'Wednesday' },
  { value: 4, short: 'Thu', long: 'Thursday' },
  { value: 5, short: 'Fri', long: 'Friday' },
  { value: 6, short: 'Sat', long: 'Saturday' },
  { value: 0, short: 'Sun', long: 'Sunday' },
];

/** Ready-made weekday sets for the quick-pick chips. */
export const WEEKDAY_PRESETS: ReadonlyArray<{ label: string; days: Weekday[] }> = [
  { label: 'Weekdays', days: [1, 2, 3, 4, 5] },
  { label: 'Mon · Wed · Fri', days: [1, 3, 5] },
  { label: 'Tue · Thu', days: [2, 4] },
  { label: 'Weekends', days: [6, 0] },
];

/** Ready-made rotations: "5 on, 2 off" is the working week; "2 on, 1 off" a steady three-day cycle. */
export const ROTATION_PRESETS: ReadonlyArray<{ label: string; steps: RotationStep[] }> = [
  { label: '5 on · 2 off', steps: [{ on: 5, off: 2 }] },
  { label: '2 on · 1 off', steps: [{ on: 2, off: 1 }] },
  { label: '3 on · 1 off', steps: [{ on: 3, off: 1 }] },
  { label: 'Every other day', steps: [{ on: 1, off: 1 }] },
  { label: '2 on · 1 off · 3 on · 2 off', steps: [{ on: 2, off: 1 }, { on: 3, off: 2 }] },
];

// ── date helpers (string <-> local calendar date, never through a timezone) ──

export function parseDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0); // noon: immune to a DST shift moving the day
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(value: string, days: number): string {
  const date = parseDate(value);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / 86_400_000);
}

export function weekdayOf(value: string): Weekday {
  return parseDate(value).getDay() as Weekday;
}

/** Every date from start to end, inclusive; empty when end is before start. */
export function eachDate(start: string, end: string): string[] {
  const out: string[] = [];
  const total = daysBetween(start, end);
  for (let i = 0; i <= total && i <= MAX_PLAN_SPAN_DAYS; i++) out.push(addDays(start, i));
  return out;
}

// ── generation ───────────────────────────────────────────────────────────

/** The dates a pattern lands on inside [start, end], with the time for each. Sorted, one per date, capped. */
export function generateSessions(pattern: PlanPattern, start: string, end: string, durationMinutes: number): PlanSession[] {
  const range = eachDate(start, end);
  const picked: Array<{ date: string; time: string }> = [];

  switch (pattern.kind) {
    case 'weekly':
      if (!pattern.time) break;
      for (const date of range) if (pattern.weekdays.includes(weekdayOf(date))) picked.push({ date, time: pattern.time });
      break;

    case 'weeklyCustom':
      for (const date of range) {
        const time = pattern.times[weekdayOf(date)];
        if (time) picked.push({ date, time });
      }
      break;

    case 'rotation': {
      const steps = pattern.steps.filter(s => s.on > 0);
      if (!pattern.time || steps.length === 0) break;
      let position = 0; // days into the whole cycle
      const cycle = steps.reduce((sum, s) => sum + s.on + Math.max(0, s.off), 0);
      for (const date of range) {
        let offset = position % cycle;
        let on = false;
        for (const step of steps) {
          if (offset < step.on) { on = true; break; }
          offset -= step.on;
          if (offset < Math.max(0, step.off)) break;
          offset -= Math.max(0, step.off);
        }
        if (on) picked.push({ date, time: pattern.time });
        position++;
      }
      break;
    }

    case 'dates': {
      const inRange = new Set(range);
      for (const date of [...new Set(pattern.dates)].filter(d => inRange.has(d))) {
        const time = pattern.times?.[date] ?? pattern.time;
        if (time) picked.push({ date, time });
      }
      break;
    }
  }

  return picked
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, MAX_PLAN_SESSIONS)
    .map(p => ({ date: p.date, time: p.time, durationMinutes }));
}

/** "6:00 PM" for "18:00". */
export function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** A one-line description of a pattern for the review step, e.g. "Mon, Wed, Fri at 6:00 PM". */
export function describePattern(pattern: PlanPattern): string {
  const label = (d: Weekday) => WEEKDAY_LABELS.find(w => w.value === d)!.short;
  const ordered = (days: Weekday[]) => WEEKDAY_LABELS.map(w => w.value).filter(v => days.includes(v));

  switch (pattern.kind) {
    case 'weekly':
      return pattern.weekdays.length && pattern.time
        ? `${ordered(pattern.weekdays).map(label).join(', ')} at ${formatTime12(pattern.time)}`
        : 'Pick the days and a time';
    case 'weeklyCustom': {
      const days = ordered(Object.keys(pattern.times).map(Number) as Weekday[]).filter(d => pattern.times[d]);
      return days.length ? days.map(d => `${label(d)} ${formatTime12(pattern.times[d]!)}`).join(' · ') : 'Pick the days and a time for each';
    }
    case 'rotation': {
      const steps = pattern.steps.filter(s => s.on > 0);
      return steps.length && pattern.time
        ? `${steps.map(s => `${s.on} on${s.off > 0 ? `, ${s.off} off` : ''}`).join(', then ')} at ${formatTime12(pattern.time)}`
        : 'Set how many days on and off';
    }
    case 'dates':
      return pattern.dates.length ? `${pattern.dates.length} chosen date${pattern.dates.length === 1 ? '' : 's'}` : 'Pick your dates';
  }
}
