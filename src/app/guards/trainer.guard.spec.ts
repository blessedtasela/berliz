import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, convertToParamMap } from '@angular/router';
import { TrainerGuard } from './trainer.guard';
import { SnackBarService } from '../services/snack-bar.service';

describe('TrainerGuard', () => {
  let guard: TrainerGuard;
  let mockRouter: Partial<Router>;
  let mockSnackbar: { openSnackBar: jasmine.Spy };

  beforeEach(() => {
    mockRouter = { navigate: jasmine.createSpy('navigate') };
    mockSnackbar = { openSnackBar: jasmine.createSpy('openSnackBar') };

    TestBed.configureTestingModule({
      providers: [
        TrainerGuard,
        { provide: Router, useValue: mockRouter },
        { provide: SnackBarService, useValue: mockSnackbar }
      ]
    });

    guard = TestBed.inject(TrainerGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('allows access for a valid slug', () => {
    const route = { paramMap: convertToParamMap({ name: 'jane-doe' }) } as ActivatedRouteSnapshot;

    expect(guard.canActivate(route)).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('redirects for a missing/too-short slug', () => {
    const route = { paramMap: convertToParamMap({ name: 'a' }) } as ActivatedRouteSnapshot;

    expect(guard.canActivate(route)).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/trainers']);
  });

  it('redirects and shows a snackbar for an invalid slug format', () => {
    const route = { paramMap: convertToParamMap({ name: 'invalid name!' }) } as ActivatedRouteSnapshot;

    expect(guard.canActivate(route)).toBe(false);
    expect(mockSnackbar.openSnackBar).toHaveBeenCalledWith('Invalid trainer name format', 'error');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/trainers']);
  });
});
