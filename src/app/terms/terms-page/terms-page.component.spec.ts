import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { TermsPageComponent } from './terms-page.component';

describe('TermsPageComponent', () => {
  let component: TermsPageComponent;
  let fixture: ComponentFixture<TermsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TermsPageComponent, RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(TermsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not show a draft / legal-review warning banner', () => {
    expect(fixture.debugElement.query(By.css('[data-testid="legal-disclaimer-banner"]'))).toBeNull();
    const text = ((fixture.nativeElement as HTMLElement).textContent || '').toLowerCase();
    expect(text).not.toContain('has not yet been reviewed');
    expect(text).not.toContain('legal review is required');
  });

  it('renders the real Terms of Service content instead of a placeholder', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(text).not.toContain('Coming Soon');
    expect(text).toContain('Terms of');
    expect(text).toContain('Service');

    // Every section defined on the component should actually render.
    for (const section of component.sections) {
      expect(text).toContain(section.title);
    }
  });

  it('links questions to the Contact Us page', () => {
    const links = fixture.debugElement.queryAll(By.css('a'));
    const contactLink = links.find(l => /contact us/i.test((l.nativeElement as HTMLElement).textContent || ''));
    expect(contactLink).withContext('a "contact us" link should be present').toBeTruthy();
    // Assert the rendered href (public behaviour) rather than RouterLink's private
    // `commands` field, which Angular renames between majors.
    expect(contactLink!.nativeElement.getAttribute('href')).toBe('/contact');
  });
});
