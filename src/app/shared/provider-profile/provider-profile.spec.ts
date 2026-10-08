import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from 'src/environments/environment';
import { HowItWorksComponent } from './how-it-works.component';
import { ProfileCtaComponent, StickyBookBarComponent } from './profile-cta.component';
import { profileTheme } from './profile-theme';
import { ProviderAvailabilityComponent, formatClock } from './provider-availability.component';
import { ProviderPackagesComponent } from './provider-packages.component';
import { ProviderTermsComponent } from './provider-terms.component';

const text = (f: ComponentFixture<unknown>) => (f.nativeElement as HTMLElement).textContent?.replace(/\s+/g, ' ') ?? '';

describe('provider profile shared cards', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  });

  describe('profileTheme', () => {
    it('gives the public site zinc classes and the dashboard gray + dark: classes', () => {
      expect(profileTheme('dark').card).toContain('bg-zinc-900');
      expect(profileTheme('light').card).toContain('dark:bg-gray-900');
    });
  });

  describe('ProviderTermsComponent', () => {
    function make(inputs: Partial<ProviderTermsComponent>) {
      const f = TestBed.createComponent(ProviderTermsComponent);
      Object.assign(f.componentInstance, inputs);
      f.detectChanges();
      return f;
    }

    it('shows the provider\'s own rate and cancellation terms', () => {
      const f = make({ hourlyRate: 80, freeCancelHours: 48, lateCancelRefundPercent: 25 });
      expect(text(f)).toContain('$80');
      expect(text(f)).toContain('Free up to 48h before');
      expect(text(f)).toContain('25% is refunded');
    });

    it('falls back to the platform defaults (24h / 50%) when unset', () => {
      const f = make({});
      expect(text(f)).toContain('Free up to 24h before');
      expect(text(f)).toContain('50% is refunded');
      expect(text(f)).toContain('Agreed with the provider');
    });

    it('says nothing is refunded when the late refund is 0%', () => {
      expect(text(make({ lateCancelRefundPercent: 0 }))).toContain('nothing is refunded');
    });
  });

  describe('formatClock', () => {
    it('renders 24h times the way people say them', () => {
      expect(formatClock('09:00:00')).toBe('9:00 AM');
      expect(formatClock('12:30:00')).toBe('12:30 PM');
      expect(formatClock('00:15:00')).toBe('12:15 AM');
      expect(formatClock('17:45:00')).toBe('5:45 PM');
      expect(formatClock('soon')).toBe('soon');
    });
  });

  describe('ProviderAvailabilityComponent', () => {
    const row = (dayOfWeek: number, startTime: string, endTime: string, isActive = true) =>
      ({ id: dayOfWeek, dayOfWeek, startTime, endTime, isActive } as any);

    it('lists Monday first, marks unscheduled days Closed, and ignores inactive rows', () => {
      const rows = ProviderAvailabilityComponent.toRows([
        row(1, '09:00:00', '17:00:00'),
        row(0, '10:00:00', '12:00:00', false),
        row(3, '08:00:00', '10:00:00'),
        row(3, '14:00:00', '16:00:00'),
      ]);
      expect(rows.map(r => r.label)).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
      expect(rows[0].windows).toEqual(['9:00 AM – 5:00 PM']);
      expect(rows[1].windows).toEqual([]);
      expect(rows[2].windows).toEqual(['8:00 AM – 10:00 AM', '2:00 PM – 4:00 PM']);
      expect(rows[6].windows).toEqual([]);
    });

    it('has no rows at all when nothing is active', () => {
      expect(ProviderAvailabilityComponent.toRows([])).toEqual([]);
      expect(ProviderAvailabilityComponent.toRows([row(1, '09:00:00', '17:00:00', false)])).toEqual([]);
    });

    it('fetches the trainer\'s hours and renders them; hides itself when empty on marketing pages', () => {
      const http = TestBed.inject(HttpTestingController);
      const f = TestBed.createComponent(ProviderAvailabilityComponent);
      f.componentInstance.trainerId = 7;
      f.componentRef.setInput('trainerId', 7);
      f.detectChanges();
      http.expectOne(r => r.url.includes('/availability/getProviderAvailability') && r.url.includes('trainerId=7'))
        .flush({ data: [row(2, '06:00:00', '09:00:00')] });
      f.detectChanges();
      expect(text(f)).toContain('Weekly hours');
      expect(text(f)).toContain('6:00 AM – 9:00 AM');

      const g = TestBed.createComponent(ProviderAvailabilityComponent);
      g.componentRef.setInput('centerId', 3);
      g.detectChanges();
      http.expectOne(r => r.url.includes('centerId=3')).flush({ data: [] });
      g.detectChanges();
      expect(text(g)).toBe('');

      const h = TestBed.createComponent(ProviderAvailabilityComponent);
      h.componentRef.setInput('centerId', 4);
      h.componentRef.setInput('showEmpty', true);
      h.detectChanges();
      http.expectOne(r => r.url.includes('centerId=4')).flush({ data: [] });
      h.detectChanges();
      expect(text(h)).toContain('No weekly hours published yet');
    });
  });

  describe('ProviderPackagesComponent', () => {
    const pkg = (over: any) => ({
      id: 1, name: 'Starter', description: null, sessionCount: 5, price: 200, currency: 'USD',
      durationDays: 30, groupSize: 1, billingType: 'ONE_TIME', isActive: true, sortOrder: 0, ...over,
    });

    it('renders plans with per-session cost, validity and a Popular flag on the first when asked', () => {
      const http = TestBed.inject(HttpTestingController);
      const f = TestBed.createComponent(ProviderPackagesComponent);
      f.componentRef.setInput('trainerId', 9);
      f.componentRef.setInput('highlightFirst', true);
      f.componentRef.setInput('bookLink', ['/trainers', 'jo', 'book']);
      f.detectChanges();
      http.expectOne(r => r.url.includes('/provider-package/provider?trainerId=9'))
        .flush({ data: [pkg({ id: 2, name: 'Unlimited', sessionCount: null, price: 150, billingType: 'RECURRING', sortOrder: 1 }), pkg({})] });
      f.detectChanges();
      const t = text(f);
      expect(t).toContain('Starter');
      expect(t).toContain('$200');
      expect(t).toContain('5 sessions');
      expect(t).toContain('$40 each');
      expect(t).toContain('Valid for 30 days');
      expect(t).toContain('Unlimited sessions');
      expect(t).toContain('/ billing cycle');
      expect(t).toContain('Popular');
      expect((f.nativeElement as HTMLElement).querySelectorAll('a[href="/trainers/jo/book"]').length).toBe(2);
      // sorted by sortOrder: Starter (0) before Unlimited (1)
      expect(t.indexOf('Starter')).toBeLessThan(t.indexOf('Unlimited'));
    });

    it('uses the center endpoint for centers and emits choose when selectable', () => {
      const http = TestBed.inject(HttpTestingController);
      const f = TestBed.createComponent(ProviderPackagesComponent);
      f.componentRef.setInput('centerId', 5);
      f.componentRef.setInput('selectable', true);
      const chosen: any[] = [];
      f.componentInstance.choose.subscribe(p => chosen.push(p));
      f.detectChanges();
      http.expectOne(r => r.url.includes('/provider-package/provider?centerId=5')).flush({ data: [pkg({})] });
      f.detectChanges();
      (f.nativeElement as HTMLElement).querySelector('button')!.click();
      expect(chosen.length).toBe(1);
      expect(chosen[0].name).toBe('Starter');
    });

    it('renders nothing for a provider with no packages unless showEmpty', () => {
      const http = TestBed.inject(HttpTestingController);
      const f = TestBed.createComponent(ProviderPackagesComponent);
      f.componentRef.setInput('trainerId', 1);
      f.detectChanges();
      http.expectOne(r => r.url.includes('trainerId=1')).flush({ data: [] });
      f.detectChanges();
      expect(text(f)).toBe('');

      const g = TestBed.createComponent(ProviderPackagesComponent);
      g.componentRef.setInput('trainerId', 2);
      g.componentRef.setInput('showEmpty', true);
      g.detectChanges();
      http.expectOne(r => r.url.includes('trainerId=2')).flush({ data: [] });
      g.detectChanges();
      expect(text(g)).toContain('No packages published yet');
    });

    it('treats a failed request as no packages rather than breaking the page', () => {
      const http = TestBed.inject(HttpTestingController);
      const f = TestBed.createComponent(ProviderPackagesComponent);
      f.componentRef.setInput('trainerId', 3);
      f.detectChanges();
      http.expectOne(r => r.url.includes('trainerId=3')).flush('nope', { status: 500, statusText: 'err' });
      f.detectChanges();
      expect(text(f)).toBe('');
      expect(environment.api).toBeDefined();
    });
  });

  describe('HowItWorksComponent', () => {
    it('names the provider in the steps', () => {
      const f = TestBed.createComponent(HowItWorksComponent);
      f.componentRef.setInput('providerLabel', 'this center');
      f.detectChanges();
      expect(text(f)).toContain('Pick a time');
      expect(text(f)).toContain('This center accepts your request');
    });
  });

  describe('ProfileCtaComponent / StickyBookBarComponent', () => {
    it('CTA band emits book and links to the booking page', () => {
      const f = TestBed.createComponent(ProfileCtaComponent);
      f.componentRef.setInput('name', 'Jo Coach');
      f.componentRef.setInput('bookLink', ['/trainers', 'jo-coach', 'book']);
      let booked = 0;
      f.componentInstance.book.subscribe(() => booked++);
      f.detectChanges();
      expect(text(f)).toContain('Ready to start with Jo Coach?');
      (f.nativeElement as HTMLElement).querySelector('button')!.click();
      expect(booked).toBe(1);
      expect((f.nativeElement as HTMLElement).querySelector('a')!.getAttribute('href')).toBe('/trainers/jo-coach/book');
    });

    it('sticky bar stays hidden until the visitor has scrolled past the hero', () => {
      const f = TestBed.createComponent(StickyBookBarComponent);
      f.componentRef.setInput('name', 'Jo Coach');
      f.detectChanges();
      expect(text(f)).toBe('');
      f.componentInstance.visible = true;
      f.detectChanges();
      expect(text(f)).toContain('Jo Coach');
      expect(text(f)).toContain('Book now');
    });
  });
});
