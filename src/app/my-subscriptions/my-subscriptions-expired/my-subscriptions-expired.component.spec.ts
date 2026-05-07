import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySubscriptionsExpiredComponent } from './my-subscriptions-expired.component';

describe('MySubscriptionsExpiredComponent', () => {
  let component: MySubscriptionsExpiredComponent;
  let fixture: ComponentFixture<MySubscriptionsExpiredComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptionsExpiredComponent]
    });
    fixture = TestBed.createComponent(MySubscriptionsExpiredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
