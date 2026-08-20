import { Injectable, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { SidebarDisplay } from '../models/users.interface';

export type { SidebarDisplay };

/**
 * Below this viewport width the sidebar behaves as "mobile" (temporary overlay /
 * floating reopen button) regardless of the desktop display mode. Matches the
 * `md` Tailwind breakpoint already used throughout the sidebar templates.
 */
export const SIDEBAR_MOBILE_BREAKPOINT = 768;

/**
 * Pure helper so the "show the floating reopen button" rule can be unit-tested
 * without touching Angular/TestBed.
 *  - Mobile: shown whenever the temporary overlay is currently closed —
 *    regardless of `mode`, since mobile never has a permanent icon rail.
 *  - Desktop: shown only when `mode === 'hidden'`.
 */
export function shouldShowFloatingReopenButton(
  isMobile: boolean,
  mode: SidebarDisplay,
  mobileOverlayOpen: boolean
): boolean {
  return isMobile ? !mobileOverlayOpen : mode === 'hidden';
}

/**
 * Single source of truth for the sidebar's runtime display state, shared between
 * the sidebar itself (SideBarComponent) and the page-content wrapper (AppComponent,
 * which needs to know how much horizontal space, if any, to reserve).
 *
 * Two independent pieces of state:
 *
 *  - `mode` — the desktop display: 'expanded' | 'collapsed' | 'hidden'. Seeded once
 *    per session from the user's saved "Sidebar display" preference (see
 *    `applyPreferredMode`), then freely changed by manual toggles (the
 *    expand/collapse controls, the floating reopen button). Never auto-changed by
 *    navigation — desktop navigation must never auto-close the sidebar.
 *
 *  - the mobile overlay — whether the temporary, full-screen mobile sidebar is
 *    currently shown. Independent of `mode` (mobile never reserves layout space
 *    for any mode) and is the one piece of state that DOES auto-close, centrally,
 *    on every navigation — see the constructor. This is the single place that
 *    implements "mobile navigation closes the sidebar" for the whole app; nothing
 *    else needs to duplicate it.
 */
@Injectable({ providedIn: 'root' })
export class SidebarStateService implements OnDestroy {

  private mode$$ = new BehaviorSubject<SidebarDisplay>('expanded');
  mode$ = this.mode$$.asObservable();

  private mobileOverlayOpen$$ = new BehaviorSubject<boolean>(false);
  mobileOverlayOpen$ = this.mobileOverlayOpen$$.asObservable();

  /**
   * Legacy boolean stream some call sites still read: true only when the desktop
   * sidebar is showing full labels ('expanded'). Prefer `mode$` in new code.
   */
  sidebarOpen$ = this.mode$.pipe(map(mode => mode === 'expanded'));

  private destroy$ = new Subject<void>();
  private preferenceApplied = false;

  constructor(private router: Router) {
    // ── CENTRALIZED mobile auto-close-on-navigate ──────────────────────────────
    // The one and only place this happens for the whole app. Every completed
    // navigation, regardless of which component/link triggered it, closes the
    // temporary mobile overlay so the destination page gets the full screen.
    // Desktop `mode` is never touched here.
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.isMobileViewport() && this.mobileOverlayOpen$$.value) {
          this.mobileOverlayOpen$$.next(false);
        }
      });
  }

  get currentMode(): SidebarDisplay {
    return this.mode$$.value;
  }

  get isMobileOverlayOpen(): boolean {
    return this.mobileOverlayOpen$$.value;
  }

  isMobileViewport(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < SIDEBAR_MOBILE_BREAKPOINT;
  }

  setMode(mode: SidebarDisplay): void {
    this.mode$$.next(mode);
  }

  /**
   * Legacy setter kept for any consumer still calling setOpen(bool): true/false map
   * onto expanded/collapsed. Only setMode('hidden') can reach the hidden mode.
   */
  setOpen(open: boolean): void {
    this.setMode(open ? 'expanded' : 'collapsed');
  }

  setMobileOverlayOpen(open: boolean): void {
    this.mobileOverlayOpen$$.next(open);
  }

  toggleMobileOverlay(): void {
    this.mobileOverlayOpen$$.next(!this.mobileOverlayOpen$$.value);
  }

  /**
   * Seeds the runtime state from the user's saved "Sidebar display" preference.
   * The preference only sets the DEFAULT shown on load — manual toggles (the
   * expand/collapse controls, the floating reopen button) always still work
   * afterwards regardless of it. Guarded to run once per session so a later,
   * unrelated reload of the user record (e.g. after saving their name) can't
   * silently undo a manual toggle the user has since made.
   */
  applyPreferredMode(preference: SidebarDisplay): void {
    if (this.preferenceApplied) return;
    this.preferenceApplied = true;

    this.mode$$.next(preference);
    // Mobile: an "expanded" preference starts as an open overlay (the app "opens
    // with the sidebar showing"); "collapsed" and "hidden" both start closed
    // behind the floating reopen button — a permanent icon rail eating 56px of a
    // phone screen is exactly the problem this feature replaces.
    this.mobileOverlayOpen$$.next(preference === 'expanded' && this.isMobileViewport());
  }

  /** Lets a fresh sign-in (or a test) re-seed from that user's own preference. */
  resetPreferenceApplied(): void {
    this.preferenceApplied = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
