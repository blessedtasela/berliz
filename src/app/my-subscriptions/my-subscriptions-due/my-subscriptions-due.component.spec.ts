import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySubscriptionsDueComponent } from './my-subscriptions-due.component';

describe('MySubscriptionsDueComponent', () => {
  let component: MySubscriptionsDueComponent;
  let fixture: ComponentFixture<MySubscriptionsDueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptionsDueComponent]
    });
    fixture = TestBed.createComponent(MySubscriptionsDueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
