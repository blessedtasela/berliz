import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NavControlsStyle = 'button' | 'swipe' | 'off';
export type NavControlsAppearance = 'translucent' | 'solid';
/** null = not docked, sitting wherever `position` says. 'left'/'right' = collapsed
 *  to a small peek tab against that screen edge (position.y still applies). */
export type NavControlsDockSide = 'left' | 'right' | null;

export interface NavControlsPosition {
  x: number;
  y: number;
}

const STYLE_KEY = 'navControlsStyle';
const APPEARANCE_KEY = 'navControlsAppearance';
const POSITION_KEY = 'navControlsPosition';
const DOCKED_KEY = 'navControlsDocked';
const DOCK_Y_KEY = 'navControlsDockY';

/**
 * Preference for the in-app back/forward control (NavHistoryControlsComponent) —
 * per-device (localStorage), same reasoning as BrowserNotificationService: this
 * is "how do you like your on-screen controls," not account data worth syncing
 * across devices.
 *
 * 'button': a draggable floating pill (default).
 * 'swipe': no visible control — swipe right from the left edge instead, like
 *          iOS's edge-swipe-back gesture.
 * 'off': nothing at all — the user relies on their browser's own back/forward.
 *
 * Within 'button', two more per-device gestures (also in NavHistoryControlsComponent):
 *  - Long-press the pill, then drag it onto the "x" that appears to hide it
 *    entirely (same effect as switching to 'off', reversible from Settings).
 *  - Drag the pill to either screen edge to collapse it to a small peek tab
 *    (`docked` below) instead of a full drag-to-dismiss — a lighter "get it out
 *    of the way without turning it off" option. Tap the tab to bring it back.
 *
 * Reactive on purpose: NavHistoryControlsComponent is mounted ONCE in
 * AppComponent and lives for the whole session, while the Settings page
 * that changes these values is a completely separate, later-instantiated
 * component. A plain getter/localStorage pair (the original shape here)
 * meant Settings could write a new style/position, but the already-running
 * control had no way to find out — it read `style` and the saved position
 * exactly once in its own ngOnInit and never again, so switching to
 * 'swipe'/'off' or hitting "reset position" visibly did nothing until a full
 * page reload. style$/position$ let it react live instead.
 */
@Injectable({ providedIn: 'root' })
export class NavControlsService {

  private readonly styleSubject = new BehaviorSubject<NavControlsStyle>(this.readStyle());
  private readonly appearanceSubject = new BehaviorSubject<NavControlsAppearance>(this.readAppearance());
  private readonly positionSubject = new BehaviorSubject<NavControlsPosition | null>(this.readPosition());
  private readonly dockedSubject = new BehaviorSubject<NavControlsDockSide>(this.readDocked());
  /** Absolute viewport pixels from the top, only meaningful while docked -- a
   *  fresh, independent coordinate rather than reusing the free-drag pill's own
   *  delta-from-anchor system, which means something different. */
  private readonly dockYSubject = new BehaviorSubject<number | null>(this.readDockY());

  readonly style$: Observable<NavControlsStyle> = this.styleSubject.asObservable();
  readonly appearance$: Observable<NavControlsAppearance> = this.appearanceSubject.asObservable();
  readonly position$: Observable<NavControlsPosition | null> = this.positionSubject.asObservable();
  readonly docked$: Observable<NavControlsDockSide> = this.dockedSubject.asObservable();
  readonly dockY$: Observable<number | null> = this.dockYSubject.asObservable();

  get style(): NavControlsStyle {
    return this.styleSubject.value;
  }

  setStyle(style: NavControlsStyle): void {
    try { localStorage.setItem(STYLE_KEY, style); } catch { /* degrade silently */ }
    this.styleSubject.next(style);
  }

  /** Translucent (frosted, default) or solid white -- same idea as NavbarStyleService, applied to this control's own pill. */
  get appearance(): NavControlsAppearance {
    return this.appearanceSubject.value;
  }

  setAppearance(appearance: NavControlsAppearance): void {
    try { localStorage.setItem(APPEARANCE_KEY, appearance); } catch { /* degrade silently */ }
    this.appearanceSubject.next(appearance);
  }

  /** Null means "no custom position saved yet" — the component computes its own default. */
  getPosition(): NavControlsPosition | null {
    return this.positionSubject.value;
  }

  setPosition(position: NavControlsPosition): void {
    try { localStorage.setItem(POSITION_KEY, JSON.stringify(position)); } catch { /* degrade silently */ }
    this.positionSubject.next(position);
  }

  get hasCustomPosition(): boolean {
    return this.positionSubject.value !== null;
  }

  resetPosition(): void {
    try { localStorage.removeItem(POSITION_KEY); } catch { /* degrade silently */ }
    this.positionSubject.next(null);
    this.setDocked(null);
  }

  get docked(): NavControlsDockSide {
    return this.dockedSubject.value;
  }

  get dockY(): number | null {
    return this.dockYSubject.value;
  }

  /** Collapses the control to a small peek tab against the given screen edge at
   *  the given vertical position, or `null`/`null` to undock back to its normal
   *  free position (which `position` still remembers, untouched). */
  setDocked(side: NavControlsDockSide, y: number | null = null): void {
    try {
      if (side) localStorage.setItem(DOCKED_KEY, side);
      else localStorage.removeItem(DOCKED_KEY);
      if (y != null) localStorage.setItem(DOCK_Y_KEY, String(y));
    } catch { /* degrade silently */ }
    this.dockedSubject.next(side);
    if (y != null) this.dockYSubject.next(y);
  }

  private readStyle(): NavControlsStyle {
    try {
      const raw = localStorage.getItem(STYLE_KEY);
      return raw === 'swipe' || raw === 'off' ? raw : 'button';
    } catch {
      return 'button';
    }
  }

  private readAppearance(): NavControlsAppearance {
    try {
      const raw = localStorage.getItem(APPEARANCE_KEY);
      return raw === 'solid' ? 'solid' : 'translucent';
    } catch {
      return 'translucent';
    }
  }

  private readPosition(): NavControlsPosition | null {
    try {
      const raw = localStorage.getItem(POSITION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return typeof parsed?.x === 'number' && typeof parsed?.y === 'number' ? parsed : null;
    } catch {
      return null;
    }
  }

  private readDocked(): NavControlsDockSide {
    try {
      const raw = localStorage.getItem(DOCKED_KEY);
      return raw === 'left' || raw === 'right' ? raw : null;
    } catch {
      return null;
    }
  }

  private readDockY(): number | null {
    try {
      const raw = localStorage.getItem(DOCK_Y_KEY);
      const n = raw != null ? Number(raw) : NaN;
      return Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  }
}
