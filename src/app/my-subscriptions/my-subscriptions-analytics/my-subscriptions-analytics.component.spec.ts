import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySubscriptionsAnalyticsComponent } from './my-subscriptions-analytics.component';

describe('MySubscriptionsAnalyticsComponent', () => {
  let component: MySubscriptionsAnalyticsComponent;
  let fixture: ComponentFixture<MySubscriptionsAnalyticsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptionsAnalyticsComponent]
    });
    fixture = TestBed.createComponent(MySubscriptionsAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
