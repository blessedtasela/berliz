import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot } from "@angular/router";
import { SnackBarService } from "../services/snack-bar.service";

/**
 * Guards `/centers/:name`.
 *
 * Only validates the SHAPE of the slug — resolving the slug to an actual
 * center (and rendering a 404 state when it matches nothing) is the
 * responsibility of `CenterDetailComponent`, which needs the record anyway.
 * That avoids a duplicate `getActiveCenters()` round-trip on every profile
 * view and replaces the old blocking `window.alert()` dead-ends. Mirrors
 * `TrainerGuard` exactly.
 */
@Injectable({
  providedIn: 'root'
})
export class CenterGuard implements CanActivate {

  constructor(
    private router: Router,
    private snackbar: SnackBarService
  ) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {

    const name = route.paramMap.get('name');

    if (!name || name.trim().length < 2) {
      this.router.navigate(['/centers']);
      return false;
    }

    if (!/^[a-zA-Z0-9\-]+$/.test(name)) {
      this.snackbar.openSnackBar('Invalid center name format', 'error');
      this.router.navigate(['/centers']);
      return false;
    }

    return true;
  }
}
