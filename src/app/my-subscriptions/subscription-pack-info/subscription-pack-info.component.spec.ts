import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SubscriptionPackInfoComponent } from './subscription-pack-info.component';

describe('SubscriptionPackInfoComponent', () => {
  let fixture: ComponentFixture<SubscriptionPackInfoComponent>;
  let component: SubscriptionPackInfoComponent;

  const show = (subscription: any, bookable = true) => {
    component.subscription = subscription;
    component.bookable = bookable;
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };
  const pack = (over: any = {}) => ({
    id: 1, providerPackage: { id: 7, name: 'Starter', sessionCount: 5, billingType: 'ONE_TIME' },
    trainer: { name: 'Jo Smith' }, sessionsTotal: 5, sessionsRemaining: 3, ...over,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SubscriptionPackInfoComponent], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(SubscriptionPackInfoComponent);
    component = fixture.componentInstance;
  });

  it('shows nothing for a Berliz plan', () => {
    expect(show({ id: 1, plan: 'Plus', providerPackage: null }).querySelector('[data-testid="pack-info"]')).toBeNull();
  });

  it('says what it is, who it is with, and how many sessions are left', () => {
    const text = show(pack()).textContent ?? '';

    expect(text).toContain('Session pack');
    expect(text).toContain('with Jo Smith');
    expect(text).toContain('3 of 5 sessions left');
    expect(component.percentLeft).toBe(60);
  });

  it('calls a monthly plan a subscription with unlimited sessions', () => {
    const el = show(pack({ providerPackage: { id: 8, billingType: 'RECURRING', sessionCount: null }, sessionsTotal: null, sessionsRemaining: null }));

    expect(el.textContent).toContain('Subscription');
    expect(el.querySelector('[data-testid="unlimited"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="sessions-left"]')).toBeNull();
  });

  it("offers to book a session out of it, on the provider's own page", () => {
    const link = show(pack()).querySelector('[data-testid="book-from-pack"]') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('/trainers/Jo-Smith/book?plan=7');
  });

  it('links to the centers page for a center plan', () => {
    const link = show(pack({ trainer: null, center: { name: 'Iron Works' } })).querySelector('[data-testid="book-from-pack"]') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('/centers/Iron-Works/book?plan=7');
  });

  it('stops offering to book once every session is used, or when the row has ended', () => {
    expect(show(pack({ sessionsRemaining: 0 })).querySelector('[data-testid="book-from-pack"]')).toBeNull();
    expect(show(pack(), false).querySelector('[data-testid="book-from-pack"]')).toBeNull();
  });
});
