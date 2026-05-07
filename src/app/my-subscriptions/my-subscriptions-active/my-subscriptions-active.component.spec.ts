import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySubscriptionsActiveComponent } from './my-subscriptions-active.component';

describe('MySubscriptionsActiveComponent', () => {
  let component: MySubscriptionsActiveComponent;
  let fixture: ComponentFixture<MySubscriptionsActiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptionsActiveComponent]
    });
    fixture = TestBed.createComponent(MySubscriptionsActiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
