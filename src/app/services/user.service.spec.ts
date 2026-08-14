import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from 'src/environments/environment';

import { UserService } from './user.service';
import { ApiResponse } from '../models/Api.interface';
import { AuthResponse } from '../models/Auth.interface';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
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
});
