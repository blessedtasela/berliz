import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CenterService } from '../services/center.service';

@Injectable({
  providedIn: 'root'
})
export class CenterGuard implements CanActivate {
  constructor(private router: Router,
    private centerService: CenterService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const idParam = route.paramMap.get('id');
    const id = idParam ? +idParam : NaN;
    if (!idParam || isNaN(id) || id <= 0) {
      this.router.navigate(['/centers']);
      return of(false);
    }

    return this.centerService.getActiveCenters().pipe(
      map(response => (response?.data ?? []).some(center => center.id === id)),
      map(exists => {
        if (!exists) {
          window.alert('Center not found');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.router.navigate(['/centers']);
        }
        return exists;
      }),
      catchError(() => {
        window.alert('Center not found');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.router.navigate(['/centers']);
        return of(false);
      })
    );
  }
}
