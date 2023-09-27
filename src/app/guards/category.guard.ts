import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class CategoryGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const idParam = route.paramMap.get('id'); // Get the 'id' parameter from the route
    if (!idParam) {
      return false;
    }
    const id = +idParam; // Convert the string ID to a number using the '+' operator

    if (isNaN(id) || id <= 0) {
      return false;
    }



    if (!0) {
      // If the trainer with the given 'id' doesn't exist, redirect to trainers page
      window.alert("Category not found");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.router.navigate(['/categories']);
      return false;
    }

    return true; // Allow access to the CategoryDetails component
  }
}
