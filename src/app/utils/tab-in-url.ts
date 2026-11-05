import { Location } from '@angular/common';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export interface TabInUrl<T extends string> {
  /** The tab named by `?tab=` in the current address, or null when absent or not one of the screen's tabs. */
  fromUrl(): T | null;
  /** Writes the tab into the address without adding a history entry; the default tab leaves the address clean. */
  remember(tab: T, defaultTab?: T): void;
}

/**
 * Keeps a tabbed screen's active tab in the address (`?tab=earnings`) so a refresh, a shared link
 * or the back button lands on the same tab. Call it from a field initializer (injection context).
 */
export function tabInUrl<T extends string>(valid: readonly T[], fallback: T, param = 'tab'): TabInUrl<T> {
  const router = inject(Router);
  const location = inject(Location);

  return {
    fromUrl(): T | null {
      try {
        const raw = router.parseUrl(router.url).queryParams[param];
        return valid.includes(raw) ? (raw as T) : null;
      } catch {
        return null;
      }
    },
    remember(tab: T, defaultTab: T = fallback): void {
      // Remembering the tab is a convenience; it must never break the screen.
      try {
        const tree = router.parseUrl(router.url);
        const queryParams = { ...tree.queryParams };
        if (tab === defaultTab) delete queryParams[param];
        else queryParams[param] = tab;
        tree.queryParams = queryParams;
        location.replaceState(router.serializeUrl(tree));
      } catch {
        // address left as it was
      }
    },
  };
}
