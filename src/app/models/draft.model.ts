/**
 * One saved-in-progress action — a post being composed, a booking being
 * scheduled, a workout being logged, etc. See DraftService for the full
 * contract.
 */
export interface DraftEntry<T = any> {
  /** Which kind of flow this is a draft of -- 'post', 'booking', 'workout-log', etc. */
  type: string;
  /** Distinguishes multiple concurrent drafts of the same type (e.g. one booking draft per provider). 'default' when a type only ever has one. */
  id: string;
  /** Shown on the My Drafts page and in the resume banner -- e.g. "Post" or "Booking with Jane Doe". */
  label: string;
  /** Short free-text hint of where things stood -- e.g. a content snippet, or "Sep 20, 2:00 PM". Optional. */
  preview?: string;
  /** Router path to land on to resume this draft. */
  route: string;
  queryParams?: Record<string, any>;
  /** Date.now() at last save. */
  savedAt: number;
  /** The actual in-progress form state, shaped however the owning feature needs. */
  data: T;
}
