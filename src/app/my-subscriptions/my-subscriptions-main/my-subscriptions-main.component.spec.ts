import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySubscriptionsMainComponent } from './my-subscriptions-main.component';

describe('MySubscriptionsMainComponent', () => {
  let component: MySubscriptionsMainComponent;
  let fixture: ComponentFixture<MySubscriptionsMainComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptionsMainComponent]
    });
    fixture = TestBed.createComponent(MySubscriptionsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
