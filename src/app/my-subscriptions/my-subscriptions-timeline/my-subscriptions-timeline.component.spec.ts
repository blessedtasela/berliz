import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySubscriptionsTimelineComponent } from './my-subscriptions-timeline.component';

describe('MySubscriptionsTimelineComponent', () => {
  let component: MySubscriptionsTimelineComponent;
  let fixture: ComponentFixture<MySubscriptionsTimelineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptionsTimelineComponent]
    });
    fixture = TestBed.createComponent(MySubscriptionsTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
