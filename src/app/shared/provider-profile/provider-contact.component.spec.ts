import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderContactComponent, contactDigits, mailHref, telHref, whatsappHref } from './provider-contact.component';

describe('ProviderContactComponent', () => {
  describe('link helpers', () => {
    it('keeps only the digits', () => {
      expect(contactDigits('+1 (416) 555-0123')).toBe('14165550123');
      expect(contactDigits(null)).toBe('');
    });

    it('builds tel:, WhatsApp and mailto links from the stored forms', () => {
      expect(telHref('+14165550123')).toBe('tel:+14165550123');
      expect(telHref('4165550123')).toBe('tel:4165550123');
      expect(whatsappHref('+14165550123')).toBe('https://wa.me/14165550123');
      expect(mailHref('desk@iron-works.ca')).toBe('mailto:desk@iron-works.ca');
    });
  });

  describe('rendering', () => {
    let fixture: ComponentFixture<ProviderContactComponent>;
    const render = (inputs: Partial<ProviderContactComponent>) => {
      fixture = TestBed.createComponent(ProviderContactComponent);
      Object.assign(fixture.componentInstance, inputs);
      fixture.detectChanges();
      return fixture.nativeElement as HTMLElement;
    };

    beforeEach(() => TestBed.configureTestingModule({ imports: [ProviderContactComponent] }));

    it('renders nothing when the provider has published no contact details', () => {
      expect(render({ name: 'Iron Works' }).querySelector('section')).toBeNull();
    });

    it('offers call, WhatsApp and email when all are published', () => {
      const el = render({ name: 'Iron Works', phone: '+14165550123', email: 'desk@iron-works.ca' });
      const hrefs = Array.from(el.querySelectorAll('a')).map(a => a.getAttribute('href'));

      expect(el.textContent).toContain('Contact Iron Works');
      expect(hrefs).toEqual(['tel:+14165550123', 'https://wa.me/14165550123', 'mailto:desk@iron-works.ca']);
    });

    it('offers only email when that is all there is', () => {
      const el = render({ name: 'Iron Works', email: 'desk@iron-works.ca' });

      expect(Array.from(el.querySelectorAll('a')).map(a => a.getAttribute('href'))).toEqual(['mailto:desk@iron-works.ca']);
    });

    it('drops the card and heading when compact', () => {
      const el = render({ name: 'Iron Works', email: 'desk@iron-works.ca', compact: true });

      expect(el.textContent).not.toContain('Contact Iron Works');
      expect(el.querySelectorAll('a').length).toBe(1);
    });
  });
});
