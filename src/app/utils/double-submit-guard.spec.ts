import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { installDoubleSubmitGuard } from './double-submit-guard';
import { RequestActivityInterceptor, RequestActivityService } from '../services/request-activity.service';

describe('RequestActivityService', () => {
  it('tracks begin/end and runs idle callbacks once everything has finished', () => {
    const a = new RequestActivityService();
    const calls: string[] = [];
    a.begin(); a.begin();
    expect(a.busy).toBeTrue();
    a.onIdleOnce(() => calls.push('idle'));
    a.end();
    expect(calls).toEqual([]);
    a.end();
    expect(calls).toEqual(['idle']);
    expect(a.busy).toBeFalse();
    a.onIdleOnce(() => calls.push('now'));
    expect(calls).toEqual(['idle', 'now']);
  });

  it('never goes below zero', () => {
    const a = new RequestActivityService();
    a.end();
    a.begin();
    expect(a.busy).toBeTrue();
  });
});

describe('RequestActivityInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;
  let activity: RequestActivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: RequestActivityInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
    activity = TestBed.inject(RequestActivityService);
  });

  it('is busy while a POST is in flight and idle after it settles', () => {
    http.post('/api/x', {}).subscribe();
    expect(activity.busy).toBeTrue();
    ctrl.expectOne('/api/x').flush({});
    expect(activity.busy).toBeFalse();
  });

  it('also settles on an error', () => {
    http.delete('/api/x').subscribe({ error: () => { } });
    expect(activity.busy).toBeTrue();
    ctrl.expectOne('/api/x').flush('no', { status: 500, statusText: 'err' });
    expect(activity.busy).toBeFalse();
  });

  it('ignores reads and analytics pings', () => {
    http.get('/api/x').subscribe();
    http.post('/api/provider-analytics/profileView', {}).subscribe();
    expect(activity.busy).toBeFalse();
    ctrl.match(() => true).forEach(r => r.flush({}));
  });
});

describe('installDoubleSubmitGuard', () => {
  let doc: Document;
  let activity: RequestActivityService;
  let remove: () => void;
  let form: HTMLFormElement;
  let handled: number;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('guard');
    activity = new RequestActivityService();
    remove = installDoubleSubmitGuard(doc, activity);
    form = doc.createElement('form');
    doc.body.appendChild(form);
    handled = 0;
    form.addEventListener('submit', e => { e.preventDefault(); handled++; });
  });

  afterEach(() => remove());

  const submit = () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

  it('lets the first submit through and swallows a second one while the request is in flight', fakeAsync(() => {
    submit();
    expect(handled).toBe(1);
    activity.begin(); // the submit handler fired a request
    tick(0);
    expect(form.getAttribute('data-submitting')).toBe('true');

    submit();
    expect(handled).toBe(1);
  }));

  it('unlocks the form when the request settles', fakeAsync(() => {
    submit();
    activity.begin();
    tick(0);
    activity.end();
    expect(form.hasAttribute('data-submitting')).toBeFalse();
    submit();
    expect(handled).toBe(2);
  }));

  it('never locks a form whose submit started no request (e.g. it failed validation)', fakeAsync(() => {
    submit();
    tick(0);
    expect(form.hasAttribute('data-submitting')).toBeFalse();
    submit();
    expect(handled).toBe(2);
  }));

  it('does not touch other forms', fakeAsync(() => {
    const other = doc.createElement('form');
    doc.body.appendChild(other);
    let otherHandled = 0;
    other.addEventListener('submit', e => { e.preventDefault(); otherHandled++; });

    submit();
    activity.begin();
    tick(0);
    other.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(otherHandled).toBe(1);
  }));
});
