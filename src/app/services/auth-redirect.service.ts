import { Injectable } from '@angular/core';
import { Params, Router } from '@angular/router';

/**
 * The one place that knows how to send a visitor to /login while remembering
 * where they were (and optionally what they were trying to do), so
 * LoginFormComponent can send them right back once they're signed in.
 * Every "you need to log in to do that" gate in the app should call
 * `goToLogin()` instead of a bare `router.navigate(['/login'])`.
 */
@Injectable({ providedIn: 'root' })
export class AuthRedirectService {

  constructor(private router: Router) { }

  /**
   * @param action optional one-word flag a handful of pages check for on
   *   return to resume the specific action (e.g. "book", "testimonial") --
   *   see BookingDialogService/TestimonialDialogService. Most call sites
   *   don't pass one; landing back on the right page is enough there.
   */
  goToLogin(action?: string): void {
    const current = this.router.url;

    // Never chain a returnUrl back to /login itself (e.g. two gates firing
    // in a row, or a manual logout from the login page somehow).
    const queryParams: Params = current && !current.startsWith('/login')
      ? { returnUrl: current, ...(action ? { action } : {}) }
      : {};

    this.router.navigate(['/login'], { queryParams });
  }
}
