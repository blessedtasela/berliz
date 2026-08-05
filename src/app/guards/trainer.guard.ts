import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot } from "@angular/router";
import { SnackBarService } from "../services/snack-bar.service";

/**
 * Guards `/trainers/:name`.
 *
 * Only validates the SHAPE of the slug — resolving the slug to an actual
 * trainer (and rendering a 404 state when it matches nothing) is the
 * responsibility of `TrainersDetailsComponent`, which needs the record
 * anyway. That avoids a duplicate `getActiveTrainers()` round-trip on every
 * profile view and replaces the old blocking `window.alert()` dead-ends.
 */
@Injectable({
  providedIn: 'root'
})
export class TrainerGuard implements CanActivate {

  constructor(
    private router: Router,
    private snackbar: SnackBarService
  ) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {

    const name = route.paramMap.get('name');

    if (!name || name.trim().length < 2) {
      this.router.navigate(['/trainers']);
      return false;
    }

    if (!/^[a-zA-Z0-9\-]+$/.test(name)) {
      this.snackbar.openSnackBar('Invalid trainer name format', 'error');
      this.router.navigate(['/trainers']);
      return false;
    }

    return true;
  }
}
