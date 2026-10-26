import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlSegment } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Stops a signed-out visitor *before* the dashboard's (large) lazy chunk is downloaded.
 *
 * `AuthGuard` on the dashboard's child routes only runs once the lazy module has loaded, so a logged-out /dashboard sat
 * blank for as long as that chunk took (about ten seconds on a slow connection) before bouncing to /login. As a
 * `canMatch` guard on the lazy route this redirects at once, carrying the same `returnUrl` AuthGuard uses. AuthGuard
 * still runs on every child route: this only moves the signed-out case earlier.
 */
export const dashboardEntryGuard: CanMatchFn = (_route, segments: UrlSegment[]) => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated()) return true;

  const router = inject(Router);
  const target = router.getCurrentNavigation()?.extractedUrl?.toString()
    ?? '/' + segments.map(s => s.path).join('/');
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: target } });
};
