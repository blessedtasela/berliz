import { TestBed } from '@angular/core/testing';

import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('sets title, description and canonical for a known route', () => {
    service.updateForRoute('/trainers');
    expect(document.title).toContain('Trainer');
    const canonical = document.head.querySelector('link[rel="canonical"]');
    expect(canonical?.getAttribute('href')).toBe('https://www.berliz.fitness/trainers');
  });

  it('falls back to the default entry for an unknown route', () => {
    service.updateForRoute('/some-unmapped-route');
    const description = document.head.querySelector('meta[name="description"]');
    expect(description?.getAttribute('content')).toBeTruthy();
  });

  it('resolves a redirecting route (testimonials -> services) by its post-redirect path', () => {
    // SeoService is always called with urlAfterRedirects, so a visit to
    // /testimonials is seen here as /services.
    service.updateForRoute('/services');
    expect(document.title).toContain('Services');
  });
});
