import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';

import { DashboardSubscriptionAnalyticsComponent } from './dashboard-subscription-analytics.component';
import { AuthService } from 'src/app/services/auth.service';

describe('DashboardSubscriptionAnalyticsComponent', () => {
  let component: DashboardSubscriptionAnalyticsComponent;
  let fixture: ComponentFixture<DashboardSubscriptionAnalyticsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardSubscriptionAnalyticsComponent],
      providers: [
        provideMockStore(),
        { provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['isAdmin']) }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(DashboardSubscriptionAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
