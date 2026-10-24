import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CategoryService } from '../services/category.service';
import { SnackBarService } from '../services/snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryGuard implements CanActivate {

  constructor(
    private router: Router,
    private snackBarService: SnackBarService,
    private categoryService: CategoryService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const idParam = route.paramMap.get('id');
    const id = idParam ? +idParam : NaN;
    if (!idParam || isNaN(id) || id <= 0) {
      this.router.navigate(['/disciplines']);
      return of(false);
    }

    return this.categoryService.getCategory(id).pipe(
      map(response => !!response?.data),
      map(exists => {
        if (!exists) {
          this.snackBarService.openSnackBar('Discipline not found', 'error');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.router.navigate(['/disciplines']);
        }
        return exists;
      }),
      // A genuinely missing discipline throws a 404 (EntityNotFoundException on the backend), which
      // lands here rather than in the map() above -- that's the real "not found" case. Any other
      // status (a network blip, a 5xx, ...) is not the same thing and must not claim the discipline
      // doesn't exist: let the page through and have its own data-loading show the real error.
      catchError((err: { status?: number }) => {
        if (err?.status === 404) {
          this.snackBarService.openSnackBar('Discipline not found', 'error');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.router.navigate(['/disciplines']);
          return of(false);
        }
        return of(true);
      })
    );
  }
}
