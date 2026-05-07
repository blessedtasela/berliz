import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySubscriptionsEmptyComponent } from './my-subscriptions-empty.component';

describe('MySubscriptionsEmptyComponent', () => {
  let component: MySubscriptionsEmptyComponent;
  let fixture: ComponentFixture<MySubscriptionsEmptyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptionsEmptyComponent]
    });
    fixture = TestBed.createComponent(MySubscriptionsEmptyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
