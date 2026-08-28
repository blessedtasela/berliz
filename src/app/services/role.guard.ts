import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { SnackBarService } from './snack-bar.service';

/**
 * Every dashboard route already carries `data.expectedRole`, but nothing
 * ever read it — routes only ever used `canActivate: [AuthGuard]`, which
 * just checks "is this user logged in at all". Any authenticated user could
 * navigate straight into an admin-only route (e.g. an admin CRUD page), no
 * role check at all. Add alongside AuthGuard, not instead of it:
 * `canActivate: [AuthGuard, RoleGuard]`.
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBarService: SnackBarService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const expectedRole: string[] | undefined = route.data?.['expectedRole'];
    if (!expectedRole || expectedRole.length === 0) return true;

    const role = this.authService.getCurrentUserRole();
    if (role && expectedRole.some(r => r.toLowerCase() === role.toLowerCase())) {
      return true;
    }

    this.snackBarService.openSnackBar("You don't have access to that page.", 'error');
    return this.router.parseUrl('/dashboard');
  }
}
