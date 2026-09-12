import { TestBed } from '@angular/core/testing';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ClientMetaInterceptor } from './client-meta.interceptor';
import { environment } from 'src/environments/environment';

describe('ClientMetaInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: ClientMetaInterceptor, multi: true }
      ]
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('stamps every request with X-Client-Platform: web and X-Client-Version', () => {
    httpClient.get('/api/whatever').subscribe();

    const req = httpMock.expectOne('/api/whatever');
    expect(req.request.headers.get('X-Client-Platform')).toBe('web');
    expect(req.request.headers.get('X-Client-Version')).toBe(environment.appVersion);
    req.flush({});
  });

  it('stamps public endpoints too — this has nothing to do with auth', () => {
    httpClient.get('/user/login').subscribe();

    const req = httpMock.expectOne('/user/login');
    expect(req.request.headers.get('X-Client-Platform')).toBe('web');
    req.flush({});
  });
});
