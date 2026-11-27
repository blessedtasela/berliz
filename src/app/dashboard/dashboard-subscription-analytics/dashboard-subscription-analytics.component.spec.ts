import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { DashboardSubscriptionAnalyticsComponent } from './dashboard-subscription-analytics.component';
import { AuthService } from 'src/app/services/auth.service';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import {
  selectMySubscriptions,
  selectSubscriptionLoading,
  selectSubscriptions
} from 'src/app/state/subscription/subscription.selectors';

describe('DashboardSubscriptionAnalyticsComponent', () => {
  let component: DashboardSubscriptionAnalyticsComponent;
  let fixture: ComponentFixture<DashboardSubscriptionAnalyticsComponent>;
  let store: MockStore;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const sub = (id: number, status: 'true' | 'false', endDate: string | null = null): Subscriptions =>
    ({ id, status, endDate } as unknown as Subscriptions);

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAdmin']);

    TestBed.configureTestingModule({
      declarations: [DashboardSubscriptionAnalyticsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectSubscriptionLoading, value: false },
            { selector: selectSubscriptions, value: [] },
            { selector: selectMySubscriptions, value: [] },
          ],
        }),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(DashboardSubscriptionAnalyticsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    authServiceSpy.isAdmin.and.returnValue(false);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  /**
   * GN-106: the Overview widget must show the SAME total/active/expiring/expired as the real
   * Subscriptions table -- i.e. for an admin it must read every subscription (selectSubscriptions),
   * never just the signed-in admin's own (selectMySubscriptions, which is empty for an account
   * that doesn't personally hold any). Locking the already-correct source selection in with a
   * real regression test: this had zero coverage of the admin path before (the one existing test
   * hardcoded isAdmin() to false), so a future change could silently break it unnoticed.
   */
  it('as an admin, counts every subscription (selectSubscriptions), not just the admin\'s own', () => {
    authServiceSpy.isAdmin.and.returnValue(true);
    const future = new Date(Date.now() + 3 * 86400000).toISOString();
    const past = new Date(Date.now() - 3 * 86400000).toISOString();
    store.overrideSelector(selectSubscriptions, [
      sub(1, 'true'), sub(2, 'true'), sub(3, 'false'), sub(4, 'true', future), sub(5, 'false', past),
    ]);
    store.overrideSelector(selectMySubscriptions, []); // the admin's own -- must NOT be what gets counted
    store.refreshState();

    fixture.detectChanges();

    expect(component.total).toBe(5);
    expect(component.active).toBe(3);
    expect(component.expired).toBe(2);
    expect(component.expiringSoon).toBe(1);
    expect(component.scopeLabel).toBe('All users');
  });

  it('for a non-admin, counts only their own subscriptions (selectMySubscriptions)', () => {
    authServiceSpy.isAdmin.and.returnValue(false);
    store.overrideSelector(selectSubscriptions, [sub(1, 'true'), sub(2, 'true'), sub(3, 'true')]); // everyone's -- must NOT be counted
    store.overrideSelector(selectMySubscriptions, [sub(4, 'true')]);
    store.refreshState();

    fixture.detectChanges();

    expect(component.total).toBe(1);
    expect(component.active).toBe(1);
    expect(component.scopeLabel).toBe('You');
  });

  it('waits for the real response instead of drawing a chart of zeros while loading', () => {
    authServiceSpy.isAdmin.and.returnValue(true);
    store.overrideSelector(selectSubscriptionLoading, true);
    store.overrideSelector(selectSubscriptions, []);
    store.refreshState();

    fixture.detectChanges();

    expect(component.ready).toBeFalse();
  });
});
