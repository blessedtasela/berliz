import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { signedOutOnlyGuard } from './signed-out-only.guard';

describe('signedOutOnlyGuard', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  const run = () => TestBed.runInInjectionContext(() => signedOutOnlyGuard({} as any, {} as any));

  beforeEach(() => {
    auth = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    router = jasmine.createSpyObj('Router', ['createUrlTree']);
    router.createUrlTree.and.callFake((commands: any[]) => ({ commands }) as unknown as UrlTree);
    TestBed.configureTestingModule({ providers: [{ provide: AuthService, useValue: auth }, { provide: Router, useValue: router }] });
  });

  it('lets a signed-out visitor see the sign-up page', () => {
    auth.isAuthenticated.and.returnValue(false);
    expect(run()).toBeTrue();
  });

  it('sends someone who is already signed in to the dashboard', () => {
    auth.isAuthenticated.and.returnValue(true);
    expect((run() as any).commands).toEqual(['/dashboard']);
  });
});
