import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';

import { PrivacyPageComponent } from './privacy-page.component';

describe('PrivacyPageComponent', () => {
  let component: PrivacyPageComponent;
  let fixture: ComponentFixture<PrivacyPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrivacyPageComponent],
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

  it('flags the Stripe/payments section as a TODO pending integration', () => {
    const todoBadges = fixture.debugElement.queryAll(By.css('span'))
      .filter(el => (el.nativeElement as HTMLElement).textContent?.trim() === 'TODO');
    expect(todoBadges.length).withContext('a TODO badge should mark the Stripe section').toBeGreaterThan(0);
  });

  it('links privacy questions to the Contact Us page', () => {
    const links = fixture.debugElement.queryAll(By.css('a'));
    const contactLink = links.find(l => /contact us/i.test((l.nativeElement as HTMLElement).textContent || ''));
    expect(contactLink).withContext('a "contact us" link should be present').toBeTruthy();
    expect((contactLink!.nativeElement as any).routerLink).toEqual(['/contact']);
  });
});
