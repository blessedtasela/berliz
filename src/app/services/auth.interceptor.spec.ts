import { TestBed } from '@angular/core/testing';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('TokenInterceptorInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule, RouterTestingModule],
    providers: [
      AuthInterceptor
    ]
  }));

  it('should be created', () => {
    const interceptor: AuthInterceptor = TestBed.inject(AuthInterceptor);
    expect(interceptor).toBeTruthy();
  });
});

/**
 * A stale token left in localStorage from a previous session used to force
 * ANY 401 on ANY page straight to /login -- including a purely public page
 * (home, trainers, centers, ...) that never required being signed in, which
 * made the whole app look like it demanded a login just to browse it. The
 * fix: only navigate away when the visitor is actually on a route that
 * needs auth (everything under /dashboard); elsewhere just drop the dead
 * tokens and let the public page keep rendering.
 */
describe('AuthInterceptor forceLogout routing', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let router: Router;

  beforeEach(() => {
    localStorage.setItem('token', 'stale-token');
    localStorage.removeItem('refresh_token'); // no refresh token -> forceLogout fires immediately on a 401

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  });

  it('does not navigate to /login when a 401 hits on a public route', async () => {
    spyOn(router, 'navigate');
    Object.defineProperty(router, 'url', { value: '/trainers', configurable: true });

    const request$ = http.get('/api/trainer/getActiveTrainers').subscribe({ error: () => {} });
    httpMock.expectOne('/api/trainer/getActiveTrainers').flush('unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(router.navigate).not.toHaveBeenCalled();
    expect(TestBed.inject(AuthService).getToken()).toBeNull();
    request$.unsubscribe();
  });

  it('navigates to /login when a 401 hits on a protected dashboard route', () => {
    spyOn(router, 'navigate');
    Object.defineProperty(router, 'url', { value: '/dashboard/my-bookings', configurable: true });

    const request$ = http.get('/api/booking/getMyBookings').subscribe({ error: () => {} });
    httpMock.expectOne('/api/booking/getMyBookings').flush('unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(router.navigate).toHaveBeenCalledWith(['/login'], jasmine.any(Object));
    request$.unsubscribe();
  });
});
