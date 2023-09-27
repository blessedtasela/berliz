import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthenticationGuard } from './authentication.guard';
import { AuthenticationService } from '../services/authentication.service'; 

describe('AuthenticationGuard', () => {
  let guard: AuthenticationGuard;
  let mockRouter: Partial<Router>;
  let mockAuthService: Partial<AuthenticationService>;

  beforeEach(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    mockAuthService = {
      isLoggedIn: () => false // Mock the isLoggedIn method to always return false for testing purposes
    };

    TestBed.configureTestingModule({
      providers: [
        AuthenticationGuard,
        { provide: Router, useValue: mockRouter },
        { provide: AuthenticationService, useValue: mockAuthService }
      ]
    });

    guard = TestBed.inject(AuthenticationGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access for logged-in users', () => {
    mockAuthService.isLoggedIn = () => true; // Mock isLoggedIn to return true for a logged-in user

    const route = new ActivatedRouteSnapshot();
    const state: RouterStateSnapshot = jasmine.createSpyObj<RouterStateSnapshot>('RouterStateSnapshot', ['toString']);

    expect(guard.canActivate(route, state)).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled(); // We expect that navigate method is not called for a logged-in user
  });

  it('should navigate to login page for non-logged-in users', () => {
    const route = new ActivatedRouteSnapshot();
    const state: RouterStateSnapshot = jasmine.createSpyObj<RouterStateSnapshot>('RouterStateSnapshot', ['toString']);

    expect(guard.canActivate(route, state)).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']); // We expect that navigate method is called for a non-logged-in user
  });
});
