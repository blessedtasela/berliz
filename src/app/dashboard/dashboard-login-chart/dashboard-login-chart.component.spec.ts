import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';

import { DashboardLoginChartComponent } from './dashboard-login-chart.component';
import { AuthService } from 'src/app/services/auth.service';

describe('DashboardLoginChartComponent', () => {
  let component: DashboardLoginChartComponent;
  let fixture: ComponentFixture<DashboardLoginChartComponent>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAdmin']);
    authServiceSpy.isAdmin.and.returnValue(false);

    TestBed.configureTestingModule({
      declarations: [DashboardLoginChartComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(DashboardLoginChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
