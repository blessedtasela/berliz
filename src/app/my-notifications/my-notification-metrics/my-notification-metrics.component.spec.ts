import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyNotificationMetricsComponent } from './my-notification-metrics.component';

describe('MyNotificationMetricsComponent', () => {
  let component: MyNotificationMetricsComponent;
  let fixture: ComponentFixture<MyNotificationMetricsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyNotificationMetricsComponent]
    });
    fixture = TestBed.createComponent(MyNotificationMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
