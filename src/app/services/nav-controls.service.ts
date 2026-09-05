import { Injectable } from '@angular/core';

export type NavControlsStyle = 'button' | 'swipe' | 'off';

export interface NavControlsPosition {
  x: number;
  y: number;
}

const STYLE_KEY = 'navControlsStyle';
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
 */
@Injectable({ providedIn: 'root' })
export class NavControlsService {

  get style(): NavControlsStyle {
    try {
      const raw = localStorage.getItem(STYLE_KEY);
      return raw === 'swipe' || raw === 'off' ? raw : 'button';
    } catch {
      return 'button';
    }
  }

  setStyle(style: NavControlsStyle): void {
    try { localStorage.setItem(STYLE_KEY, style); } catch { /* degrade silently */ }
  }

  /** Null means "no custom position saved yet" — the component computes its own default. */
  getPosition(): NavControlsPosition | null {
    try {
      const raw = localStorage.getItem(POSITION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return typeof parsed?.x === 'number' && typeof parsed?.y === 'number' ? parsed : null;
    } catch {
      return null;
    }
  }

  setPosition(position: NavControlsPosition): void {
    try { localStorage.setItem(POSITION_KEY, JSON.stringify(position)); } catch { /* degrade silently */ }
  }

  get hasCustomPosition(): boolean {
    return this.getPosition() !== null;
  }

  resetPosition(): void {
    try { localStorage.removeItem(POSITION_KEY); } catch { /* degrade silently */ }
  }
}
