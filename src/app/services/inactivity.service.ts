import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Subscription, fromEvent, merge, timer } from 'rxjs';
import { startWith, switchMap, throttleTime } from 'rxjs/operators';

import { AuthService } from './auth.service';

/**
 * How long the user may go without interacting with the app before we end the
 * session.
 *
 * Reasoning:
 *  - The backend access token lives 1 hour and the refresh token 24 hours
 *    (`JWTUtility.createAccessToken` / `createRefreshToken`). Since
 *    `AuthInterceptor` now refreshes silently and reliably, an *active* user's
 *    session survives every access-token expiry and only ends when the 24h
 *    refresh token itself expires. That is far too long to leave an unattended
 *    machine logged in.
 *  - So the real session bound for an idle user has to come from the client.
 *    30 minutes is the usual figure for an app holding personal and billing
 *    data: comfortably longer than any realistic pause in a workout/booking
 *    flow (reading a plan, filling a long form, taking a call), short enough to
 *    protect a walked-away-from screen. It also sits below the 1h access-token
 *    lifetime, so an idle session ends before its own access token would have
 *    expired anyway — a returning user never sits in the ambiguous state of
 *    "idle for ages but still technically holding a token".
 *
 * Tune here — this is the only place the value is defined.
 */
export const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

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
    private router: Router,
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
   * failure: `AuthService.logout()` (clears tokens, navigates to `/login`) plus
   * the explicit navigation guard. No second logout implementation.
   */
  private logoutForInactivity(): void {
    // Note: we deliberately keep watching. The subscription is idle until the
    // next interaction, and once the user logs back in `hasSession()` is true
    // again, so the countdown re-arms by itself without a second `start()`.
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
