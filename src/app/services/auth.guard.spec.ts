import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  function route(expectedRole?: string[]): ActivatedRouteSnapshot {
    return { data: expectedRole ? { expectedRole } : {} } as unknown as ActivatedRouteSnapshot;
  }

  function state(url: string): RouterStateSnapshot {
    return { url } as RouterStateSnapshot;
  }

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getCurrentUserRole']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
      ]
    });

    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('redirects to /login carrying the attempted URL as returnUrl when logged out', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);

    const result = guard.canActivate(route(['client']), state('/dashboard/my-progress'));

    expect(router.serializeUrl(result as any)).toBe('/login?returnUrl=%2Fdashboard%2Fmy-progress');
  });

  it('allows access when logged in and the route has no expectedRole', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    const result = guard.canActivate(route(), state('/dashboard'));

    expect(result).toBe(true);
  });

  it('allows access when logged in and the current role is in expectedRole', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.getCurrentUserRole.and.returnValue('client');

    const result = guard.canActivate(route(['client', 'trainer']), state('/dashboard/my-bookings'));

    expect(result).toBe(true);
  });

  it('redirects to /dashboard when logged in but the role is not allowed for this route', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.getCurrentUserRole.and.returnValue('client');

    const result = guard.canActivate(route(['admin']), state('/dashboard/admin'));

    expect(router.serializeUrl(result as any)).toBe('/dashboard');
  });
});
