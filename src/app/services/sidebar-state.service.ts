import { Injectable, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subject, combineLatest, fromEvent } from 'rxjs';
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
 *  - Mobile only has two effective states: 'collapsed' gets its own persistent
 *    icon rail (see SideBarComponent), so it never needs this button; anything
 *    else ('expanded' or 'hidden') is tucked away and reopened via this button.
 *  - Desktop: shown only when `mode === 'hidden'`.
 *  - Never shown while the temporary overlay is already open.
 */
export function shouldShowFloatingReopenButton(
  isMobile: boolean,
  mode: SidebarDisplay,
  mobileOverlayOpen: boolean
): boolean {
  if (mobileOverlayOpen) return false;
  return isMobile ? mode !== 'collapsed' : mode === 'hidden';
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

  private mode$$ = new BehaviorSubject<SidebarDisplay>('hidden');
  mode$ = this.mode$$.asObservable();

  private mobileOverlayOpen$$ = new BehaviorSubject<boolean>(false);
  mobileOverlayOpen$ = this.mobileOverlayOpen$$.asObservable();

  private isMobile$$ = new BehaviorSubject<boolean>(this.isMobileViewport());
  isMobile$ = this.isMobile$$.asObservable();

  /**
   * Whether the floating reopen button should be visible right now — one
   * reactive stream combining viewport + mode + overlay state, so any
   * component (top bar, sidebar itself, ...) can just `| async` this instead
   * of each re-implementing its own resize listener and re-deriving the same
   * boolean. This is what actually renders the button; it lives in the
   * TOP BAR (a fixed, always-present header row) rather than as a
   * separately-floating element, since a floating button positioned below
   * the header risked overlapping page-specific content underneath it.
   */
  showFloatingButton$ = combineLatest([this.isMobile$, this.mode$, this.mobileOverlayOpen$]).pipe(
    map(([isMobile, mode, mobileOverlayOpen]) => shouldShowFloatingReopenButton(isMobile, mode, mobileOverlayOpen))
  );

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

    // ── CENTRALIZED viewport tracking ───────────────────────────────────────
    // Keeps isMobile$ (and therefore showFloatingButton$) current without
    // every consumer needing its own @HostListener('window:resize').
    if (typeof window !== 'undefined') {
      fromEvent(window, 'resize')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.isMobile$$.next(this.isMobileViewport()));
    }
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

  /** Floating button handler: reopens into the full sidebar regardless of viewport. */
  openSidebar(): void {
    if (this.isMobileViewport()) {
      this.setMobileOverlayOpen(true);
    } else {
      this.setMode('expanded');
    }
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
    // Mobile never auto-opens the temporary overlay on load — there's no room
    // for a permanently expanded, fully-labeled sidebar on a phone screen.
    // Only 'collapsed' gets a persistent (icon rail) presence on mobile;
    // 'expanded' and 'hidden' both start tucked behind the top-bar toggle.
    this.mobileOverlayOpen$$.next(false);
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
