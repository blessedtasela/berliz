import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSubscriptionAnalyticsComponent } from './dashboard-subscription-analytics.component';

describe('DashboardSubscriptionAnalyticsComponent', () => {
  let component: DashboardSubscriptionAnalyticsComponent;
  let fixture: ComponentFixture<DashboardSubscriptionAnalyticsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardSubscriptionAnalyticsComponent]
    });
    fixture = TestBed.createComponent(DashboardSubscriptionAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
