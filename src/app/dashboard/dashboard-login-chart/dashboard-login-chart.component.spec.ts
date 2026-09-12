import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { DashboardLoginChartComponent } from './dashboard-login-chart.component';
import { AuthService } from 'src/app/services/auth.service';
import { LoginHistoryEntry, LoginStats } from 'src/app/models/analytics.interface';
import {
  selectAnalyticsLoading,
  selectLoginStats,
  selectMyLoginHistory
} from 'src/app/state/analytics/analytics.selectors';

describe('DashboardLoginChartComponent', () => {
  let component: DashboardLoginChartComponent;
  let fixture: ComponentFixture<DashboardLoginChartComponent>;
  let store: MockStore;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const baseStats: LoginStats = {
    days: 30,
    loginsByDay: [],
    deviceBreakdown: {},
    browserBreakdown: {},
    platformBreakdown: {},
    appVersionBreakdown: {},
    uniqueActiveUsers: 0,
    totalLogins: 0,
    measuredSessions: 0,
    totalSessionMinutes: 0,
    averageSessionMinutes: 0
  };

  function setUp() {
    fixture = TestBed.createComponent(DashboardLoginChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAdmin']);
    authServiceSpy.isAdmin.and.returnValue(false);

    TestBed.configureTestingModule({
      declarations: [DashboardLoginChartComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectLoginStats, value: null },
            { selector: selectMyLoginHistory, value: [] },
            { selector: selectAnalyticsLoading, value: false }
          ]
        }),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    store = TestBed.inject(MockStore);
  });

  it('should create', () => {
    setUp();
    expect(component).toBeTruthy();
  });

  it('admin scope: builds the web/ios/android split from LoginStats.platformBreakdown', () => {
    authServiceSpy.isAdmin.and.returnValue(true);
    store.overrideSelector(selectLoginStats, {
      ...baseStats,
      totalLogins: 6,
      platformBreakdown: { web: 3, ios: 2, android: 1, unknown: 0 }
    });
    store.refreshState();

    setUp();

    expect(component.platforms.map(p => [p.key, p.count])).toEqual([
      ['web', 3], ['ios', 2], ['android', 1]
    ]);
    // unknown had a count of 0 -> excluded, same rule as the device split.
    expect(component.platforms.find(p => p.key === 'unknown')).toBeUndefined();
  });

  it('personal scope: buckets platform from each LoginHistoryEntry.platform', () => {
    authServiceSpy.isAdmin.and.returnValue(false);
    const history: LoginHistoryEntry[] = [
      { id: 1, loginAt: new Date().toISOString(), lastActiveAt: null, deviceType: 'mobile', platform: 'ios', browser: 'Safari', os: 'iOS', appVersion: '3.1.0', durationMinutes: null },
      { id: 2, loginAt: new Date().toISOString(), lastActiveAt: null, deviceType: 'desktop', platform: 'web', browser: 'Chrome', os: 'Windows', appVersion: '0.1', durationMinutes: null },
    ];
    store.overrideSelector(selectMyLoginHistory, history);
    store.refreshState();

    setUp();

    const byKey = new Map(component.platforms.map(p => [p.key, p.count]));
    expect(byKey.get('ios')).toBe(1);
    expect(byKey.get('web')).toBe(1);
  });
});
