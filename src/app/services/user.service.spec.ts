import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { environment } from 'src/environments/environment';

import { UserService } from './user.service';
import { ApiResponse } from '../models/Api.interface';
import { AuthResponse } from '../models/Auth.interface';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { logoutUser } from '../state/user/user.actions';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting(), provideMockStore()]
});
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // GN-49: the navbar/sidebar could show the PREVIOUS user's data after a logout, because the
  // NgRx `user` state was never reset -- only localStorage tokens were cleared.
  describe('logout', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'old-access');
      localStorage.setItem('refresh_token', 'old-refresh');
      localStorage.setItem('todaysTodo', 'something');
    });

    it('clears the stored tokens and dispatches logoutUser() to reset the NgRx user state', () => {
      const dispatchSpy = spyOn(store, 'dispatch');

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('todaysTodo')).toBeNull();
      expect(dispatchSpy).toHaveBeenCalledWith(logoutUser());
    });
  });

  describe('loginWithGoogle', () => {
    it('POSTs the ID token to /auth/google and returns the auth response', () => {
      const mockResponse: ApiResponse<AuthResponse> = {
        message: 'Login successful',
        success: true,
        statusCode: 200,
        data: {
          accessToken: 'access-jwt',
          refreshToken: 'refresh-jwt',
          user: {} as any,
        },
      };

      let actual: ApiResponse<AuthResponse> | undefined;
      service.loginWithGoogle('the-google-id-token').subscribe(res => (actual = res));

      const req = httpMock.expectOne(`${environment.api}/auth/google`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ token: 'the-google-id-token' });

      req.flush(mockResponse);

      expect(actual).toEqual(mockResponse);
    });

    it('propagates a failure response (e.g. invalid token) to the caller', () => {
      let error: any;
      service.loginWithGoogle('bad-token').subscribe({
        error: (err) => (error = err),
      });

      const req = httpMock.expectOne(`${environment.api}/auth/google`);
      req.flush({ message: 'Invalid or expired Google token' }, { status: 401, statusText: 'Unauthorized' });

      expect(error.status).toBe(401);
    });
  });

  describe('loginWithFacebook', () => {
    it('POSTs the access token to /auth/facebook and returns the auth response', () => {
      const mockResponse: ApiResponse<AuthResponse> = {
        message: 'Login successful',
        success: true,
        statusCode: 200,
        data: {
          accessToken: 'access-jwt',
          refreshToken: 'refresh-jwt',
          user: {} as any,
        },
      };

      let actual: ApiResponse<AuthResponse> | undefined;
      service.loginWithFacebook('the-fb-access-token').subscribe(res => (actual = res));

      const req = httpMock.expectOne(`${environment.api}/auth/facebook`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ token: 'the-fb-access-token' });

      req.flush(mockResponse);

      expect(actual).toEqual(mockResponse);
    });
  });

  describe('startRefreshTokenTimer', () => {
    const fiftyNineMinutes = 59 * 60 * 1000;

    beforeEach(() => {
      localStorage.setItem('token', 'old-access');
      localStorage.setItem('refresh_token', 'old-refresh');
    });

    afterEach(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
    });

    it('stores the refreshed tokens from the response body', fakeAsync(() => {
      service.startRefreshTokenTimer();
      tick(fiftyNineMinutes);
      httpMock.expectOne(r => r.url.endsWith('/user/refreshToken'))
        .flush({ data: { accessToken: 'new-access', refreshToken: 'new-refresh' } });

      expect(localStorage.getItem('token')).toBe('new-access');
      expect(localStorage.getItem('refresh_token')).toBe('new-refresh');
    }));

    it('keeps the current tokens when the backend rejects the refresh', fakeAsync(() => {
      service.startRefreshTokenTimer();
      tick(fiftyNineMinutes);
      httpMock.expectOne(r => r.url.endsWith('/user/refreshToken'))
        .flush({ data: { accessToken: null, refreshToken: null } });

      expect(localStorage.getItem('token')).toBe('old-access');
      expect(localStorage.getItem('refresh_token')).toBe('old-refresh');
    }));
  });
});
