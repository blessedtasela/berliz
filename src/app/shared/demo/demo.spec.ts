import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { DemoService, isDemoEmail } from 'src/app/services/demo.service';
import { UserService } from 'src/app/services/user.service';
import { selectUser } from 'src/app/state/user/user.selector';
import { DemoBannerComponent } from './demo-banner.component';
import { DemoEntryComponent } from './demo-entry.component';
import { ProductTourComponent } from './product-tour.component';
import { TourService, tourStepsFor } from './tour.service';

const text = (f: { nativeElement: unknown }) => ((f.nativeElement as HTMLElement).textContent ?? '').replace(/\s+/g, ' ').trim();

describe('demo workspaces (web)', () => {

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideMockStore({
        selectors: [{ selector: selectUser, value: null }],
      })],
    });
  });

  describe('isDemoEmail', () => {
    it('matches the reserved domain only, case-insensitively', () => {
      expect(isDemoEmail('client@demo.berliz.fitness')).toBeTrue();
      expect(isDemoEmail('Anyone@DEMO.Berliz.Fitness')).toBeTrue();
      expect(isDemoEmail('sam@gmail.com')).toBeFalse();
      expect(isDemoEmail('sam@notdemo.berliz.fitness')).toBeFalse();
      expect(isDemoEmail(null)).toBeFalse();
    });
  });

  describe('DemoService', () => {
    it('reads the backend switch once and caches it', () => {
      const http = TestBed.inject(HttpTestingController);
      const demo = TestBed.inject(DemoService);
      const seen: boolean[] = [];

      demo.isEnabled().subscribe(v => seen.push(v));
      demo.isEnabled().subscribe(v => seen.push(v));
      http.expectOne(r => r.url.endsWith('/demo/status')).flush({ data: { enabled: true } });

      expect(seen).toEqual([true, true]);
      http.verify(); // no second request
    });

    it('reads a failing status call as "demos are off", never as an error', () => {
      const http = TestBed.inject(HttpTestingController);
      let enabled: boolean | undefined;
      TestBed.inject(DemoService).isEnabled().subscribe(v => enabled = v);

      http.expectOne(r => r.url.endsWith('/demo/status')).flush('x', { status: 500, statusText: 'err' });

      expect(enabled).toBeFalse();
    });

    it('stores the session the way a normal login does and starts the refresh timer', () => {
      const http = TestBed.inject(HttpTestingController);
      const user = TestBed.inject(UserService);
      spyOn(user, 'startRefreshTokenTimer');
      let done = false;

      TestBed.inject(DemoService).start('trainer').subscribe(() => done = true);
      const req = http.expectOne(r => r.url.endsWith('/demo/session'));
      expect(req.request.body).toEqual({ role: 'trainer' });
      req.flush({ message: 'Demo started', data: { accessToken: 'A', refreshToken: 'R' } });

      expect(done).toBeTrue();
      expect(localStorage.getItem('token')).toBe('A');
      expect(localStorage.getItem('refresh_token')).toBe('R');
      expect(user.startRefreshTokenTimer).toHaveBeenCalled();
    });

    it('stores nothing and errors when the backend returns no tokens', () => {
      const http = TestBed.inject(HttpTestingController);
      let message = '';

      TestBed.inject(DemoService).start('client').subscribe({ error: e => message = e.message });
      http.expectOne(r => r.url.endsWith('/demo/session')).flush({ message: 'Demo workspaces are not available right now.', data: {} });

      expect(message).toContain('not available');
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('DemoEntryComponent', () => {
    function make(enabled: boolean, inputs: Partial<DemoEntryComponent> = {}) {
      const f = TestBed.createComponent(DemoEntryComponent);
      Object.assign(f.componentInstance, inputs);
      f.detectChanges();
      TestBed.inject(HttpTestingController).expectOne(r => r.url.endsWith('/demo/status')).flush({ data: { enabled } });
      f.detectChanges();
      return f;
    }

    it('renders nothing when demos are off', () => {
      expect(text(make(false))).toBe('');
    });

    it('offers the three roles when demos are on', () => {
      const t = text(make(true));
      expect(t).toContain('Explore as a client');
      expect(t).toContain('Explore as a trainer');
      expect(t).toContain('Explore as a center');
      expect(t).toContain('resets every night');
    });

    it('compact mode is a single quiet line', () => {
      const t = text(make(true, { compact: true }));
      expect(t).toContain('or look around first');
      expect(t).toContain('as a trainer');
    });
  });

  describe('tour', () => {
    it('provider roles get provider steps; everyone else gets client steps; always 3 or fewer', () => {
      expect(tourStepsFor('trainer')[0].title).toContain('what clients see');
      expect(tourStepsFor('center')[0].title).toContain('what clients see');
      expect(tourStepsFor('client')[0].title).toContain('coach or gym');
      expect(tourStepsFor(undefined)[0].title).toContain('coach or gym');
      for (const role of ['client', 'trainer', 'center', null]) expect(tourStepsFor(role).length).toBeLessThanOrEqual(3);
    });

    it('steps forward and back, and finishes on the last Next', () => {
      const store = TestBed.inject(MockStore);
      store.overrideSelector(selectUser, { role: 'client' } as any);
      const tour = TestBed.inject(TourService);
      let state: any = 'unset';
      tour.state$.subscribe(s => state = s);

      expect(state).toBeNull(); // never auto-starts
      tour.start();
      expect(state.index).toBe(0);
      tour.back();
      expect(state.index).toBe(0);
      tour.next(); tour.next();
      expect(state.index).toBe(2);
      tour.next();
      expect(state).toBeNull();
    });

    it('the overlay shows the step, and Escape closes it', () => {
      const store = TestBed.inject(MockStore);
      store.overrideSelector(selectUser, { role: 'trainer' } as any);
      const tour = TestBed.inject(TourService);
      const f = TestBed.createComponent(ProductTourComponent);
      f.detectChanges();
      expect(text(f)).toBe('');

      tour.start();
      f.detectChanges();
      expect(text(f)).toContain('Quick tour · 1 of 3');
      expect(text(f)).toContain('Set up what clients see');

      f.componentInstance.onEscape();
      f.detectChanges();
      expect(text(f)).toBe('');
    });
  });

  describe('DemoBannerComponent', () => {
    it('shows only inside a demo account', () => {
      const store = TestBed.inject(MockStore);
      const f = TestBed.createComponent(DemoBannerComponent);

      store.overrideSelector(selectUser, { email: 'sam@gmail.com' } as any);
      store.refreshState();
      f.detectChanges();
      expect(text(f)).toBe('');

      store.overrideSelector(selectUser, { email: 'client@demo.berliz.fitness' } as any);
      store.refreshState();
      f.detectChanges();
      expect(text(f)).toContain("You're exploring a demo");
      expect(text(f)).toContain('Take a 30-second tour');
      expect(text(f)).toContain('Create your free account');
    });
  });
});
