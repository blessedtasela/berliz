import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySubscriptionsFormComponent } from './my-subscriptions-form.component';

describe('MySubscriptionsFormComponent', () => {
  let component: MySubscriptionsFormComponent;
  let fixture: ComponentFixture<MySubscriptionsFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptionsFormComponent]
    });
    fixture = TestBed.createComponent(MySubscriptionsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
