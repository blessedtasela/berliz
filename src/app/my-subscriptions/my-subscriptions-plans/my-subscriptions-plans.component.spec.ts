import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySubscriptionsPlansComponent } from './my-subscriptions-plans.component';

describe('MySubscriptionsPlansComponent', () => {
  let component: MySubscriptionsPlansComponent;
  let fixture: ComponentFixture<MySubscriptionsPlansComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptionsPlansComponent]
    });
    fixture = TestBed.createComponent(MySubscriptionsPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
