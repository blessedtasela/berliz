import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { CategoryGuard } from './category.guard';
import { CategoryService } from '../services/category.service';

describe('CategoryGuard', () => {
  let guard: CategoryGuard;
  let mockRouter: Partial<Router>;
  let mockCategoryService: Partial<CategoryService>;

  beforeEach(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate') // Mock the Router's navigate method
    };

    mockCategoryService = {
      isValidCategory: (name: string) => true // Mock the isValidCatgory method to always return true for testing purposes
    };

    TestBed.configureTestingModule({
      providers: [
        CategoryGuard,
        { provide: Router, useValue: mockRouter },
        { provide: CategoryService, useValue: mockCategoryService }
      ]
    });

    guard = TestBed.inject(CategoryGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access for valid category id', () => {
    const route = new ActivatedRouteSnapshot();

    const state: RouterStateSnapshot = jasmine.createSpyObj<RouterStateSnapshot>('RouterStateSnapshot', ['toString']);

    expect(guard.canActivate(route, state)).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled(); // We expect that navigate method is not called for valid category
  });

  it('should navigate to center page for invalid center id', () => {
    const route = new ActivatedRouteSnapshot();


    const state: RouterStateSnapshot = jasmine.createSpyObj<RouterStateSnapshot>('RouterStateSnapshot', ['toString']);

    expect(guard.canActivate(route, state)).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/centers']); // We expect that navigate method is called for invalid center
  });
});
