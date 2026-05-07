import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySubscriptionsActionComponent } from './my-subscriptions-action.component';

describe('MySubscriptionsActionComponent', () => {
  let component: MySubscriptionsActionComponent;
  let fixture: ComponentFixture<MySubscriptionsActionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptionsActionComponent]
    });
    fixture = TestBed.createComponent(MySubscriptionsActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
