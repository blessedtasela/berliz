import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { DashboardRouteComponent } from './dashboard-route.component';

describe('DashboardRouteComponent', () => {
  let component: DashboardRouteComponent;
  let fixture: ComponentFixture<DashboardRouteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardRouteComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(DashboardRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
