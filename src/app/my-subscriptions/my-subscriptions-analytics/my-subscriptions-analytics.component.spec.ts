import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MySubscriptionsAnalyticsComponent } from './my-subscriptions-analytics.component';

describe('MySubscriptionsAnalyticsComponent', () => {
  let component: MySubscriptionsAnalyticsComponent;
  let fixture: ComponentFixture<MySubscriptionsAnalyticsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptionsAnalyticsComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(MySubscriptionsAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('counts an unpaid checkout as awaiting payment, so the tiles add up to the rows', () => {
    component.subscriptions = [{ id: 1, status: 'PENDING_PAYMENT' }, { id: 2, status: 'true', endDate: null }, { id: 3, status: 'false' }] as any;
    component.ngOnChanges();
    fixture.detectChanges();
    expect(component.total).toBe(3);
    expect(component.active).toBe(1);
    expect(component.expired).toBe(1);
    expect(component.awaitingPayment).toBe(1);
    expect(component.active + component.expired + component.awaitingPayment).toBe(component.total);
    expect(fixture.nativeElement.querySelector('[data-testid=awaiting-tile]')).toBeTruthy();
  });

  it('shows no awaiting tile when nothing is unpaid', () => {
    component.subscriptions = [{ id: 2, status: 'true' }] as any;
    component.ngOnChanges();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid=awaiting-tile]')).toBeNull();
  });
});
