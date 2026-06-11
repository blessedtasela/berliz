import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class TrainerGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {

    const name = route.paramMap.get('name');

    // 1. Must exist
    if (!name) {
      this.router.navigate(['/trainers']);
      return false;
    }

    // 2. Must be at least 2 characters
    if (name.trim().length < 2) {
      window.alert("Invalid trainer name");
      this.router.navigate(['/trainers']);
      return false;
    }

    // 3. Optional: validate allowed characters (letters, numbers, hyphens)
    const valid = /^[a-zA-Z0-9\-]+$/.test(name);
    if (!valid) {
      window.alert("Invalid trainer name format");
      this.router.navigate(['/trainers']);
      return false;
    }

    return true;
  }
}
