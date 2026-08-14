import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
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
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/services']);
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

  it('redirects when the category does not exist', (done) => {
    mockCategoryService.getCategory.and.returnValue(of({ data: null } as any));
    const route = { paramMap: convertToParamMap({ id: '999' }) } as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    guard.canActivate(route, state).subscribe(result => {
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/services']);
      expect(mockSnackBarService.openSnackBar).toHaveBeenCalled();
      done();
    });
  });
});
