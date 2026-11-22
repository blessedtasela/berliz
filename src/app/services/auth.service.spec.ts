import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { AuthService } from './auth.service';
import { AuthRedirectService } from './auth-redirect.service';
import { logoutUser } from '../state/user/user.actions';

describe('AuthService', () => {
  let service: AuthService;
  let store: MockStore;
  let authRedirect: jasmine.SpyObj<AuthRedirectService>;

  beforeEach(() => {
    authRedirect = jasmine.createSpyObj('AuthRedirectService', ['goToLogin']);
    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        { provide: AuthRedirectService, useValue: authRedirect },
      ],
    });
    service = TestBed.inject(AuthService);
    store = TestBed.inject(MockStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // GN-59: route guards must not hard-log-out a session whose access token merely
  // *looks* expired by this device's own clock -- the refresh token (and the
  // actual session) is still alive; see AuthService#hasSession's own doc comment.
  describe('hasSession', () => {
    it('is true whenever a token is present, even one whose exp has already passed locally', () => {
      spyOn(service, 'getToken').and.returnValue('some.jwt.token');
      spyOn(service, 'isAuthenticated').and.returnValue(false);

      expect(service.hasSession()).toBeTrue();
    });

    it('is false with no token at all', () => {
      spyOn(service, 'getToken').and.returnValue(null);

      expect(service.hasSession()).toBeFalse();
    });
  });

  // GN-49: the InactivityService logout path only cleared tokens, never the NgRx user state.
  describe('logout', () => {
    it('clears tokens, dispatches logoutUser() to reset the NgRx user state, and redirects to login', () => {
      spyOn(service, 'clearTokens');
      const dispatchSpy = spyOn(store, 'dispatch');

      service.logout();

      expect(service.clearTokens).toHaveBeenCalled();
      expect(dispatchSpy).toHaveBeenCalledWith(logoutUser());
      expect(authRedirect.goToLogin).toHaveBeenCalled();
    });
  });

  // GN-78: super-admin impersonation -- stash the admin's own tokens, swap in the target's, and
  // be able to cleanly restore them.
  describe('impersonation', () => {
    afterEach(() => {
      ['token', 'refresh_token', 'impersonator_token', 'impersonator_refresh_token'].forEach(k => localStorage.removeItem(k));
    });

    it('is not impersonating with no stashed admin token', () => {
      expect(service.isImpersonating()).toBeFalse();
    });

    it('startImpersonation stashes the current session and swaps in the target tokens', () => {
      localStorage.setItem('token', 'admin-access');
      localStorage.setItem('refresh_token', 'admin-refresh');

      service.startImpersonation('target-access', 'target-refresh');

      expect(service.isImpersonating()).toBeTrue();
      expect(localStorage.getItem('token')).toBe('target-access');
      expect(localStorage.getItem('refresh_token')).toBe('target-refresh');
      expect(localStorage.getItem('impersonator_token')).toBe('admin-access');
      expect(localStorage.getItem('impersonator_refresh_token')).toBe('admin-refresh');
    });

    it('starting a second impersonation keeps the ORIGINAL admin tokens stashed, not the first target\'s', () => {
      localStorage.setItem('token', 'admin-access');
      localStorage.setItem('refresh_token', 'admin-refresh');
      service.startImpersonation('first-target-access', 'first-target-refresh');

      service.startImpersonation('second-target-access', 'second-target-refresh');

      expect(localStorage.getItem('token')).toBe('second-target-access');
      expect(localStorage.getItem('impersonator_token')).toBe('admin-access');
      expect(localStorage.getItem('impersonator_refresh_token')).toBe('admin-refresh');
    });

    it('stopImpersonation restores the admin session and clears the stash', () => {
      localStorage.setItem('token', 'admin-access');
      localStorage.setItem('refresh_token', 'admin-refresh');
      service.startImpersonation('target-access', 'target-refresh');

      const restored = service.stopImpersonation();

      expect(restored).toBeTrue();
      expect(localStorage.getItem('token')).toBe('admin-access');
      expect(localStorage.getItem('refresh_token')).toBe('admin-refresh');
      expect(localStorage.getItem('impersonator_token')).toBeNull();
      expect(localStorage.getItem('impersonator_refresh_token')).toBeNull();
      expect(service.isImpersonating()).toBeFalse();
    });

    it('stopImpersonation is a no-op when nothing is being impersonated', () => {
      expect(service.stopImpersonation()).toBeFalse();
    });

    it('clearTokens also drops any stashed impersonator tokens, so a later unrelated login never misreports as impersonating', () => {
      localStorage.setItem('token', 'admin-access');
      localStorage.setItem('refresh_token', 'admin-refresh');
      service.startImpersonation('target-access', 'target-refresh');

      service.clearTokens();

      expect(localStorage.getItem('impersonator_token')).toBeNull();
      expect(localStorage.getItem('impersonator_refresh_token')).toBeNull();
      expect(service.isImpersonating()).toBeFalse();
    });
  });
});
