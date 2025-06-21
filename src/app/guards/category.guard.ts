import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { CategoryStateService } from '../services/category-state.service'; // Update path if needed
import { SnackBarService } from '../services/snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryGuard implements CanActivate {

  constructor(
    private router: Router,
    private snackBarService: SnackBarService,
    private categoryStateService: CategoryStateService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const idParam = route.paramMap.get('id');
    if (!idParam) return false;

    const id = +idParam;
    if (isNaN(id) || id <= 0) return false;

    // Get current list of active categories from state
    let categoryExists = false;
    this.categoryStateService.getActiveCategories().subscribe(categories => {
      categoryExists = categories.some(cat => cat.id === id);
      if (!categoryExists) {
        this.snackBarService.openSnackBar('Category not found', 'error');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.router.navigate(['/services']);
      }
    });

    return true;
  }
}
