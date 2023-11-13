import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardNotificationComponent } from './dashboard-notification.component';

describe('DashboardNotificationComponent', () => {
  let component: DashboardNotificationComponent;
  let fixture: ComponentFixture<DashboardNotificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardNotificationComponent]
    });
    fixture = TestBed.createComponent(DashboardNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
