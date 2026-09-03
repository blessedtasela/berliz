import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Keeps your place on a hard page refresh (F5 / Ctrl+R), not just in-app navigation.
 *
 * `RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })` (see
 * app-routing.module.ts) hands scroll control from the browser to Angular so that
 * in-app back/forward restores correctly and a fresh navigation starts at the top.
 * Angular does this by disabling the browser's own `history.scrollRestoration`,
 * which is what would otherwise have kept your place across a hard refresh --
 * so refreshing any page silently reset it to the top. This service restores
 * that behavior itself: it remembers the last scroll position for each URL
 * (sessionStorage, so it's per-tab and gone once the tab closes) and, only on
 * the first navigation after an actual reload, scrolls back to it.
 */
@Injectable({ providedIn: 'root' })
export class ScrollRestorationService {
  private static readonly STORAGE_KEY = 'berliz.scrollPositions';
  /** Caps how many distinct URLs are remembered per tab -- this is a scroll
   *  nicety, not a place to let sessionStorage grow without bound. */
  private static readonly MAX_ENTRIES = 40;

  private restoreAttempted = false;

  constructor(private router: Router) {}

  init(): void {
    this.trackScroll();

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        // Only the very first completed navigation after bootstrap can possibly
        // be "the page a reload landed on" -- every one after that is genuine
        // in-app navigation, which Angular's own scrollPositionRestoration
        // already handles correctly (scroll to top / restore on back-forward).
        if (this.restoreAttempted) return;
        this.restoreAttempted = true;
        this.restoreIfReload();
      });
  }

  private currentKey(): string {
    return location.pathname + location.search;
  }

  private trackScroll(): void {
    window.addEventListener('scroll', () => this.save(this.currentKey(), window.scrollY), { passive: true });
  }

  private save(key: string, y: number): void {
    try {
      const map = this.readMap();
      map[key] = y;
      const entries = Object.entries(map);
      const trimmed = entries.length > ScrollRestorationService.MAX_ENTRIES
        ? Object.fromEntries(entries.slice(entries.length - ScrollRestorationService.MAX_ENTRIES))
        : map;
      sessionStorage.setItem(ScrollRestorationService.STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // sessionStorage unavailable (private mode, quota, etc.) -- scroll
      // restore is a nicety, not something worth surfacing an error over.
    }
  }

  private readMap(): Record<string, number> {
    try {
      const raw = sessionStorage.getItem(ScrollRestorationService.STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private isReload(): boolean {
    try {
      const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      return entry?.type === 'reload';
    } catch {
      return false;
    }
  }

  private restoreIfReload(): void {
    if (!this.isReload()) return;

    const y = this.readMap()[this.currentKey()];
    if (!y || y <= 0) return;

    // The route we just landed on -- especially anything that fetches its
    // content over HTTP/NgRx -- often hasn't laid out its full height yet on
    // the tick right after a reload, so a single scrollTo would fall short.
    // Retry across a bounded run of frames instead of one fixed delay.
    let attempts = 0;
    const maxAttempts = 30;
    const tryRestore = () => {
      window.scrollTo(0, y);
      attempts++;
      if (Math.abs(window.scrollY - y) > 2 && attempts < maxAttempts) {
        requestAnimationFrame(tryRestore);
      }
    };
    requestAnimationFrame(tryRestore);
  }
}
