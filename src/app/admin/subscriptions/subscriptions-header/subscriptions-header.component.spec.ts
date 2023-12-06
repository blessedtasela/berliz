import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionsHeaderComponent } from './subscriptions-header.component';

describe('SubscriptionsHeaderComponent', () => {
  let component: SubscriptionsHeaderComponent;
  let fixture: ComponentFixture<SubscriptionsHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubscriptionsHeaderComponent]
    });
    fixture = TestBed.createComponent(SubscriptionsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
