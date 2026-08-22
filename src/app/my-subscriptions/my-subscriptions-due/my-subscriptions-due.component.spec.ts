import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MySubscriptionsDueComponent } from './my-subscriptions-due.component';

describe('MySubscriptionsDueComponent', () => {
  let component: MySubscriptionsDueComponent;
  let fixture: ComponentFixture<MySubscriptionsDueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptionsDueComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(MySubscriptionsDueComponent);
    component = fixture.componentInstance;
    component.subscription = { id: 1 } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
