import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from 'src/environments/environment';
import { ClientOnboardingService } from './client-onboarding.service';

describe('ClientOnboardingService', () => {
  let service: ClientOnboardingService;
  let http: HttpTestingController;
  const base = environment.api + '/client-onboarding';

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ClientOnboardingService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('reads my profile and fills in the lists and date the server may leave out', () => {
    let got: any;
    service.getMine().subscribe(o => (got = o));
    http.expectOne(`${base}/mine`).flush({ data: { userId: 4, started: true, completionPercent: 50, targetDate: [2026, 12, 5] } });
    expect(got.equipment).toEqual([]);
    expect(got.goals).toEqual([]);
    expect(got.targetDate).toBe('2026-12-05');
    expect(got.completionPercent).toBe(50);
  });

  it('saves one step with PUT', () => {
    service.saveMine({ currentStep: 2, fitnessLevel: 'beginner' }).subscribe();
    const req = http.expectOne(`${base}/mine`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ currentStep: 2, fitnessLevel: 'beginner' });
    req.flush({ data: {} });
  });

  it('deletes the health answers', () => {
    service.deleteMyHealthAnswers().subscribe();
    const req = http.expectOne(`${base}/mine/health`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ data: {} });
  });

  it('asks for a client by user id', () => {
    service.getForClient(12).subscribe();
    http.expectOne(`${base}/client/12`).flush({ data: { userId: 12 } });
  });

  it('asks for completion of several clients in one request, and none when there are none', () => {
    service.getCompletion([3, 4]).subscribe();
    const req = http.expectOne(r => r.url === `${base}/completion`);
    expect(req.request.params.get('clientIds')).toBe('3,4');
    req.flush({ data: { 3: 100, 4: 33 } });

    let empty: any;
    service.getCompletion([]).subscribe(m => (empty = m));
    http.expectNone(r => r.url === `${base}/completion`);
    expect(empty).toEqual({});
  });
});
