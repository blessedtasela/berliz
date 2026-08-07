import { Injectable } from '@angular/core';

/**
 * Decides *when* the newsletter popup is allowed to appear.
 *
 * Replaces the old "show it once, ever, on the landing page only" behaviour
 * (`StateService.getShowNewsletter()` / the raw `"newsletter"` localStorage key,
 * which stored an untyped boolean string). That old key is deliberately ignored
 * here — its value cannot be mapped onto the richer state below, and treating a
 * legacy `"true"` as "already subscribed" would silently suppress the popup for
 * every returning visitor. Fresh namespaced keys mean everyone starts clean.
 *
 * All persisted state lives under the `berliz.newsletter.*` prefix.
 */

// ── Tuning constants ────────────────────────────────────────────────────────
//
// Reasoning behind the numbers:
//
//  • FIRST_VISIT_DELAY_MS — a brand-new visitor gets the popup 5s in. Long
//    enough that they've seen real content and the page has settled, short
//    enough that they haven't left. This preserves the timing the landing page
//    already used, so the perceived behaviour on a first visit is unchanged.
//
//  • REPEAT_INTERVAL_DAYS — two weeks between appearances. Short enough that a
//    genuinely interested visitor gets a second chance in the same month, long
//    enough that a regular weekly visitor never sees it twice in a row.
//
//  • MIN_PAGEVIEWS_THIS_SESSION — a repeat showing additionally requires that
//    the visitor is actually *engaged* this session (3 in-app navigations, e.g.
//    home -> trainers -> a trainer). Someone who bounces off one page never
//    sees it again; someone browsing the marketplace does. This is the
//    "activity" half of the rule, and it's what keeps the popup from feeling
//    like a timer that fires at whoever happens to load the site on day 14.
//
//  • REPEAT_DELAY_MS — repeat showings wait longer than the first (8s), because
//    the visitor is mid-browse rather than newly landed; interrupting them
//    instantly reads as more aggressive.
//
//  • DISMISS_BACKOFF_DAYS — an explicit close is a stronger negative signal
//    than simply having been shown the popup, so an active dismissal buys a
//    longer quiet period (30d) than the ordinary 14d interval.
//
//  • MAX_TIMES_SHOWN — hard ceiling of 5 lifetime appearances. Someone who has
//    declined five times is not going to subscribe on the sixth; past that
//    point the popup is pure annoyance and a brand cost with no upside. This is
//    a product-safety backstop, not a growth lever.
//
const FIRST_VISIT_DELAY_MS = 5000;
const REPEAT_DELAY_MS = 8000;
const REPEAT_INTERVAL_DAYS = 14;
const DISMISS_BACKOFF_DAYS = 30;
const MIN_PAGEVIEWS_THIS_SESSION = 3;
const MAX_TIMES_SHOWN = 5;

const DAY_MS = 24 * 60 * 60 * 1000;

const KEY_LAST_SHOWN_AT = 'berliz.newsletter.lastShownAt';
const KEY_TIMES_SHOWN = 'berliz.newsletter.timesShown';
const KEY_SUBSCRIBED = 'berliz.newsletter.subscribed';
const KEY_DISMISSED_AT = 'berliz.newsletter.dismissedAt';

@Injectable({ providedIn: 'root' })
export class NewsletterTriggerService {

  /**
   * Navigations seen in this browser session. Intentionally in-memory only:
   * it resets on construction (i.e. on every full page load / new tab), which
   * is exactly the "is this person engaged *right now*" signal we want.
   */
  private pageviewsThisSession = 0;

  /** Guards against two `NavigationEnd` ticks racing to open the same dialog. */
  private openInFlight = false;

  // ── Activity tracking ─────────────────────────────────────────────────────

  /** Call once per `NavigationEnd`. */
  registerPageview(): void {
    this.pageviewsThisSession++;
  }

  get sessionPageviews(): number {
    return this.pageviewsThisSession;
  }

  // ── Persisted state ───────────────────────────────────────────────────────

  get subscribed(): boolean {
    return this.readString(KEY_SUBSCRIBED) === 'true';
  }

  get timesShown(): number {
    return this.readNumber(KEY_TIMES_SHOWN) ?? 0;
  }

  get lastShownAt(): number | null {
    return this.readNumber(KEY_LAST_SHOWN_AT);
  }

  get dismissedAt(): number | null {
    return this.readNumber(KEY_DISMISSED_AT);
  }

  // ── The rule ──────────────────────────────────────────────────────────────

  /**
   * Whether the popup may be opened right now. Callers are still responsible
   * for gating on route/layout (public site only) and for the open delay —
   * see `openDelayMs()`.
   */
  shouldShow(): boolean {
    // Already on the list: never again, on this browser, full stop.
    if (this.subscribed) return false;

    // Don't stack a second open on top of one we've already scheduled.
    if (this.openInFlight) return false;

    const timesShown = this.timesShown;

    // Lifetime ceiling.
    if (timesShown >= MAX_TIMES_SHOWN) return false;

    // First ever visit: show it (the caller applies FIRST_VISIT_DELAY_MS).
    if (timesShown === 0) return true;

    // Repeat showings need BOTH elapsed time AND session activity.
    const now = Date.now();

    const lastShownAt = this.lastShownAt;
    if (lastShownAt === null) {
      // timesShown > 0 but no timestamp — corrupt/partial state. Treat the
      // absence conservatively and wait for a clean cycle rather than showing.
      return false;
    }
    if (now - lastShownAt < REPEAT_INTERVAL_DAYS * DAY_MS) return false;

    // An explicit dismissal earns a longer cool-off than a mere impression.
    const dismissedAt = this.dismissedAt;
    if (dismissedAt !== null && now - dismissedAt < DISMISS_BACKOFF_DAYS * DAY_MS) {
      return false;
    }

    return this.pageviewsThisSession >= MIN_PAGEVIEWS_THIS_SESSION;
  }

  /** How long the caller should wait before actually opening the dialog. */
  openDelayMs(): number {
    return this.timesShown === 0 ? FIRST_VISIT_DELAY_MS : REPEAT_DELAY_MS;
  }

  // ── Recording outcomes ────────────────────────────────────────────────────

  /**
   * Record that we've committed to showing the popup. Call this at *schedule*
   * time, not after the dialog renders, so a slow page can't let the next
   * `NavigationEnd` tick trigger a duplicate open.
   */
  markShown(): void {
    this.openInFlight = true;
    this.writeString(KEY_LAST_SHOWN_AT, String(Date.now()));
    this.writeString(KEY_TIMES_SHOWN, String(this.timesShown + 1));
  }

  /** The dialog closed without a successful subscribe. */
  markDismissed(): void {
    this.openInFlight = false;
    this.writeString(KEY_DISMISSED_AT, String(Date.now()));
  }

  /** The visitor successfully subscribed — permanent, never show again. */
  markSubscribed(): void {
    this.openInFlight = false;
    this.writeString(KEY_SUBSCRIBED, 'true');
  }

  // ── localStorage helpers (never throw: private mode / disabled storage) ────

  private readString(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private readNumber(key: string): number | null {
    const raw = this.readString(key);
    if (raw === null || raw === '') return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private writeString(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage unavailable (private browsing, quota). Degrade to
      // session-only behaviour rather than breaking navigation.
    }
  }
}
