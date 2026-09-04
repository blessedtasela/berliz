import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, convertToParamMap } from '@angular/router';
import { CenterGuard } from './center.guard';
import { SnackBarService } from '../services/snack-bar.service';

describe('CenterGuard', () => {
  let guard: CenterGuard;
  let mockRouter: Partial<Router>;
  let mockSnackbar: { openSnackBar: jasmine.Spy };

  beforeEach(() => {
    mockRouter = { navigate: jasmine.createSpy('navigate') };
    mockSnackbar = { openSnackBar: jasmine.createSpy('openSnackBar') };

    TestBed.configureTestingModule({
      providers: [
        CenterGuard,
        { provide: Router, useValue: mockRouter },
        { provide: SnackBarService, useValue: mockSnackbar }
      ]
    });

    guard = TestBed.inject(CenterGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('allows access for a valid slug', () => {
    const route = { paramMap: convertToParamMap({ name: 'downtown-fitness' }) } as ActivatedRouteSnapshot;

    expect(guard.canActivate(route)).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('redirects for a missing/too-short slug', () => {
    const route = { paramMap: convertToParamMap({ name: 'a' }) } as ActivatedRouteSnapshot;

    expect(guard.canActivate(route)).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/centers']);
  });

  it('redirects and shows a snackbar for an invalid slug format', () => {
    const route = { paramMap: convertToParamMap({ name: 'invalid name!' }) } as ActivatedRouteSnapshot;

    expect(guard.canActivate(route)).toBe(false);
    expect(mockSnackbar.openSnackBar).toHaveBeenCalledWith('Invalid center name format', 'error');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/centers']);
  });
});
