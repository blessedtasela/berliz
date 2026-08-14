import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthenticationGuard } from './authentication.guard';

describe('AuthenticationGuard', () => {
  let guard: AuthenticationGuard;
  let mockRouter: Partial<Router>;

  beforeEach(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    spyOn(window, 'alert');

    TestBed.configureTestingModule({
      providers: [
        AuthenticationGuard,
        { provide: Router, useValue: mockRouter }
      ]
    });

    guard = TestBed.inject(AuthenticationGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('always denies access and redirects to login', () => {
    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
