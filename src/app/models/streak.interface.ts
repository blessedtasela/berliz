/** Mirrors the backend `StreakDay`. */
export interface StreakDay {
  /** ISO date, yyyy-MM-dd. */
  date: string;
  /** Short weekday label, e.g. "Mon". */
  label: string;
  active: boolean;
  today: boolean;
  future: boolean;
}

/** Mirrors the backend `StreakResponse` — `GET /streak/me`. */
export interface StreakResponse {
  currentStreak: number;
  longestStreak: number;
  activeToday: boolean;
  totalActiveDays: number;
  week: StreakDay[];
  message?: string;
}
