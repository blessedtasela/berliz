import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySubscriptionsExpiredComponent } from './my-subscriptions-expired.component';

describe('MySubscriptionsExpiredComponent', () => {
  let component: MySubscriptionsExpiredComponent;
  let fixture: ComponentFixture<MySubscriptionsExpiredComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptionsExpiredComponent],
      imports: [CommonModule],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(MySubscriptionsExpiredComponent);
    component = fixture.componentInstance;
    component.subscription = { plan: 'Basic', endDate: new Date() } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
