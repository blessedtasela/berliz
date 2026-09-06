import { Injectable } from '@angular/core';

/**
 * Every feature worth a "NEW" badge gets a stable key here — add one line per
 * shipped feature, never reuse or rename a key once it's live (that would
 * silently re-surface the badge for everyone who already saw it).
 */
export type WhatsNewKey = 'workout-history' | 'exercise-suggestions' | 'nav-controls-settings' | 'scheduled-runs';

const SEEN_KEY_PREFIX = 'whatsNewSeen_';

/**
 * Lightweight, generic "have they seen this yet" tracker for in-app feature
 * discovery — per-device (localStorage), same reasoning as
 * BrowserNotificationService/NavControlsService: this is "has this browser
 * been shown this UI element," not account data worth syncing.
 *
 * Why this exists: shipping a feature nobody notices is close to not
 * shipping it at all. Rather than building a one-off badge each time, any
 * new entry point calls `isNew(key)` to decide whether to render a badge,
 * and the destination component calls `markSeen(key)` once visited —
 * usually in its own ngOnInit, since actually landing on the feature (by
 * any route: the badge, a bookmark, a direct link) is the real signal that
 * it's no longer new to this person.
 */
@Injectable({ providedIn: 'root' })
export class WhatsNewService {

  isNew(key: WhatsNewKey): boolean {
    try {
      return localStorage.getItem(SEEN_KEY_PREFIX + key) !== 'true';
    } catch {
      return false;
    }
  }

  markSeen(key: WhatsNewKey): void {
    try { localStorage.setItem(SEEN_KEY_PREFIX + key, 'true'); } catch { /* degrade silently */ }
  }
}
