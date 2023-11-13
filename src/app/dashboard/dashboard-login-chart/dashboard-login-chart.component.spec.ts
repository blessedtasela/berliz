import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardLoginChartComponent } from './dashboard-login-chart.component';

describe('DashboardLoginChartComponent', () => {
  let component: DashboardLoginChartComponent;
  let fixture: ComponentFixture<DashboardLoginChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardLoginChartComponent]
    });
    fixture = TestBed.createComponent(DashboardLoginChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
