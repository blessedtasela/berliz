import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpEventType, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { StrapiService, UploadProgress } from './strapi.service';

describe('StrapiService', () => {
  let service: StrapiService;
  let http: HttpTestingController;

  const jpeg = (size = 1000) => new File([new Uint8Array(size)], 'photo.jpg', { type: 'image/jpeg' });
  const stored = [{ id: 7, name: 'photo.jpg', url: '/uploads/photo.jpg', mime: 'image/jpeg', size: 1 }];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    service = TestBed.inject(StrapiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('uploads the file as multipart under "files" and resolves with the stored file', () => {
    let result: any[] | undefined;
    service.uploadToStrapi(jpeg()).subscribe(r => (result = r));

    const req = http.expectOne(r => r.url.endsWith('/strapi/upload'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    expect((req.request.body as FormData).get('files')).toBeTruthy();
    req.flush(stored);

    expect(result?.length).toBe(1);
    expect(result![0].id).toBe(7);
    expect(result![0].fullUrl).toContain('/uploads/photo.jpg');
  });

  it('reports progress while the bytes go up and finishes with the result', () => {
    const steps: UploadProgress[] = [];
    service.uploadWithProgress(jpeg()).subscribe(s => steps.push(s));

    const req = http.expectOne(r => r.url.endsWith('/strapi/upload'));
    req.event({ type: HttpEventType.UploadProgress, loaded: 250, total: 1000 });
    req.event({ type: HttpEventType.UploadProgress, loaded: 1000, total: 1000 });
    req.flush(stored);

    expect(steps.map(s => s.percent)).toEqual([25, 99, 100]);
    expect(steps[steps.length - 1].done).toBeTrue();
    expect(steps[steps.length - 1].result?.[0].id).toBe(7);
  });

  it('refuses an oversized or unsupported file without sending anything', () => {
    let tooBig: any;
    const big = new File([new Uint8Array(1)], 'huge.mp4', { type: 'video/mp4' });
    Object.defineProperty(big, 'size', { value: 80 * 1024 * 1024 });
    service.uploadToStrapi(big).subscribe({ error: e => (tooBig = e) });
    expect(tooBig.error.message).toContain('80 MB');

    let wrongType: any;
    service.uploadToStrapi(new File(['x'], 'run.exe', { type: 'application/x-msdownload' }))
      .subscribe({ error: e => (wrongType = e) });
    expect(wrongType.error.message).toContain("isn't supported");

    http.expectNone(r => r.url.endsWith('/strapi/upload'));
  });

  it('sends a type the server can recognise when the browser supplied none', () => {
    service.uploadToStrapi(new File(['abc'], 'clip.mov', { type: '' })).subscribe();
    const req = http.expectOne(r => r.url.endsWith('/strapi/upload'));
    expect(((req.request.body as FormData).get('files') as File).type).toBe('video/quicktime');
    req.flush(stored);
  });

  it('turns a failed upload into a message a person can act on', () => {
    let error: any;
    service.uploadToStrapi(jpeg()).subscribe({ error: e => (error = e) });
    http.expectOne(r => r.url.endsWith('/strapi/upload'))
      .flush({ message: 'Unsupported or invalid file.' }, { status: 400, statusText: 'Bad Request' });
    expect(error.status).toBe(400);
    expect(error.error.message).toBe('Unsupported or invalid file.');
    expect(error.error.detail).toBe('Unsupported or invalid file.');

    let gateway: any;
    service.uploadToStrapi(jpeg()).subscribe({ error: e => (gateway = e) });
    http.expectOne(r => r.url.endsWith('/strapi/upload'))
      .flush({ message: 'Upload failed', detail: 'connect timed out' }, { status: 502, statusText: 'Bad Gateway' });
    expect(gateway.error.message).toContain('connect timed out');
  });
});
