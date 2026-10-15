import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MySubscriptionsActiveComponent } from './my-subscriptions-active.component';

describe('MySubscriptionsActiveComponent', () => {
  let component: MySubscriptionsActiveComponent;
  let fixture: ComponentFixture<MySubscriptionsActiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptionsActiveComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(MySubscriptionsActiveComponent);
    component = fixture.componentInstance;
    component.subscription = { id: 1 } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  const badge = () => fixture.nativeElement.querySelector('[data-testid="store-badge"]') as HTMLElement | null;

  it('shows no store badge for a Stripe-billed subscription', () => {
    expect(badge()).toBeNull();
    expect(component.storeLabel).toBe('');
  });

  it('says "Billed by the App Store" for a subscription bought in the iOS app', () => {
    component.subscription = { id: 1, store: 'app_store', mode: 'APP_STORE' } as any;
    fixture.detectChanges();

    expect(badge()?.textContent?.trim()).toBe('Billed by the App Store');
  });

  it('says "Billed by the Google Play" for one bought in the Android app', () => {
    component.subscription = { id: 1, mode: 'PLAY_STORE' } as any;
    fixture.detectChanges();

    expect(badge()?.textContent?.trim()).toBe('Billed by the Google Play');
  });
});
