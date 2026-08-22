import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MySubscriptionsExpiredComponent } from './my-subscriptions-expired.component';

describe('MySubscriptionsExpiredComponent', () => {
  let component: MySubscriptionsExpiredComponent;
  let fixture: ComponentFixture<MySubscriptionsExpiredComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptionsExpiredComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(MySubscriptionsExpiredComponent);
    component = fixture.componentInstance;
    component.subscription = { id: 1 } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
