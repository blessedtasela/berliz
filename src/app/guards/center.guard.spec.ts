import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { CenterGuard } from './center.guard';
import { CenterService } from '../services/center.service';

describe('CenterGuard', () => {
  let guard: CenterGuard;
  let mockRouter: Partial<Router>;
  let mockCenterService: Partial<CenterService>;

  beforeEach(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate') // Mock the Router's navigate method
    };

    mockCenterService = {
      isValidCenter: (name: string) => true // Mock the isValidCenter method to always return true for testing purposes
    };

    TestBed.configureTestingModule({
      providers: [
        CenterGuard,
        { provide: Router, useValue: mockRouter },
        { provide: CenterService, useValue: mockCenterService }
      ]
    });

    guard = TestBed.inject(CenterGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access for valid center id', () => {
    const route = new ActivatedRouteSnapshot();

    const state: RouterStateSnapshot = jasmine.createSpyObj<RouterStateSnapshot>('RouterStateSnapshot', ['toString']);

    expect(guard.canActivate(route, state)).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled(); // We expect that navigate method is not called for valid center
  });

  it('should navigate to center page for invalid center id', () => {
    const route = new ActivatedRouteSnapshot();


    const state: RouterStateSnapshot = jasmine.createSpyObj<RouterStateSnapshot>('RouterStateSnapshot', ['toString']);

    expect(guard.canActivate(route, state)).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/centers']); // We expect that navigate method is called for invalid center
  });
});
