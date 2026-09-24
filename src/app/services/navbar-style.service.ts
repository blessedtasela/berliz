import { Injectable } from '@angular/core';

export type NavbarStyle = 'translucent' | 'solid';

const STYLE_KEY = 'navbarStyle';

/**
 * The top bar's background finish — per-device (localStorage), same
 * reasoning as NavControlsService/BrowserNotificationService: a display
 * preference, not account data worth syncing across devices.
 *
 * Default is 'translucent' (frosted glass, page content shows through while
 * scrolling underneath it) rather than a flat white bar — product decision
 * 2026-09. 'solid' is offered for anyone who finds the see-through effect
 * distracting.
 */
@Injectable({ providedIn: 'root' })
export class NavbarStyleService {

  get style(): NavbarStyle {
    try {
      const raw = localStorage.getItem(STYLE_KEY);
      return raw === 'solid' ? 'solid' : 'translucent';
    } catch {
      return 'translucent';
    }
  }

  setStyle(style: NavbarStyle): void {
    try { localStorage.setItem(STYLE_KEY, style); } catch { /* degrade silently */ }
  }

  /** Tailwind classes for the top bar's own background — solid is opaque
   *  white with no blur, translucent is a frosted-glass effect. Dark-mode
   *  companions included directly since this string fully replaces
   *  top-bar's own [ngClass] binding rather than merging with a static one. */
  get bgClasses(): string {
    return this.style === 'solid'
      ? 'bg-white dark:bg-gray-900'
      : 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-md';
  }
}
