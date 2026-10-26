import { isPlatformBrowser } from '@angular/common';
import { inject } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

/**
 * Calls `onDone` once the first load has finished (either action), in the browser only.
 *
 * A list is only "empty" after its first load. The initial store value is an empty array, which looks identical to a real
 * empty result, so components pair this with a `loaded` flag: skeleton until it flips, empty state after. It never fires
 * on the server, so the prerendered HTML carries the skeleton rather than a baked "coming soon".
 *
 * `done` takes NgRx action creators (or action type strings).
 */
export function watchFirstLoad(actions$: Actions, platformId: object, done: any[], onDone: () => void): Subscription {
  if (!isPlatformBrowser(platformId)) return new Subscription();
  return actions$.pipe(ofType(...done), take(1)).subscribe(() => onDone());
}

/**
 * `Actions` when the app (or a test) provides it, else null. `inject(Actions, { optional: true })` is not enough: the token
 * itself is providedIn root, so it throws on its *own* missing dependency (ScannedActionsSubject) rather than returning null.
 */
export function injectActionsOrNull(): Actions | null {
  try {
    return inject(Actions);
  } catch {
    return null;
  }
}
