import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAppAnalyticsComponent } from './dashboard-app-analytics.component';

describe('DashboardAppAnalyticsComponent', () => {
  let component: DashboardAppAnalyticsComponent;
  let fixture: ComponentFixture<DashboardAppAnalyticsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardAppAnalyticsComponent]
    });
    fixture = TestBed.createComponent(DashboardAppAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
