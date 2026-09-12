import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NavControlsStyle = 'button' | 'swipe' | 'off';
export type NavControlsAppearance = 'translucent' | 'solid';

export interface NavControlsPosition {
  x: number;
  y: number;
}

const STYLE_KEY = 'navControlsStyle';
const APPEARANCE_KEY = 'navControlsAppearance';
const POSITION_KEY = 'navControlsPosition';

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

  readonly style$: Observable<NavControlsStyle> = this.styleSubject.asObservable();
  readonly appearance$: Observable<NavControlsAppearance> = this.appearanceSubject.asObservable();
  readonly position$: Observable<NavControlsPosition | null> = this.positionSubject.asObservable();

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
}
