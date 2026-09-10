import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { SnackBarService } from './snack-bar.service';

/**
 * A lazy chunk / dynamically-imported module failing to load is almost never
 * a real bug — it's a browser tab that has been open since before the last
 * deploy, still asking the server for chunk file names that the new build
 * replaced (no service worker here, so a long-lived tab can sit on a stale
 * build indefinitely). The symptom the user sees is "a button did nothing"
 * or "the app froze" until they manually refresh; a hard reload fetches the
 * current build and everything works again.
 *
 * These are the phrasings that failure takes across Chrome / Firefox /
 * Safari and webpack / esbuild builds. Kept deliberately broad.
 */
const CHUNK_LOAD_ERROR = new RegExp(
  [
    'ChunkLoadError',
    'Loading chunk [\\w-]+ failed',
    'Loading CSS chunk',
    'Failed to fetch dynamically imported module',
    'error loading dynamically imported module',
    'Importing a module script failed',
    "'text/html' is not a valid JavaScript MIME type",
    'expected a JavaScript module script but the server responded with a MIME type of "text/html"',
  ].join('|'),
  'i',
);

/** Don't reload more than once per this window — if the reload itself keeps
 *  hitting the same error (genuinely offline, server down), stop trying and
 *  let the user see a normal error instead of an endless refresh loop. */
const RELOAD_COOLDOWN_MS = 15_000;
const RELOAD_MARKER_KEY = 'chunkReloadAt';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {

  constructor(
    private snackbar: SnackBarService,
    private zone: NgZone
  ) { }

  handleError(error: any): void {
    const message = this.messageOf(error);

    if (CHUNK_LOAD_ERROR.test(message) && this.canReload()) {
      // Stale build. Reload the current URL from the server so the tab picks
      // up the new chunk hashes; the user just sees a normal page refresh.
      this.markReloaded();
      window.location.reload();
      return;
    }

    // Always dismiss any stuck loading snackbar on an unhandled error.
    this.zone.run(() => this.snackbar.dismiss());

    // Keep Angular's normal error logging working.
    console.error('Unhandled error:', error);
  }

  private messageOf(error: any): string {
    if (!error) return '';
    // Angular wraps rejections as `{ rejection: Error }`; also check .message and .name.
    const parts = [
      error.message,
      error.name,
      error.rejection?.message,
      error.rejection?.name,
      typeof error === 'string' ? error : '',
      String(error),
    ];
    return parts.filter(Boolean).join(' | ');
  }

  private canReload(): boolean {
    try {
      const last = Number(sessionStorage.getItem(RELOAD_MARKER_KEY) || 0);
      return Date.now() - last > RELOAD_COOLDOWN_MS;
    } catch {
      // No sessionStorage (private mode edge cases) — safer to allow the one reload.
      return true;
    }
  }

  private markReloaded(): void {
    try {
      sessionStorage.setItem(RELOAD_MARKER_KEY, String(Date.now()));
    } catch { /* ignore */ }
  }
}
