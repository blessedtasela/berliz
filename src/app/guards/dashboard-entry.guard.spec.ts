import { TestBed } from '@angular/core/testing';
import { Router, UrlSegment, UrlTree } from '@angular/router';

import { dashboardEntryGuard } from './dashboard-entry.guard';
import { AuthService } from '../services/auth.service';

describe('dashboardEntryGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let auth: { isAuthenticated: jasmine.Spy };

  const run = (segments: string[] = ['dashboard']) =>
    TestBed.runInInjectionContext(() => dashboardEntryGuard({} as any, segments.map(s => new UrlSegment(s, {}))));

  beforeEach(() => {
    auth = { isAuthenticated: jasmine.createSpy('isAuthenticated') };
    router = jasmine.createSpyObj('Router', ['createUrlTree', 'getCurrentNavigation']);
    router.createUrlTree.and.callFake((commands: any[], extras: any) => ({ commands, extras }) as unknown as UrlTree);
    router.getCurrentNavigation.and.returnValue(null);
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: auth }, { provide: Router, useValue: router }],
    });
  });

  it('lets a signed-in visitor load the dashboard', () => {
    auth.isAuthenticated.and.returnValue(true);
    expect(run()).toBeTrue();
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('sends a signed-out visitor to login at once, remembering where they were headed', () => {
    auth.isAuthenticated.and.returnValue(false);
    const result = run(['dashboard']) as any;
    expect(result.commands).toEqual(['/login']);
    expect(result.extras).toEqual({ queryParams: { returnUrl: '/dashboard' } });
  });

  it('keeps the full path of a deep link', () => {
    auth.isAuthenticated.and.returnValue(false);
    expect((run(['dashboard', 'payments']) as any).extras.queryParams.returnUrl).toBe('/dashboard/payments');
  });

  it('prefers the full requested URL (with its query) when the router knows it', () => {
    auth.isAuthenticated.and.returnValue(false);
    router.getCurrentNavigation.and.returnValue({ extractedUrl: { toString: () => '/dashboard/bookings?tab=paid' } } as any);
    expect((run(['dashboard', 'bookings']) as any).extras.queryParams.returnUrl).toBe('/dashboard/bookings?tab=paid');
  });
});
