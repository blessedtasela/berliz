import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CategoryGuard } from './category.guard';
import { CategoryService } from '../services/category.service';
import { SnackBarService } from '../services/snack-bar.service';

describe('CategoryGuard', () => {
  let guard: CategoryGuard;
  let mockRouter: Partial<Router>;
  let mockCategoryService: { getCategory: jasmine.Spy };
  let mockSnackBarService: { openSnackBar: jasmine.Spy };

  beforeEach(() => {
    mockRouter = { navigate: jasmine.createSpy('navigate') };
    mockSnackBarService = { openSnackBar: jasmine.createSpy('openSnackBar') };
    mockCategoryService = { getCategory: jasmine.createSpy('getCategory') };

    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      providers: [
        CategoryGuard,
        { provide: Router, useValue: mockRouter },
        { provide: SnackBarService, useValue: mockSnackBarService },
        { provide: CategoryService, useValue: mockCategoryService }
      ]
    });

    guard = TestBed.inject(CategoryGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('redirects immediately for a missing/invalid id param', (done) => {
    const route = { paramMap: convertToParamMap({}) } as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    guard.canActivate(route, state).subscribe(result => {
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/disciplines']);
      expect(mockCategoryService.getCategory).not.toHaveBeenCalled();
      done();
    });
  });

  it('allows access when the category exists', (done) => {
    mockCategoryService.getCategory.and.returnValue(of({ data: { id: 5 } } as any));
    const route = { paramMap: convertToParamMap({ id: '5' }) } as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    guard.canActivate(route, state).subscribe(result => {
      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('redirects when the category does not exist, saying "Discipline" not "Category"', (done) => {
    mockCategoryService.getCategory.and.returnValue(of({ data: null } as any));
    const route = { paramMap: convertToParamMap({ id: '999' }) } as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    guard.canActivate(route, state).subscribe(result => {
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/disciplines']);
      expect(mockSnackBarService.openSnackBar).toHaveBeenCalledWith('Discipline not found', 'error');
      done();
    });
  });

  it('redirects with "Discipline not found" when the backend genuinely 404s', (done) => {
    mockCategoryService.getCategory.and.returnValue(throwError(() => ({ status: 404 })));
    const route = { paramMap: convertToParamMap({ id: '999' }) } as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    guard.canActivate(route, state).subscribe(result => {
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/disciplines']);
      expect(mockSnackBarService.openSnackBar).toHaveBeenCalledWith('Discipline not found', 'error');
      done();
    });
  });

  /**
   * Regression coverage for the bug where /category/getCategory/{id} was missing from
   * SecurityConfig's permitAll (fixed on the backend separately): every anonymous visitor got a
   * 401, which this guard used to treat identically to a genuine 404 and falsely claim the
   * discipline doesn't exist. Any non-404 failure must let the page through instead.
   */
  it('does not claim "not found" for a non-404 failure -- a 401 or network blip is not the same thing', (done) => {
    mockCategoryService.getCategory.and.returnValue(throwError(() => ({ status: 401 })));
    const route = { paramMap: convertToParamMap({ id: '5' }) } as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    guard.canActivate(route, state).subscribe(result => {
      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(mockSnackBarService.openSnackBar).not.toHaveBeenCalled();
      done();
    });
  });
});
