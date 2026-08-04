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
      this.router.navigate(['/services']);
      return of(false);
    }

    return this.categoryService.getCategory(id).pipe(
      map(response => !!response?.data),
      map(exists => {
        if (!exists) {
          this.snackBarService.openSnackBar('Category not found', 'error');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.router.navigate(['/services']);
        }
        return exists;
      }),
      catchError(() => {
        this.snackBarService.openSnackBar('Category not found', 'error');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.router.navigate(['/services']);
        return of(false);
      })
    );
  }
}
