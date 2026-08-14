import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { CenterGuard } from './center.guard';
import { CenterService } from '../services/center.service';

describe('CenterGuard', () => {
  let guard: CenterGuard;
  let mockRouter: Partial<Router>;
  let mockCenterService: { getActiveCenters: jasmine.Spy };

  beforeEach(() => {
    mockRouter = { navigate: jasmine.createSpy('navigate') };
    mockCenterService = { getActiveCenters: jasmine.createSpy('getActiveCenters') };

    spyOn(window, 'alert');
    spyOn(window, 'scrollTo');

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

  it('redirects immediately for a missing/invalid id param', (done) => {
    const route = { paramMap: convertToParamMap({}) } as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    guard.canActivate(route, state).subscribe(result => {
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/centers']);
      expect(mockCenterService.getActiveCenters).not.toHaveBeenCalled();
      done();
    });
  });

  it('allows access when the center exists in the active list', (done) => {
    mockCenterService.getActiveCenters.and.returnValue(of({ data: [{ id: 5 }] } as any));
    const route = { paramMap: convertToParamMap({ id: '5' }) } as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    guard.canActivate(route, state).subscribe(result => {
      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('redirects when the center is not in the active list', (done) => {
    mockCenterService.getActiveCenters.and.returnValue(of({ data: [] } as any));
    const route = { paramMap: convertToParamMap({ id: '999' }) } as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    guard.canActivate(route, state).subscribe(result => {
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/centers']);
      done();
    });
  });
});
