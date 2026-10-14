import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { HttpClient, HttpEventType, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('TokenInterceptorInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    providers: [
        AuthInterceptor,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
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
    imports: [RouterTestingModule],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
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

/**
 * Uploads used to be cut off after a flat 90 s however much had gone up, so a healthy 50 MB video on a
 * slow mobile connection failed. Now only silence (no progress, no response) ends one.
 */
describe('AuthInterceptor upload timeouts', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;

  beforeEach(() => {
    localStorage.removeItem('token');
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ]
    });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => httpMock.verify());

  it('keeps a slow upload alive for longer than the old 90 s cap as long as bytes keep going up', fakeAsync(() => {
    let finished = false;
    let failed: any;
    const form = new FormData();
    form.append('files', new Blob(['x']), 'a.mp4');
    http.post('/api/strapi/upload', form, { reportProgress: true, observe: 'events' })
      .subscribe({ next: e => { if (e.type === HttpEventType.Response) finished = true; }, error: e => (failed = e) });
    const req = httpMock.expectOne('/api/strapi/upload');

    for (let i = 1; i <= 8; i++) {
      tick(60_000); // 8 minutes in total, a progress event every minute
      req.event({ type: HttpEventType.UploadProgress, loaded: i * 10, total: 100 });
    }
    expect(failed).toBeUndefined();
    req.flush([]);
    expect(finished).toBeTrue();
  }));

  it('gives up on an upload that goes silent', fakeAsync(() => {
    let failed: any;
    const form = new FormData();
    form.append('files', new Blob(['x']), 'a.mp4');
    http.post('/api/strapi/upload', form, { reportProgress: true, observe: 'events' }).subscribe({ error: e => (failed = e) });
    httpMock.expectOne('/api/strapi/upload');

    tick(121_000);
    expect(failed?.error?.message).toContain('taking too long');
    flush();
  }));

  it('still times ordinary requests out after 20 s', fakeAsync(() => {
    let failed: any;
    http.get('/api/trainer/getActiveTrainers').subscribe({ error: e => (failed = e) });
    httpMock.expectOne('/api/trainer/getActiveTrainers');

    tick(21_000);
    expect(failed?.error?.message).toContain('taking too long');
    flush();
  }));
});
