import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot } from "@angular/router";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { TrainerService } from "../services/trainer.service";

@Injectable({
  providedIn: 'root'
})
export class TrainerGuard implements CanActivate {

  constructor(private router: Router,
    private trainerService: TrainerService) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {

    const name = route.paramMap.get('name');

    if (!name) {
      this.router.navigate(['/trainers']);
      return of(false);
    }

    if (name.trim().length < 2) {
      window.alert("Invalid trainer name");
      this.router.navigate(['/trainers']);
      return of(false);
    }

    const valid = /^[a-zA-Z0-9\-]+$/.test(name);
    if (!valid) {
      window.alert("Invalid trainer name format");
      this.router.navigate(['/trainers']);
      return of(false);
    }

    return this.trainerService.getActiveTrainers().pipe(
      map(response => (response?.data ?? []).some(
        trainer => trainer.name?.replace(/ /g, '-') === name
      )),
      map(exists => {
        if (!exists) {
          window.alert("Trainer not found");
          this.router.navigate(['/trainers']);
        }
        return exists;
      }),
      catchError(() => {
        window.alert("Trainer not found");
        this.router.navigate(['/trainers']);
        return of(false);
      })
    );
  }
}
