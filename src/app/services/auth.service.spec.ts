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
});
