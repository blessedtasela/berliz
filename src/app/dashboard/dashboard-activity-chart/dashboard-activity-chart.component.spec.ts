import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardActivityChartComponent } from './dashboard-activity-chart.component';

describe('DashboardActivityChartComponent', () => {
  let component: DashboardActivityChartComponent;
  let fixture: ComponentFixture<DashboardActivityChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardActivityChartComponent]
    });
    fixture = TestBed.createComponent(DashboardActivityChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
