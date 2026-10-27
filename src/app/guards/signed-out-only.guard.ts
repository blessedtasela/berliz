import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * For the sign-up pages: someone who is already signed in has no use for them, so they go to their dashboard
 * instead of finding a "create your account" form (previously left showing at "Step 3 of 3").
 */
export const signedOutOnlyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? inject(Router).createUrlTree(['/dashboard']) : true;
};
