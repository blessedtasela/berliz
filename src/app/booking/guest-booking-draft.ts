/**
 * Guest-first booking: a visitor can pick a day and time on the public booking page and is asked to sign in or
 * create an account only when they send the request. This remembers what they picked across that detour (the
 * login/sign-up pages are different routes) and gives it back when they land on the same page signed in.
 *
 * sessionStorage on purpose: it lives for the tab's journey through sign-up and is gone afterwards, never
 * shared across tabs or kept for later. Every access is guarded -- private windows and blocked storage must
 * just mean "no draft", never an error.
 */
export type GuestBookingKind = 'trainer' | 'center';

export interface GuestBookingDraft {
  kind: GuestBookingKind;
  providerId: number;
  /** yyyy-MM-dd the visitor picked */
  date: string;
  /** "HH:mm:ss" of the chosen slot, or null if they had not picked one yet */
  slotStart: string | null;
  notes: string;
  /** The booking page to come back to, e.g. /trainers/Jo-Smith/book (same-origin path only). */
  path: string;
  savedAt: number;
}

const KEY = 'berliz.guestBooking.v1';
/** Long enough to create an account and confirm an email; short enough not to resurrect yesterday's plans. */
export const GUEST_DRAFT_MAX_AGE_MS = 2 * 60 * 60 * 1000;

export function saveGuestDraft(draft: Omit<GuestBookingDraft, 'savedAt'>, now = Date.now()): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...draft, savedAt: now }));
  } catch {
    /* no storage: the visitor simply starts the pick again */
  }
}

/** The saved draft if it is for this provider and still fresh; otherwise null. Does not clear it. */
export function loadGuestDraft(kind: GuestBookingKind, providerId: number, now = Date.now()): GuestBookingDraft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<GuestBookingDraft>;
    if (d.kind !== kind || d.providerId !== providerId) return null;
    if (typeof d.date !== 'string' || typeof d.savedAt !== 'number') return null;
    if (now - d.savedAt > GUEST_DRAFT_MAX_AGE_MS) return null;
    return {
      kind,
      providerId,
      date: d.date,
      slotStart: typeof d.slotStart === 'string' ? d.slotStart : null,
      notes: typeof d.notes === 'string' ? d.notes : '',
      path: typeof d.path === 'string' ? d.path : '',
      savedAt: d.savedAt,
    };
  } catch {
    return null;
  }
}

/**
 * Where a visitor who just finished sign-in / sign-up (and so has no returnUrl any more -- email activation is
 * several page loads long) should land: the booking page they started on. Same-origin paths only.
 */
export function pendingGuestBookingPath(now = Date.now()): string | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<GuestBookingDraft>;
    if (typeof d.savedAt !== 'number' || now - d.savedAt > GUEST_DRAFT_MAX_AGE_MS) return null;
    const path = d.path;
    return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') ? path : null;
  } catch {
    return null;
  }
}

export function clearGuestDraft(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
