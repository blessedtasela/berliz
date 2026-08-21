import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';

import { DashboardActivityChartComponent } from './dashboard-activity-chart.component';
import { AuthService } from 'src/app/services/auth.service';

describe('DashboardActivityChartComponent', () => {
  let component: DashboardActivityChartComponent;
  let fixture: ComponentFixture<DashboardActivityChartComponent>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAdmin']);
    authServiceSpy.isAdmin.and.returnValue(false);

    TestBed.configureTestingModule({
      declarations: [DashboardActivityChartComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(DashboardActivityChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
