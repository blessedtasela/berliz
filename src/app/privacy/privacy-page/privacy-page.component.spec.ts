import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { PrivacyPageComponent } from './privacy-page.component';

describe('PrivacyPageComponent', () => {
  let component: PrivacyPageComponent;
  let fixture: ComponentFixture<PrivacyPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PrivacyPageComponent, RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(PrivacyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a non-dismissible draft/legal-review disclaimer banner', () => {
    const banner = fixture.debugElement.query(By.css('[data-testid="legal-disclaimer-banner"]'));
    expect(banner).withContext('disclaimer banner should be present').toBeTruthy();

    const bannerText = ((banner.nativeElement as HTMLElement).textContent || '').replace(/\s+/g, ' ').trim();
    expect(bannerText).toContain('has not yet been reviewed by a licensed attorney');
    expect(bannerText.toLowerCase()).toContain('legal review is required');

    // Non-dismissible: no close/dismiss control inside the banner.
    const dismissControl = banner.query(By.css('button, [aria-label*="close" i], [aria-label*="dismiss" i]'));
    expect(dismissControl).withContext('banner must not have a close/dismiss control').toBeFalsy();
  });

  it('renders real Privacy Policy content instead of a placeholder', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(text).not.toContain('Coming Soon');
    expect(text).toContain('Privacy');

    // Every section defined on the component should actually render.
    for (const section of component.sections) {
      expect(text).toContain(section.title);
    }
  });

  it('covers data collection, third parties, rights, cookies, and children\'s privacy', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(text.toLowerCase()).toContain('strapi');
    expect(text.toLowerCase()).toContain('stripe');
    expect(text.toLowerCase()).toContain('cookies');
    expect(text.toLowerCase()).toContain('18');
  });

  it('describes payments as live, not a pending TODO -- Stripe Checkout/Connect shipped', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(text.toLowerCase()).not.toContain('not yet live');
    expect(text.toLowerCase()).not.toContain('placeholder');

    const todoBadges = fixture.debugElement.queryAll(By.css('span'))
      .filter(el => (el.nativeElement as HTMLElement).textContent?.trim() === 'TODO');
    expect(todoBadges.length).withContext('no section should still be marked TODO').toBe(0);
  });

  it('links privacy questions to the Contact Us page', () => {
    const links = fixture.debugElement.queryAll(By.css('a'));
    const contactLink = links.find(l => /contact us/i.test((l.nativeElement as HTMLElement).textContent || ''));
    expect(contactLink).withContext('a "contact us" link should be present').toBeTruthy();
    // Assert the rendered href (public behaviour) rather than RouterLink's private
    // `commands` field, which Angular renames between majors.
    expect(contactLink!.nativeElement.getAttribute('href')).toBe('/contact');
  });
});
