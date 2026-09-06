import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { EMPTY, Subscription, fromEvent, merge, timer } from 'rxjs';
import { startWith, switchMap, throttleTime } from 'rxjs/operators';

import { AuthService } from './auth.service';

/**
 * How long the user may go without interacting with the app before we end the
 * session.
 *
 * Reasoning:
 *  - The backend access token lives 1 hour and the refresh token 30 days
 *    (`JWTUtility.createAccessToken` / `createRefreshToken`), and the refresh
 *    token rotates (a fresh 30-day one is issued) on every silent refresh
 *    (`AuthInterceptor` + `UserServiceImplement.refreshToken`). So an
 *    *actively used* session — at least one request within any 30-day span —
 *    never hits a server-side expiry at all; the explicit product decision
 *    (2026-09) is "don't make someone log back in just because time passed,
 *    only because they've genuinely gone quiet for days."
 *  - This constant is what actually enforces that on the client: an open tab
 *    left truly idle (no mouse/keyboard/scroll/touch at all) this long logs
 *    out locally even though the tokens would still be valid, so an
 *    unattended device doesn't sit signed in forever.
 *  - Deliberately 14 days, not the full 30-day refresh-token horizon:
 *    `timer()` below schedules this via the browser's `setTimeout`, which
 *    silently overflows past ~24.8 days (2^31-1 ms, a 32-bit signed int
 *    internally) — a delay past that ceiling wraps around and fires almost
 *    immediately instead of waiting, which would have made this log everyone
 *    out right away instead of never. 14 days stays comfortably clear of that
 *    ceiling while still reading as "genuinely gone quiet for weeks," not a
 *    session-length concern.
 *
 * Tune here — this is the only place the value is defined. Keep any future
 * change well under ~24 days (2^31-1 ms) or the setTimeout overflow above
 * bites again.
 */
export const INACTIVITY_TIMEOUT_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

/**
 * Activity events are only sampled this often. `mousemove` alone fires dozens of
 * times a second; we only need to know "the user did *something* recently", so
 * one sample per 5s is plenty and keeps the listeners essentially free.
 */
const ACTIVITY_THROTTLE_MS = 5000;

/** Real, deliberate signs of a human at the keyboard/screen. */
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

@Injectable({ providedIn: 'root' })
export class InactivityService implements OnDestroy {

  private subscription?: Subscription;

  constructor(
    private authService: AuthService,
    private zone: NgZone
  ) { }

  /**
   * Start watching for user inactivity. Called once, globally, from
   * `AppComponent.ngOnInit()` — do not call this per page.
   */
  start(): void {
    if (this.subscription) return; // already running

    // The listeners must not drag Angular through a change-detection cycle on
    // every mousemove, so they live outside the zone; only the logout is
    // re-entered into the zone (below), because it navigates.
    this.zone.runOutsideAngular(() => {
      const activity$ = merge(
        ...ACTIVITY_EVENTS.map(eventName =>
          fromEvent(document, eventName, { passive: true })
        )
      ).pipe(throttleTime(ACTIVITY_THROTTLE_MS));

      this.subscription = activity$.pipe(
        // Arm the countdown as soon as we start, not only after the first
        // gesture — covers a reload into an already-logged-in session.
        startWith(null),
        // Every sampled interaction cancels the pending countdown and starts a
        // fresh one. Anonymous visitors get no timer at all: nothing to expire,
        // and no reason to hold a 30-minute timer for a public page.
        switchMap(() => this.hasSession() ? timer(INACTIVITY_TIMEOUT_MS) : EMPTY)
      ).subscribe(() => {
        // Countdown elapsed with no interaction at all in the window.
        if (!this.hasSession()) return;
        this.zone.run(() => this.logoutForInactivity());
      });
    });
  }

  /** Stop watching (e.g. after an explicit logout elsewhere). */
  stop(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
  }

  ngOnDestroy(): void {
    this.stop();
  }

  /**
   * A session exists as long as we hold a token — deliberately NOT
   * `AuthService.isAuthenticated()`, which returns false for a merely *expired*
   * access token. Such a session is still perfectly alive: the interceptor
   * refreshes it silently. Only the absence of a token means "no session".
   */
  private hasSession(): boolean {
    return !!this.authService.getToken();
  }

  /**
   * Same logout path `AuthInterceptor` uses for an unrecoverable refresh
   * failure: `AuthService.logout()` clears tokens and navigates to `/login`,
   * carrying the page the user was on as returnUrl (via AuthRedirectService)
   * so logging back in after an idle timeout returns them right there. No
   * second logout implementation, and no second navigate -- that would
   * overwrite the returnUrl with a bare `/login`.
   */
  private logoutForInactivity(): void {
    // Note: we deliberately keep watching. The subscription is idle until the
    // next interaction, and once the user logs back in `hasSession()` is true
    // again, so the countdown re-arms by itself without a second `start()`.
    this.authService.logout();
  }
}
