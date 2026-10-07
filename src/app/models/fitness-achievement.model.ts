/** Mirrors the backend `FitnessAchievementResponse`. */
export interface FitnessAchievement {
  id: number;
  name: string;
  description?: string | null;
  /** Path/URL of an uploaded certificate file (host-relative until passed through resolveStrapiUrl). */
  certificate?: string | null;
  /** When it was achieved. */
  date: string;
  lastUpdate?: string | null;
  message?: string;
}

/** Mirrors the backend `FitnessAchievementRequest`. */
export interface FitnessAchievementRequest {
  /** Required for update. */
  id?: number;
  name: string;
  description?: string | null;
  certificate?: string | null;
  /** ISO 8601; the server defaults it to now. */
  date?: string | null;
}

export const ACHIEVEMENT_NAME_MIN = 2;
export const ACHIEVEMENT_NAME_MAX = 100;
export const ACHIEVEMENT_DESCRIPTION_MAX = 1000;
