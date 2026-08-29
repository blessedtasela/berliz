import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  /**
   * Every route already declares `data.expectedRole` (an array of allowed
   * roles), but until now nothing actually read it — this guard let anyone
   * authenticated through regardless of role. Fixed here: not logged in ->
   * /login (carrying a returnUrl so LoginFormComponent can send them right
   * back here instead of always to /dashboard); logged in but role not in
   * the route's expectedRole list -> /dashboard (never a hard error, since
   * the user IS legitimately signed in, just not for this particular page).
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    const expectedRole: string[] | undefined = route.data?.['expectedRole'];

    if (!expectedRole || expectedRole.length === 0) {
      return true;
    }

    const currentRole = this.authService.getCurrentUserRole();

    if (currentRole && expectedRole.includes(currentRole)) {
      return true;
    }

    return this.router.parseUrl('/dashboard');
  }
}
